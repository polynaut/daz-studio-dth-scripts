# install-daz-dth Command

Installs the latest DazToHue release to the DAZ library folder.

## Usage

```bash
# Dry run - show what would be copied
pnpm install-daz-dth:dry

# Actually install
pnpm install-daz-dth
```

## How It Works

1. Reads `DTH_RELEASES_FOLDER` from `.env` to find the releases directory
2. Finds the latest release folder by modification date (not version number)
3. Looks for `Daz Studio Content` subfolder inside the release
4. Copies `data/` and `DazToHue/` folders to `DAZ_LIB_FOLDER`

## Configuration

Set these environment variables in `.env`:

```
DTH_RELEASES_FOLDER=D:/path/to/dth/releases
DAZ_LIB_FOLDER=D:/DAZ 3D/My DAZ 3D Library
```

## Expected Folder Structure

```
DTH_RELEASES_FOLDER/
├── Release 2.0/          <- Latest by date
│   └── Daz Studio Content/
│       ├── data/
│       ├── DazToHue/
│       ├── copyright.txt
│       └── Instructions.txt
├── Release 1.9.6/
├── Release 1.9.2/
└── ...
```

## Options

- `--out <path>`: Override `DAZ_LIB_FOLDER` destination
- `--dry-run`: Show what would be copied without copying
- `--debug`: Enable debug logging
