# Third-party notices

Versions and license expressions below are taken from the supplied `package.json` and `package-lock.json`, maintainer-provided runtime information, or the linked upstream license files. No `node_modules` directory or third-party license texts were present in the supplied source tree. Include the corresponding license texts in any distributed application as required by those licenses.

## Runtime libraries

| Library/package | Version basis | License |
| --- | ---: | --- |
| Electron | 33.4.11 (maintainer-provided; not locked) | MIT ([upstream license](https://github.com/electron/electron/blob/v33.4.11/LICENSE)) |
| Highlight.js (`@highlightjs/cdn-assets`) | 11.12.0 | BSD-3-Clause |
| `katex` | 0.16.47 | MIT |
| `marked` | 12.0.2 | MIT |
| `yauzl` | 3.4.0 | MIT |
| `yazl` | 3.3.1 | MIT |

## Transitive dependencies in the lockfile

| Package | Locked version | License in package-lock metadata |
| --- | ---: | --- |
| `buffer-crc32` | 1.0.0 | MIT |
| `commander` | 8.3.0 | MIT |
| `pend` | 1.2.0 | MIT |

## Bundled content and assets

- The project maintainer states that the UI icons were designed for Algooly.
- The project maintainer says the algorithm-library content was authored for Algooly. However, the supplied `data/library.json` snapshot has 41 entries and every entry's `url` points to `cp-algorithms.com`; its top-level `commit` is `e742ddc318548b41baab2ce85982283a8560613f`, a commit in the `cp-algorithms/cp-algorithms` repository. The `num_methods/binary_search` entry includes text matching the linked upstream page and preserves an explicit CC BY-SA 4.0 attribution for its Wikimedia image. The upstream repository's `LICENSE` at that commit is CC BY-SA 4.0 ([license at the referenced commit](https://github.com/cp-algorithms/cp-algorithms/blob/e742ddc318548b41baab2ce85982283a8560613f/LICENSE)). **TODO: reconcile the maintainer's authorship statement with the source URLs and confirm which text is original, adapted, or reused, and the required attribution/share-alike terms.**
- `vendor/hljs/highlight.min.js`, `vendor/marked.min.js`, KaTeX assets/fonts, and `renderer/fonts/space-grotesk-latin-700-normal.woff2` have no accompanying license texts in the supplied tree. Highlight.js and Marked bundle versions match package metadata; package metadata confirms their license expressions, but the actual third-party license texts are absent. **TODO: confirm the Space Grotesk font's license and include the required license texts/notices for bundled dependencies and fonts in the distributed application.**
- The project maintainer identifies BillisMe211 as the copyright holder for 2026. The supplied package metadata separately lists `Nghia Nguyen` as the author; these metadata fields are not identical.
