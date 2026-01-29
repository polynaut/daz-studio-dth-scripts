import * as fs from "fs";
import * as path from "path";
import type { IAssetInfo, IInstallDazAssetsConfig } from "../../common/types.js";
import { log, logDebug } from "../../common/utils.js";
import { scanAssetsDir } from "../listDazAssets/listDazAssets.js";

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

function cleanupTempAssets(assets: IAssetInfo[]): void {
  for (const asset of assets) {
    if (asset.isTemp && asset.tempDir) {
      fs.rmSync(asset.tempDir, { recursive: true, force: true });
    }
  }
}

function isAssetInstalled(asset: IAssetInfo, dazLibFolder: string): boolean {
  if (!asset.markerFile) return false;
  const destPath = path.join(dazLibFolder, asset.markerFile);
  return fs.existsSync(destPath);
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

export async function installDazAssets(config: IInstallDazAssetsConfig): Promise<void> {
  const { assetSources, dazLibFolder, debug, dryRun, force } = config;

  if (dryRun) {
    log("=== DRY RUN MODE ===\n");
  }

  if (force) {
    log("=== FORCE MODE: Ignoring 'already installed' checks ===\n");
  }

  log(`Target: ${dazLibFolder}\n`);

  // Collect all assets from all sources
  const allAssets: IAssetInfo[] = [];

  for (const source of assetSources) {
    if (!fs.existsSync(source.path)) {
      log(`Warning: ${source.label} directory not found: ${source.path}\n`);
      continue;
    }

    log(`Scanning ${source.label}: ${source.path}`);
    const assets = scanAssetsDir(source.path, debug);
    const assetsWithContent = assets.filter((a) => a.foundFolders.length > 0);
    log(`  Found ${assetsWithContent.length} assets with content\n`);
    allAssets.push(...assetsWithContent);
  }

  if (allAssets.length === 0) {
    log("No assets with content found.");
    return;
  }

  // Sort alphabetically by asset name (ensures _1, _2 ordering)
  allAssets.sort((a, b) => a.assetName.localeCompare(b.assetName));

  log(`\nProcessing ${allAssets.length} assets in alphabetical order...\n`);

  let totalFiles = 0;
  let installedAssets = 0;
  let skippedAssets = 0;

  for (let i = 0; i < allAssets.length; i++) {
    const asset = allAssets[i];
    const progress = `[${i + 1}/${allAssets.length}]`;

    // Check if asset is already installed (skip check if --force is used)
    if (!force && isAssetInstalled(asset, dazLibFolder)) {
      logDebug(`${progress} ${asset.assetName} - already installed (marker: ${asset.markerFile})`, debug);
      skippedAssets++;
      continue;
    }

    log(`${progress} ${asset.assetName}`);

    for (const folder of asset.foundFolders) {
      const srcFolder = path.join(asset.contentPath, folder);
      const destFolder = path.join(dazLibFolder, folder);
      totalFiles += copyFolder(srcFolder, destFolder, dryRun, debug);
    }

    installedAssets++;
    log("");
  }

  cleanupTempAssets(allAssets);

  if (dryRun) {
    log(`=== DRY RUN COMPLETE ===`);
    log(`Would copy ${totalFiles} files from ${installedAssets} assets.`);
    if (skippedAssets > 0) {
      log(`Skipped ${skippedAssets} already installed assets.`);
    }
  } else {
    log(`=== INSTALL COMPLETE ===`);
    log(`Copied ${totalFiles} files from ${installedAssets} assets.`);
    if (skippedAssets > 0) {
      log(`Skipped ${skippedAssets} already installed assets.`);
    }
  }
}
