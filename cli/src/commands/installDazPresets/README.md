# install-daz-presets Command

Recursively copies preset files from a source folder to your DAZ Studio presets folder, only adding new files without overwriting or deleting existing ones.

## Usage

```bash
# Install presets (requires DAZ_PRESETS_SOURCE and DAZ_PRESETS_DEST in .env)
pnpm install-daz-presets

# Dry run - show what would be copied without copying
pnpm install-daz-presets:dry

# Install with custom paths
pnpm install-daz-presets -- --assets-dir "D:/MyPresets" --out "D:/DAZ Library/Presets"

# Enable debug logging
pnpm install-daz-presets -- --debug
```

## Configuration

Set these environment variables in `cli/.env`:

```env
# Source folder containing presets to sync
DAZ_PRESETS_SOURCE=D:/Dropbox/3D/daz3d/_presets

# Destination DAZ Studio presets folder
DAZ_PRESETS_DEST=E:/User Data/Documents/DAZ 3D/Studio/My Library/Presets
```

## How It Works

1. Recursively scans the source directory for all files
2. For each file, checks if it already exists in the destination
3. Only copies files that don't exist in the destination (add-only behavior)
4. Preserves the directory structure from source to destination

### Key Difference from install-daz-assets

- **install-daz-assets**: Scans for DAZ content folders (data, People, Runtime) within asset packages
- **install-daz-presets**: Simple recursive directory sync that only adds files, never overwrites or deletes

## Options

| Option | Description |
|--------|-------------|
| `--assets-dir` | Override DAZ_PRESETS_SOURCE |
| `--out` | Override DAZ_PRESETS_DEST |
| `--dry-run` | Preview without copying |
| `--debug` | Enable verbose logging |
