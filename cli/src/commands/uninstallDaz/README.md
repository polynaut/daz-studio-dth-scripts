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
2. Delete all folders (or their content) manually that were custom defined in the settings of DAZ Install Manager:
<img width="485" height="269" alt="DIM-advanced-settings" src="https://github.com/user-attachments/assets/cbf9f7d6-c0fc-4cb4-93d6-453ec97e5d8e" />
<img width="603" height="266" alt="DIM-downloads-settings" src="https://github.com/user-attachments/assets/2ff76b9b-17f9-4c42-9bd1-694980d25c0c" />
<img width="603" height="615" alt="DIM-installation-settings" src="https://github.com/user-attachments/assets/4c6977c6-71f1-46a3-a221-87239cf366b0" />

3. Uninstall DAZ Install Manager via Windows "Add or Remove Programs"
4. Now execute `pnpm uninstall-daz` and press enter to continue deleting all folders
5. Install DAZ Install Manager again and before installing anything with it, got to Advanced Settings and set all folders again like in the screenshots above.

> If you change the location of the "My DAZ 3D Library", update the .env variable `MY_DAZ_LIB_FOLDER` accordingly!

## Folders Deleted

- Custom library folder (from `MY_DAZ_LIB_FOLDER` env var)
- `D:\User Data\Documents\DAZ 3D`
- `E:\User Data\Documents\DAZ 3D`
- `C:\Users\Public\Documents\My DAZ 3D Library`
- `%APPDATA%\DAZ 3D`
- DAZ 3D Start Menu entries
