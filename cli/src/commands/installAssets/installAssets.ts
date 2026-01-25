import * as fs from "fs";
import * as path from "path";
import type { IAssetInfo, IInstallAssetsConfig } from "../../common/types.js";
import { log, logDebug } from "../../common/utils.js";
import { scanAssetsDir } from "../listAssets/listAssets.js";

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

export async function installAssets(config: IInstallAssetsConfig): Promise<void> {
  const { assetSources, dazLibFolder, debug, dryRun } = config;

  if (dryRun) {
    log("=== DRY RUN MODE ===\n");
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
  let processedAssets = 0;

  for (const asset of allAssets) {
    log(`[${++processedAssets}/${allAssets.length}] ${asset.assetName}`);

    for (const folder of asset.foundFolders) {
      const srcFolder = path.join(asset.contentPath, folder);
      const destFolder = path.join(dazLibFolder, folder);
      totalFiles += copyFolder(srcFolder, destFolder, dryRun, debug);
    }

    log("");
  }

  if (dryRun) {
    log(`=== DRY RUN COMPLETE ===`);
    log(`Would copy ${totalFiles} files from ${processedAssets} assets.`);
  } else {
    log(`=== INSTALL COMPLETE ===`);
    log(`Copied ${totalFiles} files from ${processedAssets} assets.`);
  }
}
