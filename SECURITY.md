# Security Policy

## Reporting a vulnerability

Please report suspected vulnerabilities privately through **GitHub Security Advisories** for this repository (Security → Advisories → Report a vulnerability). Do not open a public issue or include API keys, personal data, or sensitive ZIP contents in a report. Include the affected version, operating system, steps to reproduce, expected and actual behavior, and any relevant sanitized logs.

## Supported versions

The project maintainer identifies the current Algooly app version as `1.0.0`. Windows is the primary supported platform, with source-level macOS/Linux compatibility, using Node.js LTS and Electron 33.4.11. This runtime/platform guidance does not establish which Algooly releases receive security fixes. **TODO: confirm the security support policy for released versions.**

## Threat model and current limits

Algooly is a local Electron desktop application. Its history can contain screenshots, source code, problem metadata, links, and a user-provided Gemini API key. Keep the operating-system account, app configuration, history folder, and ZIP backups private.

Consider these inputs untrusted:

- ZIP archives selected for import, including their paths, metadata, and file contents.
- Links pasted or imported into problem metadata.
- Images pasted from the system clipboard or selected from disk.
- Problem text, source code, and responses returned by Gemini.

The app applies ZIP path sanitization and uses a preload bridge with allow-listed renderer IPC, but the main window has Electron sandboxing disabled and the ZIP importer has no total archive-size limit. Duplicate ZIP entry paths can overwrite files. Imported code is saved as data; do not execute it unless you have reviewed it. External HTTP(S) links are opened in the system browser. AI output and inferred problem metadata are not authoritative.

**TODO: confirm the intended owner for private vulnerability reports.**
