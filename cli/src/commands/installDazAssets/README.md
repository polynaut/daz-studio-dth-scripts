# install-daz-assets Command

Scans asset directories for DAZ Studio content and merges them into your DAZ library folder.

## Usage

```bash
# Install all assets (requires DAZ_LIB_FOLDER in .env)
pnpm install-daz-assets

# Dry run - show what would be copied without copying
pnpm install-daz-assets:dry

# Install only Genesis 9 assets
pnpm install-daz-assets:g9

# Install with custom output directory
pnpm install-daz-assets -- --out "D:/My DAZ Library"

# Install specific assets directory
pnpm install-daz-assets -- --assets-dir "D:/Downloads/NewAssets"
```

## Configuration

Set these environment variables in `cli/.env`:

```env
# Target library folder (required)
DAZ_LIB_FOLDER=D:/Daz 3D/My DAZ 3D Library

# Asset source directories
DAZ_ASSETS_G9=D:/DAZ Assets/Genesis 9
DAZ_ASSETS_G8=D:/DAZ Assets/Genesis 8
DAZ_ASSETS_G3=D:/DAZ Assets/Genesis 3
```

## How It Works

1. Scans configured asset directories for folders containing DAZ content markers (`data`, `Documentation`, `People`, `Runtime`)
2. Sorts all discovered assets alphabetically by name
3. Copies each asset's content folders to the target library, merging with existing content

### Alphabetical Sorting

Assets are processed in alphabetical order. This is important for assets with numbered suffixes like `AssetName_1`, `AssetName_2` - the later files overwrite earlier ones, ensuring proper layering of updates and patches.

## Options

| Option | Description |
|--------|-------------|
| `--out` | Override DAZ_LIB_FOLDER |
| `--assets-dir` | Scan only this directory |
| `--gen` | Filter by Genesis version (3, 8, or 9) |
| `--dry-run` | Preview without copying |
| `--debug` | Enable verbose logging |
