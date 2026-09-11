# Changelog

## Unreleased

### Bug Fixes

* `setSample()` passed `high === 0` (a highlight-derived value, true for almost every non-highlighted sample) as the `visible` argument to `updateTile()`, instead of the method's own `vis` parameter (the real value `VisibilityHelper.setVisible()`/`toggleVisible()` compute from `model.itemConfig`). On models where the affected samples' LOD state doesn't otherwise change on the same tick, this means a `setVisible()`/`toggleVisible()` call updates the model's own visibility state (`getVisible()` reflects it correctly) without ever updating the corresponding tile's rendered geometry - most reliably observed on large (10k+ item) models, where the correct LOD-driven `updateVisible()` path is less frequently re-entered for the same samples than on small models.
* Reuse identical preserved highlight materials across items and repeated updates, while keeping depth, transparency and inheritance settings distinct.
* Settle forced updates when the scene is empty or the last model is removed, without waiting for a worker FINISH that can no longer arrive.

### ⚠ BREAKING CHANGES

* `split`/`extract`: have become `async`, have changed signature (including return types) and are scoped under `IfcSplitter`, exposed events (`onProgress`, `onSplitsResolved`, `onExtractWarning`) instead of console logs.
* `extract` now throws if no targets to extract were found, instead of logging and returning without producing an output file
* `split` now throws a `RangeError` unless `numGroups` is a positive integer. The previous 32-group ceiling is gone: group membership is no longer stored as a `1 << g` bitmask, so any number of splits is supported (bounded in practice by the process' open file descriptor limit, one per group).
* `@thatopen/fragments` now requires node `>=20.11.0` (`fs.openAsBlob`, global web streams)

## [3.3.2](https://github.com/ShaMan123/engine_fragment/compare/v3.4.0...v3.3.2) (2026-09-11)


### Features

* add all ifc metadata info to fragments ([6fb2e6c](https://github.com/ShaMan123/engine_fragment/commit/6fb2e6ccf841f526265b4e9b30090d0303860964))
* add back-reference in civil items ([880c21d](https://github.com/ShaMan123/engine_fragment/commit/880c21dda216a3d95d6c86818fb577736277bcdd))
* add check for cached fragment files ([d9e7dde](https://github.com/ShaMan123/engine_fragment/commit/d9e7ddeb8242598c434f126acdc33399730870db))
* add contributing guide ([908eea0](https://github.com/ShaMan123/engine_fragment/commit/908eea0a59a2eabe0cd00df86d44aa98e594eb00))
* add crs support ([304d56b](https://github.com/ShaMan123/engine_fragment/commit/304d56b61e9d8d1d2a74ff0176d779345399c61d))
* add edit API to SingleThreadedFragmentsModel ([864dc23](https://github.com/ShaMan123/engine_fragment/commit/864dc237a140ebb5fd1f9d12d17f408275049e60))
* add frag load progress callback ([ac639f9](https://github.com/ShaMan123/engine_fragment/commit/ac639f9715e85d87dc5c17e42d5352d38b661bed))
* add getCoordinationMatrix method to FragmentsModel ([bd09ace](https://github.com/ShaMan123/engine_fragment/commit/bd09ace0aa48a4bd1edfb02d270cc0fd320bc64f))
* add ifc bridge part to default ifc elements ([1468c6d](https://github.com/ShaMan123/engine_fragment/commit/1468c6d4ed5aed77ccfd2bf88c218d1f911c434f))
* add ifc file splitter and extractor ([f5ee358](https://github.com/ShaMan123/engine_fragment/commit/f5ee35807f566eff83ae732568ba6ede9727ad5b))
* add ifc road to ifc element list ([5b6fec9](https://github.com/ShaMan123/engine_fragment/commit/5b6fec9b104ee9a61bb5247d01df40385cd0d77a))
* add logic to traverse curves and alignments ([cb73524](https://github.com/ShaMan123/engine_fragment/commit/cb73524816ceadb0629ba001c4ffb326ce54428b))
* add methods to traverse properties ([40f0891](https://github.com/ShaMan123/engine_fragment/commit/40f0891fd963153607cc09cde530f413469f3873))
* add more civil data to fragments ([92bc3b9](https://github.com/ShaMan123/engine_fragment/commit/92bc3b931713b3e782d1f5c38dde1c9cf89b560e))
* add more methods to single threaded fragments model ([fe43e1a](https://github.com/ShaMan123/engine_fragment/commit/fe43e1ad2776c8e92cc8885b640b40dcd17b73fa))
* add more property methods ([1757358](https://github.com/ShaMan123/engine_fragment/commit/1757358dc17c3e180ea245c470ab487c775dfbb7))
* add streamed property caching ([9cff742](https://github.com/ShaMan123/engine_fragment/commit/9cff742ef4bc089f7731d1067c4af4e6a242650f))
* add units classes ([#69](https://github.com/ShaMan123/engine_fragment/issues/69)) ([325e0fa](https://github.com/ShaMan123/engine_fragment/commit/325e0fac1cd529750b14fde17331455aa5adb4d0))
* add VirtualMultithreadingConfig ([#194](https://github.com/ShaMan123/engine_fragment/issues/194)) ([ebd7750](https://github.com/ShaMan123/engine_fragment/commit/ebd7750032cad5fde842087292f3828e8b17612a))
* allow custom streaming function ([c820d3d](https://github.com/ShaMan123/engine_fragment/commit/c820d3d43e244f12eab0227ab4c58923eb729ba2))
* allow file as response type for tiles fetching ([a372ad8](https://github.com/ShaMan123/engine_fragment/commit/a372ad88e0c732bc0d0854f54b1c60702702baa6))
* allow to copy fragmentmaps ([ab138d6](https://github.com/ShaMan123/engine_fragment/commit/ab138d605e8a55eaaa064b627ee4a7e1213ccbb7))
* allow to customize the property files name ([53253a5](https://github.com/ShaMan123/engine_fragment/commit/53253a583d1e15f4bdf9d111a65efaa772d7eb67))
* allow to disable guard to ignore objects far away from the origin ([50c837c](https://github.com/ShaMan123/engine_fragment/commit/50c837c126d437f1aa6fee801db02b622c13c6c1))
* allow to get items chunks ([d65be31](https://github.com/ShaMan123/engine_fragment/commit/d65be31ab52d5c7963726b398c039bf4c5fc09fa))
* allow to load all categories and relations ([0ee5da1](https://github.com/ShaMan123/engine_fragment/commit/0ee5da15aa6918ec2b88493117686ae27c487f47))
* allow to return all raycast results ([7012998](https://github.com/ShaMan123/engine_fragment/commit/701299806cb3462ba0163dd1802f3730b2c7dfc3))
* allow to return whole fragment id map for fragments group ([01bc12f](https://github.com/ShaMan123/engine_fragment/commit/01bc12f043f179719285a54c453c033e4a6d03a9))
* check that items to hide or show exist ([e54593f](https://github.com/ShaMan123/engine_fragment/commit/e54593fb7075724c319c904f517371d07652e838))
* create binary parser for streamed geometry ([65de359](https://github.com/ShaMan123/engine_fragment/commit/65de3590e7992434de5a5725305b571c8e7b787c))
* **docs:** implement typedoc config ([#13](https://github.com/ShaMan123/engine_fragment/issues/13)) ([e5baf19](https://github.com/ShaMan123/engine_fragment/commit/e5baf19bd1a70476eb9353c6e050ee49abda6807))
* **edit:** add CREATE/UPDATE/DELETE_INDEX edit requests ([f8aa07f](https://github.com/ShaMan123/engine_fragment/commit/f8aa07f61805b93b19f6912eb36f3b079d777198)), closes [#164](https://github.com/ShaMan123/engine_fragment/issues/164)
* **editor:** add createIndex/updateIndex/deleteIndex convenience methods ([a17707e](https://github.com/ShaMan123/engine_fragment/commit/a17707e323789219bedf78b2649b268a70a15eda)), closes [#164](https://github.com/ShaMan123/engine_fragment/issues/164)
* enhance geometry retrieval methods in FragmentsModel ([f843334](https://github.com/ShaMan123/engine_fragment/commit/f843334baa89d3c6729058112e7be4cc2ec23aa1))
* enhance IfcImporter with configuration to define classes and relations to process ([6c44b59](https://github.com/ShaMan123/engine_fragment/commit/6c44b597f35ee11525df4d081e429e8ac7e186ef))
* expose getLocalIdsFromItemIds on the public model API ([18742ff](https://github.com/ShaMan123/engine_fragment/commit/18742ff96dafc307d25bea3abe0cca13ef2c7e5f))
* expose web-ifc config ([98cb3f3](https://github.com/ShaMan123/engine_fragment/commit/98cb3f35fe53a2b89105e4ffab77f76e0fe0fad8))
* fix setVisibility type ([469d21a](https://github.com/ShaMan123/engine_fragment/commit/469d21ab6475b3b474ad51fe85816524988d9737))
* fix tutorials paths ([7496f56](https://github.com/ShaMan123/engine_fragment/commit/7496f562ab7f5a24e2e23348ce64f0355ca4b701))
* force ifc spaces to be transparent by default ([2bdd447](https://github.com/ShaMan123/engine_fragment/commit/2bdd44792f49b96d38ef807ee58ba9f96c8a332d))
* **FragmentsModels:** auto-detect raw vs deflated buffers ([041531f](https://github.com/ShaMan123/engine_fragment/commit/041531fb4bf999b5b959f90da51dad569b6706ef)), closes [#213](https://github.com/ShaMan123/engine_fragment/issues/213)
* **FragmentsModels:** shared IFragmentsModel interface across model types ([#227](https://github.com/ShaMan123/engine_fragment/issues/227)) ([3ccce85](https://github.com/ShaMan123/engine_fragment/commit/3ccce850303ddb72843133d3e04a86b4e19c2098))
* **fragments:** new method in FragmentsGroup ([#9](https://github.com/ShaMan123/engine_fragment/issues/9)) ([45c1aae](https://github.com/ShaMan123/engine_fragment/commit/45c1aae18f7f2093feb765a99a51bf792292a60c))
* full uint32 localId range in tile id attribute ([fe11440](https://github.com/ShaMan123/engine_fragment/commit/fe11440b702850769bf94f18e983ec51345a9bef))
* **grids:** stamp userData kinds and expose grid material ([e383064](https://github.com/ShaMan123/engine_fragment/commit/e38306467edafa18000142676d4ceb692ffca42f)), closes [#192](https://github.com/ShaMan123/engine_fragment/issues/192)
* **ifc-importer:** include IFC4x3 alignment layouts in the spatial structure ([#743](https://github.com/ShaMan123/engine_fragment/issues/743)) ([c094e73](https://github.com/ShaMan123/engine_fragment/commit/c094e73aa0ef6c1eb67a9f63a7a7bd223f9d8ccd))
* **IfcImporter:** add doubleSidedMaterials option ([7f679ba](https://github.com/ShaMan123/engine_fragment/commit/7f679ba5fc5dd55ab3afaf8b101f054e13635fb3)), closes [#233](https://github.com/ShaMan123/engine_fragment/issues/233)
* implement fragment cloning ([88cd07b](https://github.com/ShaMan123/engine_fragment/commit/88cd07b3a8151250fc8eb6da4d773f07345fabcd))
* implement grids ([3b19a28](https://github.com/ShaMan123/engine_fragment/commit/3b19a28d448ce882ae9de768f2523082fc3dd249))
* implement highlights for lod ([063293d](https://github.com/ShaMan123/engine_fragment/commit/063293d59b5123964145fb3df91e9cdbbb3d4118))
* implement lod mode ([95bb163](https://github.com/ShaMan123/engine_fragment/commit/95bb163e5b1b38cba04f04a65dc0b05c59b50239))
* implement model load abort ([bddbcfc](https://github.com/ShaMan123/engine_fragment/commit/bddbcfc7cfc5266cc5c311c19ae51caa0d22522a))
* implement more ifc properties cases ([b6ed3c1](https://github.com/ShaMan123/engine_fragment/commit/b6ed3c1b007e9f851f661d2d63bd583e4ecea0c0))
* implement multi version flatbuffer ([c53ac59](https://github.com/ShaMan123/engine_fragment/commit/c53ac590ab69c5725b6ef4e124fa2e7660bf1741))
* implement optional traditional workers ([f976443](https://github.com/ShaMan123/engine_fragment/commit/f97644314ba0b8b19ff671760d5c1dbfc638f015))
* implement worker control ([c5fac67](https://github.com/ShaMan123/engine_fragment/commit/c5fac678c41a586b02b0c527227887bd7f65e208))
* implements vertices retrieval logic in Fragment and FragmentsGroup ([3450b13](https://github.com/ShaMan123/engine_fragment/commit/3450b13c280f5cb728ff14a153d020c737974adf))
* improve behavior when getting all fragments ([da3843f](https://github.com/ShaMan123/engine_fragment/commit/da3843f06fa9a32ecba68f142512f89f20abd4de))
* improve civil items ([8ce4641](https://github.com/ShaMan123/engine_fragment/commit/8ce46412aaea3588236ad28f818f6e87ea1f83d9))
* improve FragmentsGroup type ([2768f33](https://github.com/ShaMan123/engine_fragment/commit/2768f33e4f880f3b6fcfaca653f04ce0cb9b20f2))
* improve reset color logic ([f6b4bde](https://github.com/ShaMan123/engine_fragment/commit/f6b4bde8527f32dbcaad9d130746c72effc19421))
* improve worker fetch logic ([d03b6a0](https://github.com/ShaMan123/engine_fragment/commit/d03b6a063a7e7536c687c6b12e8c08aadbce1ba4))
* inject ifc splitter dependencies ([1cc799b](https://github.com/ShaMan123/engine_fragment/commit/1cc799b15fb0110e8a33c0eb3617ab3980911661))
* itemId-keyed snap fetch + picker encoding ([0f48bb6](https://github.com/ShaMan123/engine_fragment/commit/0f48bb62da6463f2988aeb3c1bedb2e99a479e15))
* **main:** set up new fragments ([67da61d](https://github.com/ShaMan123/engine_fragment/commit/67da61dfa96d9b0292a0651d95113fb87507e77e))
* make color per item editable ([475f209](https://github.com/ShaMan123/engine_fragment/commit/475f209f3ac20a3f499391c4c44751762e0b4289))
* make fragmentsgroup properties protected ([787ede6](https://github.com/ShaMan123/engine_fragment/commit/787ede6c3cb5089078609f96fb3ac963f402cebf))
* make fragmentutils ([e68abea](https://github.com/ShaMan123/engine_fragment/commit/e68abea8e9a8f881fc567afed4215d11c8f7885f))
* make geometry id a number ([bfffee6](https://github.com/ShaMan123/engine_fragment/commit/bfffee6d56b41ab2ae31f2beab0936af818684bb))
* make intersect fragmentidmaps ([7f3fb30](https://github.com/ShaMan123/engine_fragment/commit/7f3fb30c84b34a16e640f510160635b48309fdab))
* make property streaming more flexible ([5156341](https://github.com/ShaMan123/engine_fragment/commit/5156341dc055dc8e6ce05d135366e02f5f9b5a7c))
* make streamed properties non-zipped ([c5e6eb2](https://github.com/ShaMan123/engine_fragment/commit/c5e6eb2d7d24eb8c95316867e6763cb2c4c058a8))
* make streamed property db optional and disabled by default ([1779e8f](https://github.com/ShaMan123/engine_fragment/commit/1779e8fb36b9d7c2a72eec2c55cd2bf1ce032782))
* make worker url optional ([a99d069](https://github.com/ShaMan123/engine_fragment/commit/a99d06981be223b0cb2b0b13b1f300592024a22f))
* **materials:** add depthWrite property to MaterialDefinition ([#145](https://github.com/ShaMan123/engine_fragment/issues/145)) ([391f9dc](https://github.com/ShaMan123/engine_fragment/commit/391f9dc1e1ccf2e9b12987ffb430ae0b144cd551))
* **materials:** add setColor/setOpacity with resetColor/resetOpacity methods ([#137](https://github.com/ShaMan123/engine_fragment/issues/137)) ([db73877](https://github.com/ShaMan123/engine_fragment/commit/db73877a88210104814b1b1c4e92fd568569ee30))
* misc release updates ([42e963a](https://github.com/ShaMan123/engine_fragment/commit/42e963a57b3cf3ba61d83224ee3334b67f28dcdf))
* **model:** add VirtualIndexesController ([049a057](https://github.com/ShaMan123/engine_fragment/commit/049a057d52921bc8d1cd859d3097c94cedcd602b)), closes [#164](https://github.com/ShaMan123/engine_fragment/issues/164)
* **model:** expose user-defined index reads on FragmentsModel ([4a33282](https://github.com/ShaMan123/engine_fragment/commit/4a33282195f19bbc3dc81994175a2ed7a60edfe6)), closes [#164](https://github.com/ShaMan123/engine_fragment/issues/164)
* **model:** make index reads see pending edits ([5a08811](https://github.com/ShaMan123/engine_fragment/commit/5a08811c5534940bc48e01ff6a31e1b0b91a9029)), closes [#164](https://github.com/ShaMan123/engine_fragment/issues/164)
* multiple fixes, data tools, alignment tools ([4224a3c](https://github.com/ShaMan123/engine_fragment/commit/4224a3c0cfc2cdc4fa5a86d74afaf6b74c88ca0d))
* provide both minified and non-minified build ([c6ff41f](https://github.com/ShaMan123/engine_fragment/commit/c6ff41fde9464087e6a628566728a3397996514e))
* release edit api ([f8b23b1](https://github.com/ShaMan123/engine_fragment/commit/f8b23b15e7e796722ef18d7bd3634fe727c19daa))
* remove merged fragments ([dfbffc6](https://github.com/ShaMan123/engine_fragment/commit/dfbffc6c7d470eb4e5f35ba6439475cfca78737e))
* remove merged fragments ([8f44513](https://github.com/ShaMan123/engine_fragment/commit/8f445132ad751452c1bb1f1932573d7f4f6a35f3))
* remove stringify from fragment map serializer ([092b24b](https://github.com/ShaMan123/engine_fragment/commit/092b24b560e1a18e80b16a0b620362efbe8286fa))
* reset yarn.lock ([2f91f2f](https://github.com/ShaMan123/engine_fragment/commit/2f91f2f109298c3344a095e0c65b83ba77493c95))
* restore BVH ([096172c](https://github.com/ShaMan123/engine_fragment/commit/096172cd894a6121f9b0b78c263611be910ceff1))
* restructure repo, add package to thatopen org ([46b3429](https://github.com/ShaMan123/engine_fragment/commit/46b34293fef7d69e1d6b63f66ccd6e42f4aaa8df))
* **schema:** add ModelIndex table for user-defined lookups ([fd52cbc](https://github.com/ShaMan123/engine_fragment/commit/fd52cbce2e6e6bddbd740f788f1d39f1fb44d39b)), closes [#164](https://github.com/ShaMan123/engine_fragment/issues/164)
* skip big meshes for shell generation ([4fae6d3](https://github.com/ShaMan123/engine_fragment/commit/4fae6d335c63a4dedb80c428a25334607a34307e))
* **split:** return map of file paths to localIds ([#195](https://github.com/ShaMan123/engine_fragment/issues/195)) ([cf6345b](https://github.com/ShaMan123/engine_fragment/commit/cf6345ba9ce67c6fef9b56e29ab653042a6b84f2))
* store localId in tile geometry id attribute ([7c69110](https://github.com/ShaMan123/engine_fragment/commit/7c69110bef484f648c679be73399ac34b197396e))
* support distinction between streamed/non-streamed groups ([88be54b](https://github.com/ShaMan123/engine_fragment/commit/88be54b542fccf3e639c66e898f17c9ad7ae7f93))
* **test commit:** try submitting empty commit ([#5](https://github.com/ShaMan123/engine_fragment/issues/5)) ([3b717ca](https://github.com/ShaMan123/engine_fragment/commit/3b717caa4bae77c39cef44a4ab4230ca819ffeeb))
* track visible items ([6804110](https://github.com/ShaMan123/engine_fragment/commit/680411030ddb39d5ca64354538a31a688655a53e))
* update patch version ([819d749](https://github.com/ShaMan123/engine_fragment/commit/819d749aea0dc8a0abe68809bc9c3f0f80d29f5e))


### Bug Fixes

* **`getShellData`:** bbox + raw shell not respecting `settings.precision` ([#212](https://github.com/ShaMan123/engine_fragment/issues/212)) ([6c67266](https://github.com/ShaMan123/engine_fragment/commit/6c672661e2727d4b5bea783e9bafe42d2289bf9d))
* add geometry id after start creating geometry ([9d3f601](https://github.com/ShaMan123/engine_fragment/commit/9d3f6011150970f97559f2ba6925df31a1bb2973))
* add getItemCategory wrapper to the virtual model ([#267](https://github.com/ShaMan123/engine_fragment/issues/267)) ([a95c679](https://github.com/ShaMan123/engine_fragment/commit/a95c679ac26e8529db98dddedde6515e39521b33))
* add guard for circular extrusions ([c08d5ac](https://github.com/ShaMan123/engine_fragment/commit/c08d5acd48cefa590083eb11fda418da8d84c9b5))
* add guard for geometry disposal (was failing when streaming) ([9588048](https://github.com/ShaMan123/engine_fragment/commit/95880486e5f657a0c6c9267cfb2bda3f9d02a12b))
* add guard to dispose bounds tree ([e161a3c](https://github.com/ShaMan123/engine_fragment/commit/e161a3c3c8b17393994effde7c501d6f253d0350))
* add index to curves edges geometry ([32c0ec7](https://github.com/ShaMan123/engine_fragment/commit/32c0ec70c8f8f9d9aea6dd7c4880091d62154d7b))
* add old frags files to prevent conflict with components ([4544747](https://github.com/ShaMan123/engine_fragment/commit/4544747e12a019efbf29667127b196d72899762a))
* adjust add items behavior ([a93a7fb](https://github.com/ShaMan123/engine_fragment/commit/a93a7fb85dd499db8f6c3b1c9622d8c05cd0a631))
* **alignments:** dispose all alignment geometries and materials instead of throwing ([#235](https://github.com/ShaMan123/engine_fragment/issues/235)) ([22b0bde](https://github.com/ShaMan123/engine_fragment/commit/22b0bdea5c07d1f91d827dabc48c9755979d955a))
* await set up model ([d86d799](https://github.com/ShaMan123/engine_fragment/commit/d86d79952f4b0bfde590bea938a56b5c52ab0a0c))
* awaitable setup and clean disposal for SingleThreadedFragmentsModel ([#261](https://github.com/ShaMan123/engine_fragment/issues/261), [#262](https://github.com/ShaMan123/engine_fragment/issues/262)) ([2dd1748](https://github.com/ShaMan123/engine_fragment/commit/2dd17489e124d6fe0ee8af2835adba7d3424cc28))
* build GeometryProcessSettings jsdoc into types ([#226](https://github.com/ShaMan123/engine_fragment/issues/226)) ([d4839d2](https://github.com/ShaMan123/engine_fragment/commit/d4839d23babb2a0fc5a94681a8f93e80b9f32a83))
* build repo before publish ([57b9d95](https://github.com/ShaMan123/engine_fragment/commit/57b9d95296d0ba28aee1fa441b350b8f85daa72c))
* cap the tile cache per worker ([217b9b0](https://github.com/ShaMan123/engine_fragment/commit/217b9b05da7d7e7fb54f01532715a0f441a9f6a8))
* collectDeps no longer reports nonexistent ids ([ae6b024](https://github.com/ShaMan123/engine_fragment/commit/ae6b024d5b64dd2417445204d09af4a31ee8ba43))
* compact tile indices into one draw range per tile ([9db04dd](https://github.com/ShaMan123/engine_fragment/commit/9db04dd66faa0ae42e166e9dc566ba7ef7e12cc5))
* correct await force update behavior ([92b7f8d](https://github.com/ShaMan123/engine_fragment/commit/92b7f8d99d50caa302f68265a9ad1f01280d539b))
* correct boolean operation bug ([8bc50a7](https://github.com/ShaMan123/engine_fragment/commit/8bc50a7c4493a11d13983d6e2e47a154b26a2d33))
* correct bug when editing newly created items ([381eb46](https://github.com/ShaMan123/engine_fragment/commit/381eb463925b06662fec7399aab966b8ca5676f7))
* correct civil getPoint when percentage = 1 ([e68330b](https://github.com/ShaMan123/engine_fragment/commit/e68330bf133e45114ba29b62fda68879866d3809))
* correct deduplication algo bug ([081a1a9](https://github.com/ShaMan123/engine_fragment/commit/081a1a9287f7dfb95094e648016ce4f9742e3338))
* correct docs that break docusaurus ([7ff557c](https://github.com/ShaMan123/engine_fragment/commit/7ff557c620e7df59db807fcbc8908b8f5cd57e91))
* correct edge case when editing fragments ([282eb0b](https://github.com/ShaMan123/engine_fragment/commit/282eb0b5dc3b2e994ddd24ea8237c7af194333d7))
* correct edit id conter behavior ([fb9b907](https://github.com/ShaMan123/engine_fragment/commit/fb9b907ac36ae3cb977526efb76d90d020730283))
* correct edit visibility logic ([e1a94ef](https://github.com/ShaMan123/engine_fragment/commit/e1a94efc5985f21f9b59d6f97f6bb2c86c766d8c))
* correct editing newly created elements ([663351d](https://github.com/ShaMan123/engine_fragment/commit/663351d755c8df4f5edbf3ca7e3074dcc2ebac2e))
* correct error when fetching all items of type ([fc3f701](https://github.com/ShaMan123/engine_fragment/commit/fc3f7016798feb3c6b98d05350806543ecec6a23))
* correct error when importing certain relations ([14aea10](https://github.com/ShaMan123/engine_fragment/commit/14aea10c5e118fc800919e74b730a5f4a05e236c))
* correct fragment resize ([58d894c](https://github.com/ShaMan123/engine_fragment/commit/58d894c36241399ccb6f2e835101818ea78d8aa2))
* correct grid edge case ([a1fe6f8](https://github.com/ShaMan123/engine_fragment/commit/a1fe6f83edc422cb16e621d17acbfa43e2a440fa))
* correct importer fragmentsgroup data error ([4ec3e3e](https://github.com/ShaMan123/engine_fragment/commit/4ec3e3e5f2f587f7443b0de97f2f2ab2471012e3))
* correct metadata failing with empty values ([081f296](https://github.com/ShaMan123/engine_fragment/commit/081f296fb7cdbe11d2431d2f7a8df1005ec434a5))
* correct property fetching logic ([2bf0e9d](https://github.com/ShaMan123/engine_fragment/commit/2bf0e9daac98176c3b3153b413993096070b2e51))
* correct raycasting frustum calculation for orthographic cameras ([#136](https://github.com/ShaMan123/engine_fragment/issues/136)) ([cf0b8fc](https://github.com/ShaMan123/engine_fragment/commit/cf0b8fc6ea749549598f8e7e4ccaf4e7fcd47e0c))
* correct raycasting frustum for ortho camera ([fda0eca](https://github.com/ShaMan123/engine_fragment/commit/fda0eca55130e7f1ae780ffaf8e6b855fa61572b))
* correct small harmless error in ifc importer ([2e9a276](https://github.com/ShaMan123/engine_fragment/commit/2e9a27615751f259093eff510b988f4dfbea64aa))
* correct typo ([3cbdebd](https://github.com/ShaMan123/engine_fragment/commit/3cbdebd1055eabfd8e4d20897bbef599df6a5fd0))
* correct various bugs when getting edited items data ([e39a652](https://github.com/ShaMan123/engine_fragment/commit/e39a652d529e931d1ff61ec506427e067180385d))
* correct various edit bugs ([363318e](https://github.com/ShaMan123/engine_fragment/commit/363318e095dd3730a843dadc87620704d589759f))
* correct visibility control when using all_visible ([b1b32d4](https://github.com/ShaMan123/engine_fragment/commit/b1b32d4241b2ef435ff5078d89a1afb7aaf79344))
* correct worker url ([162f083](https://github.com/ShaMan123/engine_fragment/commit/162f083a225195c06ea1201162a5115172f8df10))
* deliver both minified and non-minified code ([2ebcbe5](https://github.com/ShaMan123/engine_fragment/commit/2ebcbe5fa1f673add5b5ab2f1f39ff4bddb68bd5))
* depth bias fields on MaterialDefinition to resolve coplanar z-fighting ([#266](https://github.com/ShaMan123/engine_fragment/issues/266)) ([caba371](https://github.com/ShaMan123/engine_fragment/commit/caba371731874e95b00514b4d180a2952072c7b1))
* dispose user data when disposing a fragment ([f656574](https://github.com/ShaMan123/engine_fragment/commit/f6565745ed225d0af70f5e2dd99cc04f2fc626f6))
* don't cull geometry before a camera is set ([43b1f9c](https://github.com/ShaMan123/engine_fragment/commit/43b1f9ccbd0fbd2500b00b51a5c0419d6888bc5b)), closes [#255](https://github.com/ShaMan123/engine_fragment/issues/255)
* **editor:** swap models in save() without blank-frame flicker ([#208](https://github.com/ShaMan123/engine_fragment/issues/208)) ([6a4391b](https://github.com/ShaMan123/engine_fragment/commit/6a4391b6279d3443de606505cf5aecc3deddc0f4))
* eliminate visual blink during delta model edits ([0163621](https://github.com/ShaMan123/engine_fragment/commit/01636210b07d6a6ec03e1273fca4324627a0500b))
* ensure guard function is defined before validation in DataSet.add method ([e127a0d](https://github.com/ShaMan123/engine_fragment/commit/e127a0d949dfadec109dc76b5e6723174503e8b0))
* fill tiles sorted by size ([e190daf](https://github.com/ShaMan123/engine_fragment/commit/e190dafc5a62c4d8accebeaaf016937ed0739249))
* **FragmentsModels:** geometry-accurate rectangleRaycast selection ([705ea90](https://github.com/ShaMan123/engine_fragment/commit/705ea905b5a093faa71e181777b1e313d7b00b9b)), closes [#229](https://github.com/ShaMan123/engine_fragment/issues/229)
* **FragmentsModels:** keep per-item highlight colors in LOD/WIRES view ([29d6179](https://github.com/ShaMan123/engine_fragment/commit/29d61794367417be215891f485c184fbf5621f7f)), closes [#230](https://github.com/ShaMan123/engine_fragment/issues/230)
* **FragmentsModels:** stop ThreadUpdater idle timer leaking on import ([9985277](https://github.com/ShaMan123/engine_fragment/commit/99852770795c58657347f8d961d7d285cc97d578)), closes [#234](https://github.com/ShaMan123/engine_fragment/issues/234)
* **FragmentsModels:** transfer Uint8Array model data to the worker instead of cloning it ([#241](https://github.com/ShaMan123/engine_fragment/issues/241)) ([948b385](https://github.com/ShaMan123/engine_fragment/commit/948b385ce8795ae715bc1a8876dfc7ac1e6cc2dc))
* **fragments:** Project not compiling (in Angular) due to missing `Sample` type ([#68](https://github.com/ShaMan123/engine_fragment/issues/68)) ([79b1990](https://github.com/ShaMan123/engine_fragment/commit/79b19900a01bb6da3e5caa6470f62ac53650e2c1))
* get rid of debug logs ([03cd103](https://github.com/ShaMan123/engine_fragment/commit/03cd10361670d0285040f16b83210967f94b5cba))
* get rid of FragmentsGroup memory leak ([6974afd](https://github.com/ShaMan123/engine_fragment/commit/6974afd444e0b6f4391725939aad53f4645bf25d))
* **Grids:** add opt-in grid labels ([#199](https://github.com/ShaMan123/engine_fragment/issues/199)) ([fd11e67](https://github.com/ShaMan123/engine_fragment/commit/fd11e67fc9c75ba47bc708b9e9d787ad9fa46c85))
* handle optional chaining for UnitType in IfcPropertyProcessor ([3f00edb](https://github.com/ShaMan123/engine_fragment/commit/3f00edbf3d7fa7097c954d8f20a1ded4ff43ff5f))
* hierarchical frustum culling via the box structure ([2a6d31c](https://github.com/ShaMan123/engine_fragment/commit/2a6d31c38234d8517e2a08594c20aa3e031f7eec))
* **highlight:** clear all items on no-args resetHighlight ([00e7fe0](https://github.com/ShaMan123/engine_fragment/commit/00e7fe0335f0b13e6349363dbfe7dc36221c8761))
* **ifc-importer:** exclude boolean from attribute serialization process ([#96](https://github.com/ShaMan123/engine_fragment/issues/96)) ([db3b785](https://github.com/ShaMan123/engine_fragment/commit/db3b785e781c8dddfadbd984ddac88f941e0406a))
* **ifc-importer:** render IFCBEARING and IFCREFERENT ([#744](https://github.com/ShaMan123/engine_fragment/issues/744)) ([2b171e3](https://github.com/ShaMan123/engine_fragment/commit/2b171e3d94d956d69eb86ff5cbee58d3b51a19f8))
* **ifc-splitter:** add  `IFCMECHANICALFASTENER` to elements types ([#179](https://github.com/ShaMan123/engine_fragment/issues/179)) ([e33a9b0](https://github.com/ShaMan123/engine_fragment/commit/e33a9b0f918e38e2d3947d76218b95fabe70bdf6))
* **IfcImporter:** add IFCBRIDGE to default elements ([6f10d85](https://github.com/ShaMan123/engine_fragment/commit/6f10d85edaac55236244868630354fd84f381328)), closes [#203](https://github.com/ShaMan123/engine_fragment/issues/203)
* **IfcImporter:** convert grids when a grid axis tag is omitted ([#244](https://github.com/ShaMan123/engine_fragment/issues/244)) ([2131605](https://github.com/ShaMan123/engine_fragment/commit/21316056caf518e977ee6eefe4a75934e38a50fd))
* **IfcImporter:** import material property sets behind includeMaterialProperties ([#249](https://github.com/ShaMan123/engine_fragment/issues/249)) ([e53276f](https://github.com/ShaMan123/engine_fragment/commit/e53276f3d1c1594c785750b1744650c87d42e07d))
* **IfcImporter:** order-sensitive vertex hashing in the geometry dedup key ([dfdd873](https://github.com/ShaMan123/engine_fragment/commit/dfdd8733e69455efccf58ac2ff369c137f7fc1a1))
* improve fragment add logic ([fe9afe3](https://github.com/ShaMan123/engine_fragment/commit/fe9afe3d75f4af233a6dd0f3816312bb28a4c636))
* improve storey elevation replacement logic ([67eef05](https://github.com/ShaMan123/engine_fragment/commit/67eef05d71e8fa0239f4be12bfd6a02b9c003dde))
* improve the getItemsByVisibility ([e68c376](https://github.com/ShaMan123/engine_fragment/commit/e68c376d7f679e51d7bfa09aedde118ba616ea00))
* include property names in rendered material identity ([6242c2b](https://github.com/ShaMan123/engine_fragment/commit/6242c2b6d8c2c204b08dcb3fd5643c5ca6c46f15))
* include type entities and solve DefinesOccurrence typo ([79b134a](https://github.com/ShaMan123/engine_fragment/commit/79b134adbc0d2e6a9704fedb28d9da9feb7b129e))
* index edit requests for faster property reads ([0ced7f1](https://github.com/ShaMan123/engine_fragment/commit/0ced7f14829e0c0ea02d69d16b1228200fb34d4c))
* index items by category for getItemsOfCategories ([5b8d4f5](https://github.com/ShaMan123/engine_fragment/commit/5b8d4f57724b0276785bf9f6660447d188b65fbb))
* **Indexes:** add getIndexKey and getIndexValues ([#215](https://github.com/ShaMan123/engine_fragment/issues/215)) ([a2d945f](https://github.com/ShaMan123/engine_fragment/commit/a2d945f96d289cb5b0262038785b9cb5083f1d03))
* **Indexes:** generic types for index read methods ([#224](https://github.com/ShaMan123/engine_fragment/issues/224)) ([1d1db70](https://github.com/ShaMan123/engine_fragment/commit/1d1db707e327115144937a3c738b623c213b5c92))
* **Indexes:** validate index edit requests ([#223](https://github.com/ShaMan123/engine_fragment/issues/223)) ([5ae2527](https://github.com/ShaMan123/engine_fragment/commit/5ae2527500eb29fe9f4e30b8ecf95184a52d9ac9))
* **Indexes:** validate index number keys/values are non-negative 32-bit integers ([9e57acf](https://github.com/ShaMan123/engine_fragment/commit/9e57acff6814dc13eb58a088d6d951fa5755935f)), closes [#214](https://github.com/ShaMan123/engine_fragment/issues/214)
* keep example.html filename in generated index links ([36b1357](https://github.com/ShaMan123/engine_fragment/commit/36b13574b5ad0b0b9d11de964afdaa2ba4571215))
* keep web-ifc out of the worker bundle ([#289](https://github.com/ShaMan123/engine_fragment/issues/289)) ([2e7b7bd](https://github.com/ShaMan123/engine_fragment/commit/2e7b7bd5d49b08f4adf9c12f92e51dd1e6b6876d))
* **main:** fix example generation ([4cdb9df](https://github.com/ShaMan123/engine_fragment/commit/4cdb9dfba71a5086b378d08ac0f07776f60adb1b))
* make stream geometry id a string ([202197e](https://github.com/ShaMan123/engine_fragment/commit/202197e1328220020a18a7429295d9517eefd39f))
* **materials:** Fix setColor and setOpacity ([#148](https://github.com/ShaMan123/engine_fragment/issues/148)) ([08289d3](https://github.com/ShaMan123/engine_fragment/commit/08289d3a3f1e5da52cef90ebf09aca9d8f7d81ea))
* misc corrections ([e5d0b28](https://github.com/ShaMan123/engine_fragment/commit/e5d0b28a921de5c5c2b117b021c93691e70868c4))
* **parser:** streaming STEP tokenizer with web-ifc tape parity ([dceedc8](https://github.com/ShaMan123/engine_fragment/commit/dceedc86d3e39cb91faf2da675f2025b143e5833))
* prevent disposing null geometrys (can happen in streaming) ([ed0936f](https://github.com/ShaMan123/engine_fragment/commit/ed0936fed39d71664349f4b859f61cda0f872b2a))
* prevent empty colors array in get method ([040aa8a](https://github.com/ShaMan123/engine_fragment/commit/040aa8af34de99f8d516ddcba869858f2a044fd9))
* **publish-repo:** fix publish repo with yarn command ([faca55b](https://github.com/ShaMan123/engine_fragment/commit/faca55bcf7b0ae4da85664edcc8b681a1bd71f69))
* **raycaster:** full precision result.facePoints ([#205](https://github.com/ShaMan123/engine_fragment/issues/205)) ([ccbc174](https://github.com/ShaMan123/engine_fragment/commit/ccbc174eb523e694834e6d4cfbf3af10b08756ac))
* **raycaster:** type facePoints as Float64Array ([0208f9a](https://github.com/ShaMan123/engine_fragment/commit/0208f9a22b3a5b12071c210fbcfe1035b51d90a4))
* read alignments when vertical data is missing ([5f67ad4](https://github.com/ShaMan123/engine_fragment/commit/5f67ad4ce6b1d530a0b0abc2065f5be8d5c29c9a))
* **rebar:** use shell geometry if rebars are not exported as SweptDiskSolids ([#156](https://github.com/ShaMan123/engine_fragment/issues/156)) ([20c1916](https://github.com/ShaMan123/engine_fragment/commit/20c1916f30f35f0664728d7e3a7e9c2909cb372b))
* remove civil points inversion (not necessary anymore) ([23602aa](https://github.com/ShaMan123/engine_fragment/commit/23602aa594fc653af36468b659819f6ee62e47ac))
* remove errors when ID not found ([ac8458b](https://github.com/ShaMan123/engine_fragment/commit/ac8458bd1d9042c6856a3da7543ec2f8b3cd39b2))
* rename geometry id in flatbuffers ([72d668d](https://github.com/ShaMan123/engine_fragment/commit/72d668d6cec02b4e9d9e860ad5af4266378e3172))
* render faces whose normal has two equal components ([#218](https://github.com/ShaMan123/engine_fragment/issues/218)) ([24cfb48](https://github.com/ShaMan123/engine_fragment/commit/24cfb48cb7dc233e4b4998cc37023b57884691d6)), closes [#206](https://github.com/ShaMan123/engine_fragment/issues/206)
* reset attributesToExclude to ensure all attributes are processed ([#159](https://github.com/ShaMan123/engine_fragment/issues/159)) ([1327272](https://github.com/ShaMan123/engine_fragment/commit/132727204b597fbaa521adb5d70f9d10e9d8859a))
* restore raw output as default for edit() and save() ([ff9f387](https://github.com/ShaMan123/engine_fragment/commit/ff9f38766cf224224a9f33d6ade95a87cc6512ff))
* return raw geometry when profiles could not be generated ([5bc880b](https://github.com/ShaMan123/engine_fragment/commit/5bc880b9bf493914a06ae7ecb93d3e2b127486eb))
* reuse identical preserved material definitions ([63bc3e9](https://github.com/ShaMan123/engine_fragment/commit/63bc3e970397efa2832ce7a19535ebe2c72f6f23))
* rotate thread updater across workers ([4ed4d47](https://github.com/ShaMan123/engine_fragment/commit/4ed4d47a8b98b2f7e0e62d7e35a03f503ce4a033))
* set up data in single threaded frag model ([0ab0ded](https://github.com/ShaMan123/engine_fragment/commit/0ab0ded836609b0734d6370cfceba7c330498273))
* setSample passes real visibility to updateTile ([c6a0d2f](https://github.com/ShaMan123/engine_fragment/commit/c6a0d2f0fe49386bfea4549eb3b2ec31f9ceef8e))
* settle update fences when no models remain ([9746997](https://github.com/ShaMan123/engine_fragment/commit/9746997b208fe31e7abe7aa6f54add9627a513d2))
* **SingleThreadedFragmentsModel:** `getItemsChildren` return value ([#220](https://github.com/ShaMan123/engine_fragment/issues/220)) ([c30e553](https://github.com/ShaMan123/engine_fragment/commit/c30e553bb7d7e09a81070010ecf49f5df6119ec8))
* **SingleThreadedFragmentsModel:** expose `raw` arg ([#209](https://github.com/ShaMan123/engine_fragment/issues/209)) ([3f58f6e](https://github.com/ShaMan123/engine_fragment/commit/3f58f6e3a39605c82294c80fff50a2285b098df1))
* skip delta rebuild on data-only edits ([700b1b1](https://github.com/ShaMan123/engine_fragment/commit/700b1b1f4816e0de1cffb2c1acc6bfa020bc411b))
* skip geometries with zero bounding box ([b5e7e21](https://github.com/ShaMan123/engine_fragment/commit/b5e7e2141bdac3d0c761c8b142521ac1ecdf0a4b))
* skip IFC relations with unset relating/related attributes ([#217](https://github.com/ShaMan123/engine_fragment/issues/217)) ([ea4104d](https://github.com/ShaMan123/engine_fragment/commit/ea4104d14823ee9bb7e400a89efc582888c216d1))
* solve bug due to rebar circle curve edge case ([fab19d6](https://github.com/ShaMan123/engine_fragment/commit/fab19d6700f0b6ee14a0072d45b8b455674ab14a))
* solve error when loading civil files with empty alignments ([069f944](https://github.com/ShaMan123/engine_fragment/commit/069f944b55b918ac0955aefc97995a313a314c79))
* solve fragment utils edge cases ([4694098](https://github.com/ShaMan123/engine_fragment/commit/469409880a1c86c4bd11d8b7baace66eb8ac8ebc))
* solve fragmentidmap intersect logic ([c393769](https://github.com/ShaMan123/engine_fragment/commit/c393769146ab509258912e386927026ac0393ee9))
* solve grid bug in some bim models ([161b5b6](https://github.com/ShaMan123/engine_fragment/commit/161b5b6c6a92bb3fcb23b317bef61a564e24c880))
* solve ifc splitter missing lines ([bbf890c](https://github.com/ShaMan123/engine_fragment/commit/bbf890ca2213007a1f91de6fbb0c3a4f1f5f9c6c))
* solve problem when object class is not defined in tile ([a3f91db](https://github.com/ShaMan123/engine_fragment/commit/a3f91db6422f752fd5dc26532d6cf29eb989b677))
* solve serializer check bug ([ffaa424](https://github.com/ShaMan123/engine_fragment/commit/ffaa4247558e6cd8e06061c0bcce974b9d3f6b04))
* solve serializer parser selection logic ([2d55755](https://github.com/ShaMan123/engine_fragment/commit/2d55755600842591e7e0c35a59f90888ace9fe59))
* **split:** configurable IfcSplitter type lists and options ([a16437b](https://github.com/ShaMan123/engine_fragment/commit/a16437bc2249772c1936012852216a6d7b03ad7e))
* **splitter:** environment-agnostic streaming IO for split and extract ([#197](https://github.com/ShaMan123/engine_fragment/issues/197)) ([40db05b](https://github.com/ShaMan123/engine_fragment/commit/40db05bcf3dda9c31e242307e57f3493899d4c0d)), closes [#180](https://github.com/ShaMan123/engine_fragment/issues/180)
* **splitter:** inline fixture conversion and test timeouts ([ec7a7c7](https://github.com/ShaMan123/engine_fragment/commit/ec7a7c79337bda79d6fdf20442ab4eb3f1553b10))
* stamp generator and version into model metadata ([#273](https://github.com/ShaMan123/engine_fragment/issues/273)) ([7da302d](https://github.com/ShaMan123/engine_fragment/commit/7da302df8dc1c7e1a6bdea4ba07f63af1be2495c))
* support blob response types ([218631c](https://github.com/ShaMan123/engine_fragment/commit/218631ce29c71fd5657c5b6e2872f076a9003ce9))
* support empty geometries for fragments ([082a3c2](https://github.com/ShaMan123/engine_fragment/commit/082a3c2ed1515fc63c238fcf637a70ea9f2c2cbd))
* surface unsupported grid axis curves instead of dropping them ([#264](https://github.com/ShaMan123/engine_fragment/issues/264)) ([d02a8a3](https://github.com/ShaMan123/engine_fragment/commit/d02a8a380dade48663f13cbaae91f31adf5372a7))
* survive grids without ObjectPlacement and report per-grid failures ([#263](https://github.com/ShaMan123/engine_fragment/issues/263)) ([74d0b3e](https://github.com/ShaMan123/engine_fragment/commit/74d0b3ed37784a17994cc4c26ef6613d18466808))
* swap color information when hiding items ([e44962b](https://github.com/ShaMan123/engine_fragment/commit/e44962bb02ba5855e9afc2b805baca837bf55f3b))
* **TS:** `ProcessData#readCallback` type/jsdocs ([#178](https://github.com/ShaMan123/engine_fragment/issues/178)) ([0f89ec0](https://github.com/ShaMan123/engine_fragment/commit/0f89ec0a1a00b437b37cdd3f801fe14b588f36da))
* upgrade examples to latest three.js version ([a73bf32](https://github.com/ShaMan123/engine_fragment/commit/a73bf32d9cc628daf75f6d270bef65d160426f92))
* various fixes for streaming ([4ef1b35](https://github.com/ShaMan123/engine_fragment/commit/4ef1b3502570d32d7cc94000effcf4393d263806))
* **visibility:** query item visibility in the itemId space ([#750](https://github.com/ShaMan123/engine_fragment/issues/750)) ([ea620e3](https://github.com/ShaMan123/engine_fragment/commit/ea620e3ee3a30fb0fc1ce4d764801e42049a7f04))
* write 0 sentinel instead of raw itemIndex when localId lookup misses ([7c560a5](https://github.com/ShaMan123/engine_fragment/commit/7c560a59b10f490e78e8d30017d0a243fa55e3ec))


### Performance Improvements

* **FragmentsModels:** coalesce forced updates inside the rate window instead of bypassing it ([756e3f1](https://github.com/ShaMan123/engine_fragment/commit/756e3f1960560df25be2f7597baa8e9fa64c2212))
* **FragmentsModels:** memoize localId index lookups in properties controller ([#245](https://github.com/ShaMan123/engine_fragment/issues/245)) ([dc8d5b2](https://github.com/ShaMan123/engine_fragment/commit/dc8d5b2e2a6f0f459b6a1ec298610d51285a111a))
* **FragmentsModels:** skip view refresh and re-cull when the view is unchanged ([d5627de](https://github.com/ShaMan123/engine_fragment/commit/d5627dee59e4585682a592d0927a9ad9786f6b38))
* **FragmentsModels:** use Set lookup for itemIds filter in getItemsByAttribute ([#246](https://github.com/ShaMan123/engine_fragment/issues/246)) ([ce1f686](https://github.com/ShaMan123/engine_fragment/commit/ce1f686899002b971513fe33a51da0042e6e25a3))
* lower default worker timing knobs ([6c5b7db](https://github.com/ShaMan123/engine_fragment/commit/6c5b7db61282f00f1b5a2b7df068c41134542c72))
* sequence-fenced update(true), drain on every FINISH ([aaf44ba](https://github.com/ShaMan123/engine_fragment/commit/aaf44ba0014e81cdfa213c0d212b3ce1e49a011d))


### Miscellaneous Chores

* release 1.2.0 ([eed7f84](https://github.com/ShaMan123/engine_fragment/commit/eed7f8466ddf641e13b20824e4af0bc3914c2193))
* release 1.4.1 ([f284eec](https://github.com/ShaMan123/engine_fragment/commit/f284eec3972d60d54712b588b927019f3beeafad))
* release 2.0.0 ([a7c5954](https://github.com/ShaMan123/engine_fragment/commit/a7c59541eb308331ef29a230f4da057131dc89a7))
* release 2.1.0 ([79049f3](https://github.com/ShaMan123/engine_fragment/commit/79049f30e70a2610dd1f77ea5298c93aa2c17be2))
* release 2.1.0 ([28a1f2d](https://github.com/ShaMan123/engine_fragment/commit/28a1f2d52f6f0705f27523cfe82e5792eb782897))
* release 2.1.0 ([fcbeeac](https://github.com/ShaMan123/engine_fragment/commit/fcbeeacf85c4b692784ce1e8538e072b74f866ae))
* release 2.2.0 ([cf4ad47](https://github.com/ShaMan123/engine_fragment/commit/cf4ad4771aae0779d12412eb4dfffa4112067d9f))
* release 2.3.0 ([8c5210c](https://github.com/ShaMan123/engine_fragment/commit/8c5210c3d7cfe2691167a19d59c148bc07173eec))
* release 3.0.0 ([d0e69d0](https://github.com/ShaMan123/engine_fragment/commit/d0e69d035cf336bdb5d9209b2416e915da23991d))
* release 3.2.0 ([f4faa23](https://github.com/ShaMan123/engine_fragment/commit/f4faa236c38a9281c3e19c561c831aee77d6dc60))
* release 3.2.1 ([885826d](https://github.com/ShaMan123/engine_fragment/commit/885826d5eaa170a9bdb04ea92980b18e38f12683))
* release 3.3.0 ([95846b7](https://github.com/ShaMan123/engine_fragment/commit/95846b7de60d600eb520db3a06a545e68f2d1c38))
* release 3.3.2 ([a902c96](https://github.com/ShaMan123/engine_fragment/commit/a902c96e22d1f37becf78341426ce0bb554a61f9))

## [3.4.0](https://github.com/ThatOpen/engine_fragment/compare/v3.3.2...v3.4.0) (2026-04-09)


### Features

* add crs support ([304d56b](https://github.com/ThatOpen/engine_fragment/commit/304d56b61e9d8d1d2a74ff0176d779345399c61d))
* add ifc file splitter and extractor ([f5ee358](https://github.com/ThatOpen/engine_fragment/commit/f5ee35807f566eff83ae732568ba6ede9727ad5b))
* implement highlights for lod ([063293d](https://github.com/ThatOpen/engine_fragment/commit/063293d59b5123964145fb3df91e9cdbbb3d4118))
* implement more ifc properties cases ([b6ed3c1](https://github.com/ThatOpen/engine_fragment/commit/b6ed3c1b007e9f851f661d2d63bd583e4ecea0c0))
* implement optional traditional workers ([f976443](https://github.com/ThatOpen/engine_fragment/commit/f97644314ba0b8b19ff671760d5c1dbfc638f015))
* inject ifc splitter dependencies ([1cc799b](https://github.com/ThatOpen/engine_fragment/commit/1cc799b15fb0110e8a33c0eb3617ab3980911661))
* make worker url optional ([a99d069](https://github.com/ThatOpen/engine_fragment/commit/a99d06981be223b0cb2b0b13b1f300592024a22f))
* track visible items ([6804110](https://github.com/ThatOpen/engine_fragment/commit/680411030ddb39d5ca64354538a31a688655a53e))


### Bug Fixes

* correct boolean operation bug ([8bc50a7](https://github.com/ThatOpen/engine_fragment/commit/8bc50a7c4493a11d13983d6e2e47a154b26a2d33))
* correct bug when editing newly created items ([381eb46](https://github.com/ThatOpen/engine_fragment/commit/381eb463925b06662fec7399aab966b8ca5676f7))
* correct deduplication algo bug ([081a1a9](https://github.com/ThatOpen/engine_fragment/commit/081a1a9287f7dfb95094e648016ce4f9742e3338))
* correct edge case when editing fragments ([282eb0b](https://github.com/ThatOpen/engine_fragment/commit/282eb0b5dc3b2e994ddd24ea8237c7af194333d7))
* correct edit id conter behavior ([fb9b907](https://github.com/ThatOpen/engine_fragment/commit/fb9b907ac36ae3cb977526efb76d90d020730283))
* correct edit visibility logic ([e1a94ef](https://github.com/ThatOpen/engine_fragment/commit/e1a94efc5985f21f9b59d6f97f6bb2c86c766d8c))
* correct editing newly created elements ([663351d](https://github.com/ThatOpen/engine_fragment/commit/663351d755c8df4f5edbf3ca7e3074dcc2ebac2e))
* correct raycasting frustum for ortho camera ([fda0eca](https://github.com/ThatOpen/engine_fragment/commit/fda0eca55130e7f1ae780ffaf8e6b855fa61572b))
* correct various edit bugs ([363318e](https://github.com/ThatOpen/engine_fragment/commit/363318e095dd3730a843dadc87620704d589759f))
* correct visibility control when using all_visible ([b1b32d4](https://github.com/ThatOpen/engine_fragment/commit/b1b32d4241b2ef435ff5078d89a1afb7aaf79344))
* eliminate visual blink during delta model edits ([0163621](https://github.com/ThatOpen/engine_fragment/commit/01636210b07d6a6ec03e1273fca4324627a0500b))
* **materials:** Fix setColor and setOpacity ([#148](https://github.com/ThatOpen/engine_fragment/issues/148)) ([08289d3](https://github.com/ThatOpen/engine_fragment/commit/08289d3a3f1e5da52cef90ebf09aca9d8f7d81ea))
* **rebar:** use shell geometry if rebars are not exported as SweptDiskSolids ([#156](https://github.com/ThatOpen/engine_fragment/issues/156)) ([20c1916](https://github.com/ThatOpen/engine_fragment/commit/20c1916f30f35f0664728d7e3a7e9c2909cb372b))
* reset attributesToExclude to ensure all attributes are processed ([#159](https://github.com/ThatOpen/engine_fragment/issues/159)) ([1327272](https://github.com/ThatOpen/engine_fragment/commit/132727204b597fbaa521adb5d70f9d10e9d8859a))
* solve error when loading civil files with empty alignments ([069f944](https://github.com/ThatOpen/engine_fragment/commit/069f944b55b918ac0955aefc97995a313a314c79))

## [3.3.2](https://github.com/ThatOpen/engine_fragment/compare/v3.3.0...v3.3.2) (2026-01-27)


### Miscellaneous Chores

* release 3.3.2 ([a902c96](https://github.com/ThatOpen/engine_fragment/commit/a902c96e22d1f37becf78341426ce0bb554a61f9))

## [3.3.0](https://github.com/ThatOpen/engine_fragment/compare/v3.2.1...v3.3.0) (2026-01-22)


### Features

* add all ifc metadata info to fragments ([6fb2e6c](https://github.com/ThatOpen/engine_fragment/commit/6fb2e6ccf841f526265b4e9b30090d0303860964))
* add ifc bridge part to default ifc elements ([1468c6d](https://github.com/ThatOpen/engine_fragment/commit/1468c6d4ed5aed77ccfd2bf88c218d1f911c434f))
* add more methods to single threaded fragments model ([fe43e1a](https://github.com/ThatOpen/engine_fragment/commit/fe43e1ad2776c8e92cc8885b640b40dcd17b73fa))
* allow to load all categories and relations ([0ee5da1](https://github.com/ThatOpen/engine_fragment/commit/0ee5da15aa6918ec2b88493117686ae27c487f47))
* allow to return all raycast results ([7012998](https://github.com/ThatOpen/engine_fragment/commit/701299806cb3462ba0163dd1802f3730b2c7dfc3))
* force ifc spaces to be transparent by default ([2bdd447](https://github.com/ThatOpen/engine_fragment/commit/2bdd44792f49b96d38ef807ee58ba9f96c8a332d))
* implement grids ([3b19a28](https://github.com/ThatOpen/engine_fragment/commit/3b19a28d448ce882ae9de768f2523082fc3dd249))
* implement lod mode ([95bb163](https://github.com/ThatOpen/engine_fragment/commit/95bb163e5b1b38cba04f04a65dc0b05c59b50239))
* **materials:** add depthWrite property to MaterialDefinition ([#145](https://github.com/ThatOpen/engine_fragment/issues/145)) ([391f9dc](https://github.com/ThatOpen/engine_fragment/commit/391f9dc1e1ccf2e9b12987ffb430ae0b144cd551))
* **materials:** add setColor/setOpacity with resetColor/resetOpacity methods ([#137](https://github.com/ThatOpen/engine_fragment/issues/137)) ([db73877](https://github.com/ThatOpen/engine_fragment/commit/db73877a88210104814b1b1c4e92fd568569ee30))
* misc release updates ([42e963a](https://github.com/ThatOpen/engine_fragment/commit/42e963a57b3cf3ba61d83224ee3334b67f28dcdf))


### Bug Fixes

* correct await force update behavior ([92b7f8d](https://github.com/ThatOpen/engine_fragment/commit/92b7f8d99d50caa302f68265a9ad1f01280d539b))
* correct error when importing certain relations ([14aea10](https://github.com/ThatOpen/engine_fragment/commit/14aea10c5e118fc800919e74b730a5f4a05e236c))
* correct grid edge case ([a1fe6f8](https://github.com/ThatOpen/engine_fragment/commit/a1fe6f83edc422cb16e621d17acbfa43e2a440fa))
* correct metadata failing with empty values ([081f296](https://github.com/ThatOpen/engine_fragment/commit/081f296fb7cdbe11d2431d2f7a8df1005ec434a5))
* correct raycasting frustum calculation for orthographic cameras ([#136](https://github.com/ThatOpen/engine_fragment/issues/136)) ([cf0b8fc](https://github.com/ThatOpen/engine_fragment/commit/cf0b8fc6ea749549598f8e7e4ccaf4e7fcd47e0c))
* correct small harmless error in ifc importer ([2e9a276](https://github.com/ThatOpen/engine_fragment/commit/2e9a27615751f259093eff510b988f4dfbea64aa))
* correct various bugs when getting edited items data ([e39a652](https://github.com/ThatOpen/engine_fragment/commit/e39a652d529e931d1ff61ec506427e067180385d))
* **ifc-importer:** exclude boolean from attribute serialization process ([#96](https://github.com/ThatOpen/engine_fragment/issues/96)) ([db3b785](https://github.com/ThatOpen/engine_fragment/commit/db3b785e781c8dddfadbd984ddac88f941e0406a))
* improve storey elevation replacement logic ([67eef05](https://github.com/ThatOpen/engine_fragment/commit/67eef05d71e8fa0239f4be12bfd6a02b9c003dde))
* remove civil points inversion (not necessary anymore) ([23602aa](https://github.com/ThatOpen/engine_fragment/commit/23602aa594fc653af36468b659819f6ee62e47ac))
* set up data in single threaded frag model ([0ab0ded](https://github.com/ThatOpen/engine_fragment/commit/0ab0ded836609b0734d6370cfceba7c330498273))
* skip geometries with zero bounding box ([b5e7e21](https://github.com/ThatOpen/engine_fragment/commit/b5e7e2141bdac3d0c761c8b142521ac1ecdf0a4b))


### Miscellaneous Chores

* release 3.3.0 ([95846b7](https://github.com/ThatOpen/engine_fragment/commit/95846b7de60d600eb520db3a06a545e68f2d1c38))

## [3.2.1](https://github.com/ThatOpen/engine_fragment/compare/v3.1.0...v3.2.1) (2025-10-23)


### Features

* add ifc road to ifc element list ([5b6fec9](https://github.com/ThatOpen/engine_fragment/commit/5b6fec9b104ee9a61bb5247d01df40385cd0d77a))
* allow to disable guard to ignore objects far away from the origin ([50c837c](https://github.com/ThatOpen/engine_fragment/commit/50c837c126d437f1aa6fee801db02b622c13c6c1))
* expose web-ifc config ([98cb3f3](https://github.com/ThatOpen/engine_fragment/commit/98cb3f35fe53a2b89105e4ffab77f76e0fe0fad8))
* fix tutorials paths ([7496f56](https://github.com/ThatOpen/engine_fragment/commit/7496f562ab7f5a24e2e23348ce64f0355ca4b701))
* release edit api ([f8b23b1](https://github.com/ThatOpen/engine_fragment/commit/f8b23b15e7e796722ef18d7bd3634fe727c19daa))


### Bug Fixes

* await set up model ([d86d799](https://github.com/ThatOpen/engine_fragment/commit/d86d79952f4b0bfde590bea938a56b5c52ab0a0c))
* handle optional chaining for UnitType in IfcPropertyProcessor ([3f00edb](https://github.com/ThatOpen/engine_fragment/commit/3f00edbf3d7fa7097c954d8f20a1ded4ff43ff5f))
* return raw geometry when profiles could not be generated ([5bc880b](https://github.com/ThatOpen/engine_fragment/commit/5bc880b9bf493914a06ae7ecb93d3e2b127486eb))


### Miscellaneous Chores

* release 3.2.0 ([f4faa23](https://github.com/ThatOpen/engine_fragment/commit/f4faa236c38a9281c3e19c561c831aee77d6dc60))
* release 3.2.1 ([885826d](https://github.com/ThatOpen/engine_fragment/commit/885826d5eaa170a9bdb04ea92980b18e38f12683))

## [3.1.0](https://github.com/ThatOpen/engine_fragment/compare/v3.0.0...v3.1.0) (2025-07-10)


### Features

* add getCoordinationMatrix method to FragmentsModel ([bd09ace](https://github.com/ThatOpen/engine_fragment/commit/bd09ace0aa48a4bd1edfb02d270cc0fd320bc64f))
* add units classes ([#69](https://github.com/ThatOpen/engine_fragment/issues/69)) ([325e0fa](https://github.com/ThatOpen/engine_fragment/commit/325e0fac1cd529750b14fde17331455aa5adb4d0))
* enhance geometry retrieval methods in FragmentsModel ([f843334](https://github.com/ThatOpen/engine_fragment/commit/f843334baa89d3c6729058112e7be4cc2ec23aa1))
* enhance IfcImporter with configuration to define classes and relations to process ([6c44b59](https://github.com/ThatOpen/engine_fragment/commit/6c44b597f35ee11525df4d081e429e8ac7e186ef))
* multiple fixes, data tools, alignment tools ([4224a3c](https://github.com/ThatOpen/engine_fragment/commit/4224a3c0cfc2cdc4fa5a86d74afaf6b74c88ca0d))
* skip big meshes for shell generation ([4fae6d3](https://github.com/ThatOpen/engine_fragment/commit/4fae6d335c63a4dedb80c428a25334607a34307e))


### Bug Fixes

* add guard for circular extrusions ([c08d5ac](https://github.com/ThatOpen/engine_fragment/commit/c08d5acd48cefa590083eb11fda418da8d84c9b5))
* add old frags files to prevent conflict with components ([4544747](https://github.com/ThatOpen/engine_fragment/commit/4544747e12a019efbf29667127b196d72899762a))
* ensure guard function is defined before validation in DataSet.add method ([e127a0d](https://github.com/ThatOpen/engine_fragment/commit/e127a0d949dfadec109dc76b5e6723174503e8b0))
* **fragments:** Project not compiling (in Angular) due to missing `Sample` type ([#68](https://github.com/ThatOpen/engine_fragment/issues/68)) ([79b1990](https://github.com/ThatOpen/engine_fragment/commit/79b19900a01bb6da3e5caa6470f62ac53650e2c1))
* solve problem when object class is not defined in tile ([a3f91db](https://github.com/ThatOpen/engine_fragment/commit/a3f91db6422f752fd5dc26532d6cf29eb989b677))

## [3.0.0](https://github.com/ThatOpen/engine_fragment/compare/v2.4.0...v3.0.0) (2025-04-10)


### Features

* **main:** set up new fragments ([67da61d](https://github.com/ThatOpen/engine_fragment/commit/67da61dfa96d9b0292a0651d95113fb87507e77e))


### Bug Fixes

* **main:** fix example generation ([4cdb9df](https://github.com/ThatOpen/engine_fragment/commit/4cdb9dfba71a5086b378d08ac0f07776f60adb1b))


### Miscellaneous Chores

* release 3.0.0 ([d0e69d0](https://github.com/ThatOpen/engine_fragment/commit/d0e69d035cf336bdb5d9209b2416e915da23991d))
