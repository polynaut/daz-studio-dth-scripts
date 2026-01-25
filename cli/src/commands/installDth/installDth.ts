import * as fs from "fs";
import * as path from "path";
import type { IInstallDthConfig } from "../../common/types.js";
import { log, logDebug } from "../../common/utils.js";

function countFiles(dir: string): number {
  let count = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        count += countFiles(fullPath);
      } else {
        count++;
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }
  return count;
}

function copyFolder(
  srcFolder: string,
  destFolder: string,
  dryRun: boolean,
  debug: boolean
): number {
  if (!fs.existsSync(srcFolder)) {
    logDebug(`  Skipping ${srcFolder} (does not exist)`, debug);
    return 0;
  }

  const fileCount = countFiles(srcFolder);

  if (dryRun) {
    log(`  Would copy: ${srcFolder}`);
    log(`    -> ${destFolder} (${fileCount} files)`);
  } else {
    logDebug(`  Copying: ${srcFolder} -> ${destFolder}`, debug);
    fs.cpSync(srcFolder, destFolder, { recursive: true, force: true });
    log(`  Copied: ${path.basename(srcFolder)} (${fileCount} files)`);
  }

  return fileCount;
}

function findLatestRelease(releasesFolder: string): string | null {
  const entries = fs.readdirSync(releasesFolder, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory());

  // Sort by modification time, newest first
  dirs.sort((a, b) => {
    const statA = fs.statSync(path.join(releasesFolder, a.name));
    const statB = fs.statSync(path.join(releasesFolder, b.name));
    return statB.mtime.getTime() - statA.mtime.getTime();
  });

  return dirs.length > 0 ? dirs[0].name : null;
}

export async function installDth(config: IInstallDthConfig): Promise<void> {
  const { dthReleasesFolder, dazLibFolder, debug, dryRun } = config;

  if (dryRun) {
    log("=== DRY RUN MODE ===\n");
  }

  log(`Releases folder: ${dthReleasesFolder}`);
  log(`Target: ${dazLibFolder}\n`);

  // Find the latest release folder
  const latestRelease = findLatestRelease(dthReleasesFolder);

  if (!latestRelease) {
    throw new Error(`No release folders found in ${dthReleasesFolder}`);
  }

  log(`Latest release: ${latestRelease}`);

  const releasePath = path.join(dthReleasesFolder, latestRelease);
  const contentPath = path.join(releasePath, "Daz Studio Content");

  if (!fs.existsSync(contentPath)) {
    throw new Error(`Daz Studio Content folder not found in ${releasePath}`);
  }

  logDebug(`Content path: ${contentPath}`, debug);

  // Folders to copy from Daz Studio Content
  const foldersToInstall = ["data", "DazToHue"];
  let totalFiles = 0;

  log(`\nInstalling DTH folders...\n`);

  for (const folder of foldersToInstall) {
    const srcFolder = path.join(contentPath, folder);
    const destFolder = path.join(dazLibFolder, folder);
    totalFiles += copyFolder(srcFolder, destFolder, dryRun, debug);
  }

  log("");

  if (dryRun) {
    log(`=== DRY RUN COMPLETE ===`);
    log(`Would copy ${totalFiles} files from ${latestRelease}.`);
  } else {
    log(`=== INSTALL COMPLETE ===`);
    log(`Copied ${totalFiles} files from ${latestRelease}.`);
  }
}
