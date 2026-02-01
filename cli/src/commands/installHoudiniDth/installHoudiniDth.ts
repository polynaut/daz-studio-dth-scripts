import * as fs from "fs";
import * as path from "path";
import type { IInstallHoudiniDthConfig } from "../../common/types.js";
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

function copyFile(
  srcFile: string,
  destFile: string,
  dryRun: boolean,
  debug: boolean
): number {
  if (!fs.existsSync(srcFile)) {
    logDebug(`  Skipping ${srcFile} (does not exist)`, debug);
    return 0;
  }

  if (dryRun) {
    log(`  Would copy: ${srcFile}`);
    log(`    -> ${destFile}`);
  } else {
    logDebug(`  Copying: ${srcFile} -> ${destFile}`, debug);
    fs.cpSync(srcFile, destFile, { force: true });
    log(`  Copied: ${path.basename(srcFile)}`);
  }

  return 1;
}

function parseVersion(folderName: string): number[] {
  // Extract version from "Release X.Y.Z" format
  const match = folderName.match(/Release\s+(\d+(?:\.\d+)*)/i);
  if (!match) return [0];
  return match[1].split(".").map(Number);
}

function compareVersions(a: number[], b: number[]): number {
  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    const va = a[i] || 0;
    const vb = b[i] || 0;
    if (va !== vb) return vb - va; // Descending order
  }
  return 0;
}

function findLatestRelease(dthFolder: string): string | null {
  const releasesFolder = path.join(dthFolder, "Releases");

  if (!fs.existsSync(releasesFolder)) {
    throw new Error(`Releases folder not found: ${releasesFolder}`);
  }

  const entries = fs.readdirSync(releasesFolder, { withFileTypes: true });
  const dirs = entries.filter(
    (e) => e.isDirectory() && e.name.startsWith("Release")
  );

  // Sort by version number, highest first
  dirs.sort((a, b) => {
    const versionA = parseVersion(a.name);
    const versionB = parseVersion(b.name);
    return compareVersions(versionA, versionB);
  });

  return dirs.length > 0 ? dirs[0].name : null;
}

export async function installHoudiniDth(config: IInstallHoudiniDthConfig): Promise<void> {
  const { dthReleasesFolder, houdiniFolder, debug, dryRun } = config;

  if (dryRun) {
    log("=== DRY RUN MODE ===\n");
  }

  log(`Releases folder: ${dthReleasesFolder}`);
  log(`Target: ${houdiniFolder}\n`);

  // Find the latest release folder
  const latestRelease = findLatestRelease(dthReleasesFolder);

  if (!latestRelease) {
    throw new Error(
      `No release folders found in ${path.join(dthReleasesFolder, "Releases")}`
    );
  }

  log(`Latest release: ${latestRelease}`);

  const releasePath = path.join(dthReleasesFolder, "Releases", latestRelease);
  const houdiniAssetsPath = path.join(releasePath, "Houdini Assets");

  if (!fs.existsSync(houdiniAssetsPath)) {
    throw new Error(`Houdini Assets folder not found in ${releasePath}`);
  }

  logDebug(`Houdini Assets path: ${houdiniAssetsPath}`, debug);

  // Ensure destination exists
  if (!dryRun && !fs.existsSync(houdiniFolder)) {
    fs.mkdirSync(houdiniFolder, { recursive: true });
  }

  // Get all items in Houdini Assets folder
  const entries = fs.readdirSync(houdiniAssetsPath, { withFileTypes: true });
  let totalFiles = 0;

  log(`\nInstalling Houdini DTH assets...\n`);

  for (const entry of entries) {
    const srcPath = path.join(houdiniAssetsPath, entry.name);
    const destPath = path.join(houdiniFolder, entry.name);

    if (entry.isDirectory()) {
      totalFiles += copyFolder(srcPath, destPath, dryRun, debug);
    } else {
      totalFiles += copyFile(srcPath, destPath, dryRun, debug);
    }
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
