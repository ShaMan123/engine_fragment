# Letting the app drive updates

Plan for handing control of model updates to the consumer. Written on 2026-10-08 against `main` at `2ba7e9d` (fragments 3.4.8); every line pointer below refers to that commit.

Context: [#300](https://github.com/ThatOpen/engine_fragment/issues/300) (forced updates coalesce inside the rate window), [#302](https://github.com/ThatOpen/engine_fragment/issues/302) (clipping planes held by reference), [#234](https://github.com/ThatOpen/engine_fragment/issues/234) (the worker loop no longer starts at construction), [#262](https://github.com/ThatOpen/engine_fragment/issues/262) (no mesh flush timer without a connection). Rakto renders on demand and today silences the idle loops by overriding the private `MeshManager._onUpdate` and patching `ThreadUpdater` in its `patches/@thatopen+fragments+3.4.7.patch`; 3.4.8 re-routed the main-thread poll so that override no longer reaches it.

## The four timers today

Main thread, in [index.ts](packages/fragments/src/FragmentsModels/index.ts):

1. [`update(force)`](packages/fragments/src/FragmentsModels/index.ts#L411) throttles on `maxUpdateRate` (100 ms). A throttled unforced call leaves one scheduled update behind ([:423](packages/fragments/src/FragmentsModels/index.ts#L423)); throttled forced calls coalesce into one trailing forced update ([:435](packages/fragments/src/FragmentsModels/index.ts#L435)).
2. [`performUpdate`](packages/fragments/src/FragmentsModels/index.ts#L452) calls every model's `_refreshView`, which [skips the worker message when the view signature is unchanged](packages/fragments/src/FragmentsModels/src/model/view-manager.ts#L78). Forced: waits on the [fence](packages/fragments/src/FragmentsModels/src/model/mesh-manager.ts#L133). Unforced: [drains queued tiles for 4 ms](packages/fragments/src/FragmentsModels/src/model/mesh-manager.ts#L235).
3. **Timer 1, the poll.** `performUpdate` always ends with [`scheduleNextUpdate()`](packages/fragments/src/FragmentsModels/index.ts#L476), which calls `update()` again after 101 ms ([:486](packages/fragments/src/FragmentsModels/index.ts#L486)). It never stops while a model is loaded.
4. **Timer 2.** Every tile applied calls `_onUpdate` ([mesh-manager.ts:231](packages/fragments/src/FragmentsModels/src/model/mesh-manager.ts#L231), [:241](packages/fragments/src/FragmentsModels/src/model/mesh-manager.ts#L241)), which is [`newUpdateEvent`](packages/fragments/src/FragmentsModels/index.ts#L518) and re-arms the same 101 ms timer. A FINISH drains everything at once ([handleFinish](packages/fragments/src/FragmentsModels/src/model/mesh-manager.ts#L185)).

Worker:

5. The request handler ([fragments-thread.ts:54-63](packages/fragments/src/FragmentsModels/src/multithreading/fragments-thread.ts#L54-L63)) only applies the request; a view is stored by [`refreshView`](packages/fragments/src/FragmentsModels/src/virtual-model/virtual-fragments-model.ts#L575).
6. **Timer 3.** [`ThreadUpdater`](packages/fragments/src/FragmentsModels/src/multithreading/thread-controllers/thread-updater.ts) is started when a model is created ([thread-model-creator.ts:81](packages/fragments/src/FragmentsModels/src/multithreading/thread-controllers/thread-model-creator.ts#L81)). It ticks at 0 ms while streaming and every 32 ms once settled ([:55](packages/fragments/src/FragmentsModels/src/multithreading/thread-controllers/thread-updater.ts#L55)), for as long as any model is loaded. It also ticks at 0 ms from model creation until the first view arrives, because a model without a view never reports settled ([virtual-fragments-model.ts:594](packages/fragments/src/FragmentsModels/src/virtual-model/virtual-fragments-model.ts#L594), [updateTiles](packages/fragments/src/FragmentsModels/src/virtual-model/virtual-controllers/virtual-tiles-controller.ts#L1332)).
7. **Timer 4.** [`MeshConnection`](packages/fragments/src/FragmentsModels/src/multithreading/mesh-connection.ts#L47) runs a `setInterval` every 16 ms per model to flush tile batches. While idle its body only checks an empty list.

## What the poll actually does

Timer 1 does two unrelated jobs in one `performUpdate`:

- **Detect view changes.** The [view signature](packages/fragments/src/FragmentsModels/src/model/view-manager.ts#L141) covers the camera frustum and position, fov, viewport size, `graphicsQuality`, the clipping planes array read by reference, and the model's `matrixWorld`. All of this is mutable three.js state with no change events. The library cannot observe it; only the app knows when it changed. This job needs either a poll or a report from the app.
- **Apply tile batches.** A batch arrival is already an event ([RequestsManager.add](packages/fragments/src/FragmentsModels/src/model/requests-manager.ts#L52) runs when the worker's message lands), yet nothing drains it except a FINISH or the next poll. Because every applied tile re-arms the poll, the next 4 ms slice is always 101 ms after the last applied tile. While a pass streams, the main thread applies tiles for at most one 4 ms slice per 101 ms, and the rest lands all at once at FINISH. The poll is not just redundant for this job, it throttles it.

The design below separates the two: tiles are applied when they arrive, and the poll only re-checks view signatures, as a safety net for apps that never call `update()`.

## Decisions

### 1. Worker timers are request-driven

Fixes, not settings. Every piece of worker work comes from a request, so the loop can stop when settled and restart on the next request.

- [thread-updater.ts:55-56](packages/fragments/src/FragmentsModels/src/multithreading/thread-controllers/thread-updater.ts#L55-L56): when every model is settled, set `_running = false` and return instead of scheduling the idle tick. Keep `schedule(0)` while streaming.
- [fragments-thread.ts:62](packages/fragments/src/FragmentsModels/src/multithreading/fragments-thread.ts#L62): call `controllerManager.updater.start()` after the awaited action, never before, so a 0 ms tick cannot settle the loop before an async handler installs its work. `start()` is idempotent and returns early while paused. The existing `start()` at model creation stays.
- [virtual-fragments-model.ts:594](packages/fragments/src/FragmentsModels/src/virtual-model/virtual-fragments-model.ts#L594): return `true` while `this.view` is undefined, so a model without a view counts as settled and the loop does not spin during load. `generate()` already yields with its own timers.
- [mesh-connection.ts:47](packages/fragments/src/FragmentsModels/src/multithreading/mesh-connection.ts#L47): replace the interval with a one-shot timer armed in [`process`](packages/fragments/src/FragmentsModels/src/multithreading/mesh-connection.ts#L69) when the list goes from empty to one item; [`refresh`](packages/fragments/src/FragmentsModels/src/multithreading/mesh-connection.ts#L75), the threshold flush and `dispose` clear it. Latency is unchanged. `MultithreadingHelper.newUpdater` and `deleteUpdater` ([:15](packages/fragments/src/FragmentsModels/src/multithreading/multithreading-helper.ts#L15), [:165](packages/fragments/src/FragmentsModels/src/multithreading/multithreading-helper.ts#L165)) have no other caller and go.
- `settings.threadUpdaterDelay` ([index.ts:155](packages/fragments/src/FragmentsModels/index.ts#L155)) is no longer read. Deprecate it the way `forceUpdateRate` was ([:111-118](packages/fragments/src/FragmentsModels/index.ts#L111-L118)).

### 2. Tile batches are applied on arrival

`MeshManager` owns a drain loop. When a batch lands, it applies a 4 ms slice, fires `onTilesUpdated`, and chains another slice only while the queue is non-empty. No timer exists while the queue is empty. `drainAll` on FINISH and for fences stays as it is. `FragmentsModels.update()` stops draining and means one thing: my view may have changed, send it, and with `force` wait until it has settled.

The yield between slices is a macrotask, not `requestAnimationFrame`. Draining is not rendering: it must yield to input, the app's own render and paint between slices, and run back to back when the loop is idle, regardless of visibility. `requestAnimationFrame` would cap throughput at one slice per frame, put our 4 ms inside the app's frame budget, show tiles a frame late whenever we land after the app's render, and halt streaming in a hidden tab as a side effect rather than through `pause()`. `queueMicrotask` is wrong because microtasks run before paint. `setTimeout(0)` works but the spec clamps nested timers to 4 ms after five levels, which halves the duty cycle of 4 ms slices; `MessageChannel.postMessage` is the unclamped macrotask and is available in Node. The first slice can run synchronously in the message handler, since the arrival is the trigger.

### 3. `UpdateManager` and `ThreadUpdater` own the scheduling

Today scheduling is spread over `FragmentsModels` (throttle, coalescing, poll), `MeshManager` (`_onUpdate` re-arms the poll), `ThreadUpdater` (the sweep), `MeshConnection` (the flush interval) and `ThreadModelCreator` (`start()`, the delay). Afterwards each side has one owner: `UpdateManager` on the main thread and `ThreadUpdater` on each worker. They talk only through messages: REFRESH_VIEW and CONTROL_UPDATES go down, tile batches come up. Decisions 1 and 4 list the line-level changes; this section is the shape they fit into. The drain loop stays in `MeshManager` (decision 2) because tile arrivals drive it, not the schedule.

The worker keeps driving its own sweep. Driving every tick from main would cost a round trip per 16 ms tick and stall streaming whenever the main thread is busy, which is when the app renders. `step()` covers apps that want that lockstep.

#### Main thread: `UpdateManager`

New class in `packages/fragments/src/FragmentsModels/src/model/update-manager.ts`, named like `ViewManager` and `MeshManager`. Everything from [index.ts:172-178](packages/fragments/src/FragmentsModels/index.ts#L172-L178) and [index.ts:411-532](packages/fragments/src/FragmentsModels/index.ts#L411-L532) moves into it:

- `update(force)` with the `maxUpdateRate` throttle, the trailing update for throttled unforced calls (both modes, so the last camera position always reaches the worker), and the forced coalescing from #300.
- The view poll, armed after each update only when `settings.autoRefreshView` is true and the manager is not paused. It compares signatures and sends nothing unless something changed.
- `pause()`, `resume()` and optionally `step()`, which forward to the worker half (see 4).
- `dispose()` clears the timers and releases forced waiters.

It reads `maxUpdateRate` and `autoRefreshView` live from the `settings` object so the public knobs stay where they are. `FragmentsModels` keeps `update(force)` as a one-line delegate and exposes the manager as `updater`. `newUpdateEvent` goes, and `MeshManager` loses its constructor argument (decision 2).

`settings.autoRefreshView` (default `true`) replaces the earlier `autoUpdate` name because it now governs only the view poll. The flag is read when the poll would be armed; switching it off stops the poll at its next tick, switching it on takes effect at the next `update()` call.

The trailing update and the poll share one timer, `_next`: "an `update()` is due at the end of the current window". Today they share `_autoRedrawInterval` already, but each throttled call pushes it a full window out; arming it once for the end of the window is enough, and it does not need re-arming while a forced update is pending, since that one sends the view too.

```ts
export class UpdateManager {
  private _lastUpdate = 0;
  private _next: ReturnType<typeof setTimeout> | null = null;
  private _forced: {
    promise: Promise<void>;
    resolve: () => void;
    timer: ReturnType<typeof setTimeout>;
  } | null = null;
  private _paused = false;
  private _step = 0;
  private _disposed = false;

  constructor(
    private readonly _settings: FragmentsModels["settings"],
    private readonly _models: MeshManager,
    private readonly _connection: FragmentsConnection,
  ) {}

  get paused() {
    return this._paused;
  }

  async update(force = false) {
    if (this._disposed) return;
    const wait =
      this._lastUpdate + this._settings.maxUpdateRate - performance.now();
    if (wait <= 0) return this.perform(force);
    if (force) return this.coalesceForced(wait + 1);
    this.arm(wait + 1);
  }

  pause() {
    if (this._paused) return Promise.resolve();
    this._paused = true;
    // A pending _next still fires, so the last view reaches the worker;
    // perform() just does not re-arm the poll after it.
    return this.control("pause");
  }

  resume() {
    if (!this._paused) return Promise.resolve();
    this._paused = false;
    const sent = this.control("resume");
    this.update(); // sends a view that changed while paused, re-arms the poll
    return sent;
  }

  step() {
    if (!this._paused) return Promise.resolve();
    return this.control("step", ++this._step);
  }

  dispose() {
    this._disposed = true;
    if (this._next !== null) clearTimeout(this._next);
    if (this._forced) {
      clearTimeout(this._forced.timer);
      this._forced.resolve();
      this._forced = null;
    }
  }

  private async perform(force: boolean) {
    this._lastUpdate = performance.now();
    this.disarm();
    const refreshes: Promise<void>[] = [];
    for (const model of this._models.list.values()) {
      refreshes.push(model._refreshView(force));
    }
    await Promise.all(refreshes);
    if (force) await this._models.forceUpdateFinish();
    if (this._settings.autoRefreshView && !this._paused) {
      this.arm(this._settings.maxUpdateRate + 1);
    }
  }

  private coalesceForced(delay: number) {
    if (!this._forced) {
      let resolve!: () => void;
      const promise = new Promise<void>((r) => (resolve = r));
      const timer = setTimeout(() => {
        this._forced = null;
        this.perform(true).then(resolve, () => resolve());
      }, delay);
      this._forced = { promise, resolve, timer };
    }
    return this._forced.promise;
  }

  private arm(delay: number) {
    if (this._next !== null || this._forced || this._disposed) return;
    if (this._models.list.size === 0) return;
    this._next = setTimeout(() => {
      this._next = null;
      this.update();
    }, delay);
  }

  private disarm() {
    if (this._next === null) return;
    clearTimeout(this._next);
    this._next = null;
  }

  // One message per model because requests are routed by modelId; the
  // worker side is idempotent. `seq: null` keeps the message out of the
  // fence: it never produces a FINISH, so a seq would raise the target of
  // a pending update(true) that nothing then meets.
  private control(action: "pause" | "resume" | "step", step?: number) {
    const sent: Promise<unknown>[] = [];
    for (const modelId of this._models.list.keys()) {
      sent.push(
        this._connection.fetch({
          class: MultiThreadingRequestClass.CONTROL_UPDATES,
          modelId,
          action,
          step,
          seq: null,
        }),
      );
    }
    return Promise.all(sent).then(() => {});
  }
}
```

`pause()`, `resume()` and `step()` return the sends, so an older worker that rejects `CONTROL_UPDATES` surfaces to a caller that awaits (decision 4). `seq: null` relies on [`FragmentsConnection.fetch`](packages/fragments/src/FragmentsModels/src/multithreading/fragments-connection.ts#L128-L133) stamping only `undefined` and the worker bumping `lastSeenSeq` only for numbers.

A model loaded while paused must start paused. Rather than a `pause` sent after the model joins the list (decision 4 as written), the CREATE_MODEL input carries `paused: updater.paused`, set where the request is built and outside the user-facing `VirtualMultithreadingConfig`, so both creation paths ([index.ts:258-266](packages/fragments/src/FragmentsModels/index.ts#L258-L266) and the delta model in [edit-helper.ts:235-241](packages/fragments/src/FragmentsModels/src/edit/edit-helper.ts#L235-L241)) get it without a list subscription (decision 5).

#### Worker: `ThreadUpdater`

Same class, reshaped. It has no idle tick and no delay; it ticks only while some model is unsettled. Its state is a pending tick or none, plus a `paused` flag:

- **Idle**: no timer. Reached when every model is settled (an empty list and a model without a view count as settled), or right away while paused.
- **Running**: one tick queued. A tick sweeps up to 16 ms round-robin as today, flushes, and queues the next tick only if something is still unsettled.
- **Paused**: ticks exit and `wake()` returns early. Requests are still applied and their output still flushed, so a forced update with an unchanged view settles while paused (the exception in decision 4).

What wakes it: every request, through one call at the end of [`FragmentsThread.handleInput`](packages/fragments/src/FragmentsModels/src/multithreading/fragments-thread.ts#L54-L63) (extracted from the connection handler, decision 1), in a `finally` so a failing raycast still leaves the loop correct. View changes, edits, visibility and highlight all restart a pass through that path, and a request that changed nothing finds every model settled and the tick goes idle at once. `resume()` and `step()` are the only other entries.

```ts
export class ThreadUpdater {
  private readonly _budget = 16;
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _paused = false;
  private _lastStep = 0;
  private _nextModelOffset = 0;

  constructor(private readonly _thread: FragmentsThread) {}

  // Called after every request. The flush ships what the request itself
  // produced (setupView's direct FINISH for an unchanged view), paused or
  // not; the wake makes sure a sweep follows.
  afterRequest() {
    this.flush();
    this.wake();
  }

  setPaused(paused: boolean) {
    if (paused) this.pause();
    else this.resume();
  }

  pause() {
    this._paused = true;
    this.cancel();
  }

  resume() {
    this._paused = false;
    this.wake();
  }

  // One bounded sweep while paused. Main sends one copy per model on this
  // worker; the id turns the extra copies into no-ops. afterRequest flushes.
  step(id: number) {
    if (!this._paused || id <= this._lastStep) return;
    this._lastStep = id;
    this.sweep();
  }

  dispose() {
    this.cancel();
  }

  private wake() {
    if (this._paused || this._timer !== null) return;
    this._timer = setTimeout(this._tick, 0); // the yield from decision 2
  }

  private cancel() {
    if (this._timer === null) return;
    clearTimeout(this._timer);
    this._timer = null;
  }

  private _tick = () => {
    this._timer = null;
    if (this._paused) return;
    const settled = this.sweep();
    this.flush();
    if (!settled) this.wake();
  };

  // Today's updateAllModels: rotates the start model and stops after
  // _budget ms. True only when every model was reached and reported settled.
  private sweep(): boolean {
    // ...
  }

  private flush() {
    for (const model of this._thread.list.values()) model.flushMeshes();
  }
}
```

`_updateDelay`, `setUpdateDelay` and `_running` go; `start()` becomes `wake()`, and the call at [thread-model-creator.ts:81](packages/fragments/src/FragmentsModels/src/multithreading/thread-controllers/thread-model-creator.ts#L81) is redundant with `afterRequest`. The creator calls `setPaused(input.paused)` where it calls `setUpdateDelay` today ([:31](packages/fragments/src/FragmentsModels/src/multithreading/thread-controllers/thread-model-creator.ts#L31)). `ThreadUpdateController` (decision 4) is a thin `ThreadController` that maps `action` to `pause()`, `resume()` or `step(input.step)`.

The tick yield is the same macrotask question as the drain loop in decision 2: a nested `setTimeout(0)` is clamped to 4 ms in workers too, which today costs a fifth of a streaming worker's time. Whatever helper decision 2 settles on is shared by both loops.

**The flush moves into the tick.** Every tile request a worker emits comes from a sweep, except the direct FINISH in [`setupView`](packages/fragments/src/FragmentsModels/src/virtual-model/virtual-controllers/virtual-tiles-controller.ts#L258-L260), which runs inside a request handler. Flushing at the end of every tick and after every request therefore ships everything, so `MeshConnection` needs no timer at all: it keeps `process()` with the threshold flush, gains a public `flush()`, and `clean()` stays. The tail of a pass (fewer than `meshConnectionThreshold` requests, including the final FINISH) ships when the tick ends instead of up to `meshConnectionRate` later. `meshConnectionRate` is then no longer read and is deprecated with `threadUpdaterDelay`. This goes one step past the one-shot timer in decision 1; see Open.

#### Who wakes whom

| Trigger | Main thread | Worker |
|---|---|---|
| App calls `update()` | Throttle, then REFRESH_VIEW for changed views. A throttled call arms `_next`. | `afterRequest`: view stored, flush, wake. |
| `_next` fires | `update()`. Re-armed only with `autoRefreshView` and not paused. | |
| Tick | | Sweep ≤ 16 ms, flush, wake again unless settled. |
| Batch lands | Drain slice, chained while pending, `onTilesUpdated` (decision 2). | |
| FINISH lands | `drainAll`, release fences. | |
| Edit, visibility, raycast | | `afterRequest`; sweeps if the request restarted a pass. |
| `pause()` | Poll stops at its next firing. CONTROL `pause`. | Cancel the tick. |
| `resume()` | CONTROL `resume`, then `update()`. | Wake. |
| `step()` | CONTROL `step` with a new id. | One sweep, flush. |
| Load while paused | CREATE_MODEL carries `paused`. | `setPaused` before the model registers. |

Idle, the main thread holds `_next` only with `autoRefreshView` on, and the worker holds no timer.

### 4. The worker can be paused

A new `MultiThreadingRequestClass.CONTROL_UPDATES` (after `ABORT_MODEL` at [model-types.ts:207](packages/fragments/src/FragmentsModels/src/model/model-types.ts#L207)) carries `action: "pause" | "resume" | "step"`, handled by a new `ThreadUpdateController` registered in [`ThreadControllerManager`](packages/fragments/src/FragmentsModels/src/multithreading/thread-controllers/thread-controller-manager.ts). On the worker, `ThreadUpdater` gains `paused`: the tick exits like "settled", `start()` returns early, and `resume()` is `start()`. Requests keep being applied while paused (a view is stored, edits land, raycasts answer); only the sweep that streams tiles halts, keeping its position, so `resume()` continues with the latest view.

- Requests are routed by `modelId` ([fragments-connection.ts:139](packages/fragments/src/FragmentsModels/src/multithreading/fragments-connection.ts#L139)), so the manager sends one request per loaded model and the worker side is idempotent. A `broadcast()` over the ports in [threads-data.ts:13](packages/fragments/src/FragmentsModels/src/multithreading/threads-data.ts#L13) would make it one per worker.
- A worker spawned while paused must start paused: the manager sends `pause` for a model when it is added to the list; the port is in order, so it lands after `CREATE_MODEL`.
- `update(true)` issued while paused keeps waiting. Its fence needs a FINISH that only the sweep can emit (except when the view is unchanged and the previous pass had finished, where [`setupView`](packages/fragments/src/FragmentsModels/src/virtual-model/virtual-controllers/virtual-tiles-controller.ts#L252-L260) emits one directly). Decided: do not skip the fence, document it.
- An older pinned worker rejects the unknown class; the rejection surfaces.
- `step()` is optional: paused plus one bounded tick gives lockstep mode where the app drives every worker tick. Per-model pause and a per-tick budget can ride the same message later.

### 5. Events are outbound only

`models.onTilesUpdated` is a public `Event<void>` fired once per slice or drain that applied at least one request. Nothing inside the library subscribes to it. [`Event`](packages/fragments/src/Utils/event.ts) keeps its handlers private but exposes `reset()`, `enabled` and `trigger()`, so a consumer can clear or mute any public event; an internal subscription would break silently. Internal plumbing is a direct call: [`handleRequest`](packages/fragments/src/FragmentsModels/src/model/requests-manager.ts#L32) already receives the mesh manager, so "batch arrived" and "FINISH seen" become calls on it and the `onFinish` callback field goes.

Existing instances of the hazard, for a separate follow-up: [fragments-model.ts:236-241](packages/fragments/src/FragmentsModels/src/model/fragments-model.ts#L236-L241) adds meshes to the scene and disposes them through `tiles.onItemSet` and `tiles.onBeforeDelete`; [mesh-manager.ts:94-100](packages/fragments/src/FragmentsModels/src/model/mesh-manager.ts#L94-L100) and [index.ts:200](packages/fragments/src/FragmentsModels/index.ts#L200) depend on `list` events.

### 6. Documentation

- `useClippingPlanes` now promises in-place edits are picked up by the next `update()` rather than "without calling this again", which was only true through the poll. Done on branch `fix/clipping-planes-same-ref`, together with a test that pins the unforced-refresh path; the previous tests forced every refresh, which skips the signature.
- CHANGELOG under Unreleased: a `### Features` entry for `autoRefreshView`, `updater`, `onTilesUpdated`, pause/resume; a `### Bug Fixes` entry for the idle worker timers; the `threadUpdaterDelay` deprecation.
- A new example `examples/OnDemandUpdates/` modelled on [ThreadGroups](packages/fragments/src/FragmentsModels/examples/ThreadGroups/example.ts), linked from [index.html](index.html#L31): manual renderer mode, `update()` from the camera events, `onTilesUpdated` to render, `pause()`/`resume()` on `visibilitychange`.

## The consumer interface

```ts
fragments.settings.autoRefreshView = false; // no view poll; call update() when your view changes
fragments.models.onTilesUpdated.add(() => {
  renderer.needsUpdate = true;
});
camera.controls.addEventListener("update", () => fragments.update());
camera.controls.addEventListener("rest", () => fragments.update(true));
document.addEventListener("visibilitychange", () =>
  document.hidden ? fragments.updater.pause() : fragments.updater.resume(),
);
```

With `autoRefreshView` left on, the only difference is that the library also polls the view signatures every `maxUpdateRate` ms, for apps that never call `update()`.

## PR sequence

1. `fix/clipping-planes-same-ref`: the test and doc change above. Done.
2. `fix: stop the worker timers when there is nothing to do`: decision 1. Tests: `thread-updater.test.ts` (fake timers, a stub thread whose models report settled or not: no timer after settling, `start()` ticks again, a model without a view counts as settled); a `FragmentsThread.handleInput` method extracted from the connection handler so a test can call it on a fresh instance; `mesh-connection.test.ts` (no timer idle, one after the first `process`, none after it fires, after a threshold flush, after `dispose`).
3. `feat: let the app drive updates`: decisions 2, 3, 5, 6. Tests: `update-manager.test.ts` in the style of [dispose-timers.test.ts](packages/fragments/src/FragmentsModels/dispose-timers.test.ts) (with the poll off, an update leaves no timer, a throttled call leaves exactly one, dispose releases forced waiters; with it on, today's behaviour is pinned); a mesh-manager drain test (a batch arrival schedules a slice, slices chain while pending, nothing is scheduled when idle, `onTilesUpdated` fires once per slice). The fence tests construct `new MeshManager(() => {})` ([mesh-manager-fence.test.ts:13](packages/fragments/src/FragmentsModels/src/model/mesh-manager-fence.test.ts#L13)) and lose the argument; [dispose-timers.test.ts:22](packages/fragments/src/FragmentsModels/dispose-timers.test.ts#L22) pokes the private `_onUpdate` and changes with it.
4. `feat: pause and resume the worker sweep`: decision 4. Tests: `thread-updater.test.ts` pause, resume and step cases; a controller test for `CONTROL_UPDATES`; an `UpdateManager` test that a model added while paused is sent `pause`.

CONTRIBUTING asks for an issue first; one issue can frame 2 to 4.

## Rakto afterwards

- The `_onUpdate` override in `packages/frontend/src/Model/ModelAPI.ts` becomes `models.onTilesUpdated` plus `autoRefreshView: false`.
- The `ThreadUpdater` and `FragmentsThread` hunks of `patches/@thatopen+fragments+3.4.7.patch` go. The `getItemsWithoutDrawChunks` and geometry-hash hunks are unrelated and stay.
- The `maxUpdateRate` lift in `refreshFragments` is unnecessary since the forced coalescing landed; removing it means forced calls wait up to one window.

## Open

- Final name of the setting: `autoRefreshView` proposed, `pollViewChanges` if the mechanism should be in the name.
- `MessageChannel` versus `setTimeout(0)` for the slice yield, and with it for the worker tick (section 3).
- Whether an app should be able to take over draining (slices aligned to its own frame). Not in scope; the arrival-driven loop leaves room for a later `applyPending(budget)`.
- The three existing internal subscriptions to public events.
- Flush at the end of each tick (section 3) or a one-shot timer per model (decision 1). The tick removes the last per-model timer and `meshConnectionRate`; the one-shot timer is the smaller change for PR 2 and keeps the setting meaningful. If the tick wins, decision 1's `MeshConnection` bullet and the `mesh-connection.test.ts` cases in PR 2 change with it.
- How a new worker starts paused: a `paused` field on CREATE_MODEL (section 3) or a `pause` sent once the model joins the list (decision 4). The field needs no list hook and leaves no window between the two messages.
- Any RPC dispatched while `update(true)` awaits its refreshes, such as a raycast or a box fetch, raises the fence target the way a control message would. If the pass had already finished, no FINISH arrives to meet it until the view changes. Control messages avoid it with `seq: null`; whether raycasts already hang this way needs a test.
