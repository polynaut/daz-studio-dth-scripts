# sync-daz-dth-scripts

Copies the DAZ scripts from this repository to your DAZ Studio scripts folder.

## Usage

```bash
pnpm sync-daz-dth-scripts          # Copy scripts to DAZ Studio
pnpm sync-daz-dth-scripts:dry      # Preview what would be copied
```

## Behavior

1. Deletes the existing `DTH Scripts Workflow` folder in your DAZ scripts directory
2. Copies all files from `scripts/` to the destination
3. Reports the number of files synced
