# uninstall-daz

Cleans up leftover DAZ 3D folders after uninstalling via official tools.

## Usage

```bash
pnpm uninstall-daz         # Delete DAZ folders
pnpm uninstall-daz:dry     # Preview what would be deleted
```

## Prerequisites

Before running this command:

1. Uninstall everything using DAZ Install Manager
2. Uninstall DAZ Install Manager via Windows "Add or Remove Programs"

## Folders Deleted

- Custom library folder (from `MY_DAZ_LIB_FOLDER` env var)
- `D:\User Data\Documents\DAZ 3D`
- `E:\User Data\Documents\DAZ 3D`
- `C:\Users\Public\Documents\My DAZ 3D Library`
- `%APPDATA%\DAZ 3D`
- DAZ 3D Start Menu entries
