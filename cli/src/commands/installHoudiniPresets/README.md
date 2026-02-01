# install-houdini-presets Command

Installs custom Houdini presets to the Houdini user folder and configures `houdini.env`.

## Usage

```bash
# Dry run - show what would be copied
pnpm install-houdini-presets:dry

# Actually install
pnpm install-houdini-presets
```

## How It Works

1. Reads `HOUDINI_PRESETS_SOURCE` from `.env` for the source folder
2. Reads `HOUDINI_FOLDER` from `.env` for the destination
3. Deletes any existing presets folder in the destination (allows re-running)
4. Copies the entire source folder recursively to the destination
5. Updates `houdini.env` to include the presets path in `HOUDINI_PATH`

## Configuration

Set these environment variables in `.env`:

```
HOUDINI_FOLDER=D:/User Data/Documents/houdini20.5
HOUDINI_PRESETS_SOURCE=D:/Dropbox/3D/houdini/my_presets
```

## houdini.env Configuration

The command ensures `houdini.env` contains:

```
SHARED_PRESETS = "D:/User Data/Documents/houdini20.5/my_presets"

HOUDINI_PATH = $HOUDINI_PATH;$SHARED_PRESETS
```

If these lines already exist, they won't be duplicated.

## Options

- `--out <path>`: Override `HOUDINI_FOLDER` destination
- `--assets-dir <path>`: Override `HOUDINI_PRESETS_SOURCE`
- `--dry-run`: Show what would be done without doing it
- `--debug`: Enable debug logging
