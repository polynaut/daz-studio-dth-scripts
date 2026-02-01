# install-houdini-dth Command

Installs the latest DazToHue Houdini assets to the Houdini user folder.

## Usage

```bash
# Dry run - show what would be copied
pnpm install-houdini-dth:dry

# Actually install
pnpm install-houdini-dth
```

## How It Works

1. Reads `DTH_RELEASES_FOLDER` from `.env` to find the releases directory
2. Finds the latest release folder by version number
3. Looks for `Houdini Assets` subfolder inside the release
4. Copies all contents (folders and files) to `HOUDINI_FOLDER`
5. Overwrites existing files (for updating to new DTH releases)

## Configuration

Set these environment variables in `.env`:

```
DTH_RELEASES_FOLDER=D:/path/to/dth/releases
HOUDINI_FOLDER=D:/User Data/Documents/houdini20.5
```

## Expected Folder Structure

### Source
```
DTH_RELEASES_FOLDER/
└── Releases/
    └── Release 2.1/          <- Latest by version
        └── Houdini Assets/
            ├── otls/
            ├── presets/
            ├── toolbar/
            └── copyright.txt
```

### Destination
All contents merge into the Houdini user folder:
```
HOUDINI_FOLDER/
├── otls/        (merged)
├── presets/     (merged)
├── toolbar/     (merged)
├── copyright.txt
└── ... (existing Houdini files preserved)
```

## Options

- `--out <path>`: Override `HOUDINI_FOLDER` destination
- `--dry-run`: Show what would be copied without copying
- `--debug`: Enable debug logging
