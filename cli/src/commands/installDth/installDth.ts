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

function checkPluginFolderAccess(pluginsFolder: string): void {
  // Check if plugins folder exists and is writable
  if (!fs.existsSync(pluginsFolder)) {
    throw new Error(
      `Plugins folder not found: ${pluginsFolder}\n` +
        `Please verify DAZ Studio is installed.`
    );
  }

  try {
    fs.accessSync(pluginsFolder, fs.constants.W_OK);
  } catch {
    throw new Error(
      `No write access to plugins folder: ${pluginsFolder}\n` +
        `Please run this command as Administrator.`
    );
  }
}

function copyPluginDll(
  dthFolder: string,
  pluginsFolder: string,
  dryRun: boolean,
  debug: boolean
): number {
  const exporterFolder = path.join(dthFolder, "ExporterPlugin");

  if (!fs.existsSync(exporterFolder)) {
    log(`  ExporterPlugin folder not found, skipping DLL copy`);
    return 0;
  }

  // Find .dll files in the folder
  const entries = fs.readdirSync(exporterFolder);
  const dllFiles = entries.filter((f) => f.toLowerCase().endsWith(".dll"));

  if (dllFiles.length === 0) {
    log(`  No DLL files found in ExporterPlugin folder`);
    return 0;
  }

  let copiedCount = 0;
  for (const dll of dllFiles) {
    const srcPath = path.join(exporterFolder, dll);
    const destPath = path.join(pluginsFolder, dll);

    if (dryRun) {
      log(`  Would copy: ${srcPath}`);
      log(`    -> ${destPath}`);
    } else {
      logDebug(`  Copying: ${srcPath} -> ${destPath}`, debug);
      fs.cpSync(srcPath, destPath, { force: true });
      log(`  Copied: ${dll}`);
    }
    copiedCount++;
  }

  return copiedCount;
}

export async function installDth(config: IInstallDthConfig): Promise<void> {
  const { dthReleasesFolder, dazLibFolder, dazPluginsFolder, debug, dryRun } =
    config;

  // Check admin permissions early (before doing any work)
  if (!dryRun) {
    checkPluginFolderAccess(dazPluginsFolder);
  }

  if (dryRun) {
    log("=== DRY RUN MODE ===\n");
  }

  log(`Releases folder: ${dthReleasesFolder}`);
  log(`Target: ${dazLibFolder}`);
  log(`Plugins: ${dazPluginsFolder}\n`);

  // Find the latest release folder
  const latestRelease = findLatestRelease(dthReleasesFolder);

  if (!latestRelease) {
    throw new Error(
      `No release folders found in ${path.join(dthReleasesFolder, "Releases")}`
    );
  }

  log(`Latest release: ${latestRelease}`);

  const releasePath = path.join(dthReleasesFolder, "Releases", latestRelease);
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

  // Copy exporter plugin DLL
  log(`\nInstalling exporter plugin...\n`);
  const dllCount = copyPluginDll(
    dthReleasesFolder,
    dazPluginsFolder,
    dryRun,
    debug
  );

  log("");

  if (dryRun) {
    log(`=== DRY RUN COMPLETE ===`);
    log(
      `Would copy ${totalFiles} content files + ${dllCount} plugin file(s) from ${latestRelease}.`
    );
  } else {
    log(`=== INSTALL COMPLETE ===`);
    log(
      `Copied ${totalFiles} content files + ${dllCount} plugin file(s) from ${latestRelease}.`
    );
  }
}
