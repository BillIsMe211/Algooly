# Algooly

## Overview

Algooly is an Electron desktop app for browsing a built-in competitive-programming library and keeping a local history of problems, screenshots, and solutions. History is stored in ordinary folders, while optional Gemini or OpenAI-compatible provider features can label captured problems. [Read the Vietnamese README](README.vi.md).

## Key features

- Build your own algorithm library (C++ and Python examples) or import a library package (.zip). The app starts with an empty library.
- Capture full screens or selected regions into a local problem history; add solution files, images, links, and verdicts.
- Organize history in folders, mark problems solved or starred, and share selected folders/problems as ZIP archives.
- Optionally use Gemini or an OpenAI-compatible provider to identify problem details, and estimate difficulty. No AI model is selected by default: pick one yourself in Settings (the `!` button next to the selector explains plan and rate-limit caveats).
- Switch the interface between English, Vietnamese, and Russian.

## How it works

The Electron main process handles capture, filesystem history, ZIP archives, optional network requests, and operating-system integration. The renderer displays the library and history; preload scripts expose a limited set of IPC operations instead of Node.js integration.

Source layout:

- `main.js`, `preload.js`, `notify-preload.js`, `region-preload.js`: Electron process and preload bridges.
- `renderer/`: interface, styles, translations, and capture/notification windows.
- `data/library.json`: the default library; it ships empty.
- `vendor/`: bundled rendering libraries and fonts.

History defaults to `Algooly History` in the user's Documents folder. An existing `AlgoWiki History` folder is reused when the new folder does not exist. You can choose a different history root in settings. Electron settings, including the selected AI provider, API key, model, base URL (for OpenAI-compatible providers), and history root, are saved in `config.json` under Electron's `userData` directory; renderer preferences use browser `localStorage`. On Windows, an existing `%APPDATA%\algowiki` user-data directory is retained for compatibility.

A problem is represented by a folder such as:

```text
2026-03-08/
└── 10h30 - Problem name/
    ├── meta.json
    ├── problem.png
    ├── problem-2.png
    └── solution.cpp
```

`meta.json` is created and updated by the app. Depending on the problem and actions taken, it can contain `createdAt`, `source` (`capture` or `manual`), `aiAnalyzed`, `pending`, `site`, `title`, `url`, `urlSource` (`screenshot`, `codeforces`, `search` or `manual`), `rating`, `ratingStatus`, `ratingEstimate`, `ratingEstimateStatus`, `solved`, `solvedAt`, `verdicts`, `star`, `parentId`, and image rotation data (`imgRot`). Empty values are omitted, and any other key found in an older file is removed automatically. These are observed fields, not a versioned external schema. Group folders use `.algooly-group.json`; the legacy `.algowiki-group.json` name is also recognized.

Screen capture starts from a user action such as a configured shortcut or tray command. The resulting image is saved under the local history root. If automatic naming is enabled and a provider key is configured, the app may send the captured image and a prompt to the selected provider; see [Privacy and safety](#privacy-and-safety).

In Coding History, right-click a selected folder or problem and choose **Export to Zip** to share it; multiple selected entries are included. Folders and problems share the same grid, new entries appear first, and cards can be reordered by dragging; drag an entry onto a folder to move it inside. ZIP export includes the history files and an `algooly-backup.json` summary. Import drops entries with unsafe path components, strips a recognized wrapper folder, ignores invalid problem metadata, removes the `pending` flag from imported metadata, and creates a distinct folder name when a problem folder already exists. This is path sanitization, not a guarantee that every archive is harmless; review backups before importing.

History **Import ZIP**, **Import folder**, and full-history export are under **Settings > General > Coding History backup**. Folder import accepts a problem or group/history folder and copies it into the configured history root without replacing existing entries. The Library has its own ZIP import/export controls in Settings > General. Default ZIP filenames use `DDMMYYYY__(HH_mm).zip` (for example, `21112026__(17_25).zip`).

## Requirements, install, and run

The project maintainer identifies Windows as the primary supported platform, with source-level compatibility for macOS and Linux. The stated runtime is Node.js LTS and Electron 33.4.11.

- **End users:** Download the packaged Windows `.exe` from [GitHub Releases](https://github.com/BillIsMe211/Algooly/releases) when a release is published.
- **From source:** Run `npm install`, then `npx electron .`.

The supplied `package.json` does not define `scripts` or `engines`, and does not declare Electron as a dependency. Therefore, `npm install` alone does not install or pin Electron 33.4.11; ensure that version is available when using `npx electron .`. The `electron@33.4.11` entry in `allowScripts` is not a dependency or npm script.

## Privacy and safety

- Problem history, screenshots, solution files, and metadata are stored locally in the selected history folder. Settings and the provider API key are stored in Electron's local `userData` directory. ZIP backups contain the included local history in plaintext; store them accordingly.
- AI is optional. Gemini uses the `x-goog-api-key` header and Google's Generative Language API. OpenAI-compatible providers use a bearer API key and the configured API base URL. Depending on the action, requests can contain problem images (up to four, resized to at most 1,500 pixels wide and JPEG encoded at quality 85), a problem-identification prompt, up to 12,000 characters of solution source when no problem image is available. Gemini Google Search grounding may also receive the problem title, platform, ID, and a statement summary of up to 500 characters. This search runs in the background only when no problem link was read from the screenshot or obtained from official Codeforces data, results are cached for the session, and it can be turned off in Settings. Gemini often returns the sources of a search as Google redirect links; to read the real address the app requests that Google redirect URL once and reads only its `Location` header (the target page is not downloaded). AI requests are sent one at a time with a short gap, and are retried automatically (with the wait the provider asks for) when a per-minute rate limit or a temporary overload is hit; a daily quota is reported instead of retried. When images are added to a problem and its name, link or rating is still missing, the app can analyse it again in the background. Generation requests and grounded search time out after 60 seconds; model discovery after 15 seconds. The app does not send these AI requests unless the corresponding AI feature runs.
- The key is encrypted with Electron `safeStorage` when encryption is available. If it is unavailable or encryption fails, the key is stored as plaintext in `config.json`. Protect the user account and configuration directory; clear the key in settings if you no longer want it saved.
- On startup, the app may look up missing ratings for saved Codeforces problems through Codeforces' public API. These requests use a contest ID or the public problemset endpoint and time out after 12 or 20 seconds. The app also checks network availability locally; no telemetry, analytics, or auto-update mechanism was found in the supplied source.
- Screen capture is initiated by a user action and saved to the history folder. Clipboard images are read only when the user requests adding/pasting an image. Treat imported ZIPs, links, images, saved code, and AI-generated results as untrusted; the app does not validate AI answers as authoritative.
- The main window enables context isolation and disables Node integration, but its Electron sandbox is disabled. Renderer HTML includes a Content Security Policy, with inline styles permitted in the main window. Preload exposes allow-listed invoke and event channels; HTTP(S) links are opened externally. These controls reduce exposure but are not a security guarantee.
- ZIP import rejects traversal-like path segments and validates entries, but same-path duplicate files can overwrite one another and the source does not impose a total archive-size limit. Inspect untrusted archives and keep backups.

## License

Algooly declares the MIT License in package metadata. See [LICENSE](LICENSE).
