# list-assets

Scans asset directories and lists installed DAZ content with their folder structure.

## Usage

```bash
pnpm list-assets           # List all assets
pnpm list-assets --debug   # Show detailed scanning output
```

## Behavior

Recursively searches asset directories for DAZ content markers (`data`, `Documentation`, `People`, `Runtime` folders) and reports:

- Asset name
- Content path location
- Which standard folders were found
