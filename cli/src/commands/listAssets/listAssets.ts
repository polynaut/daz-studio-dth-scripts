import * as fs from "fs";
import * as path from "path";
import type { IAssetInfo, IListAssetsConfig } from "../../common/types.js";
import { log, logDebug } from "../../common/utils.js";

const SPECIAL_FOLDERS = ["data", "Documentation", "People", "Runtime"];

function findContentLevel(
  dir: string,
  debug: boolean,
  relativePath: string = "."
): { contentPath: string; foundFolders: string[] } | null {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }

  const subDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const foundSpecial = subDirs.filter((name) => SPECIAL_FOLDERS.includes(name));

  logDebug(`  Checking ${relativePath}: found [${subDirs.join(", ")}]`, debug);

  if (foundSpecial.length > 0) {
    return { contentPath: relativePath, foundFolders: foundSpecial };
  }

  // Recursively search subdirectories
  for (const subDir of subDirs) {
    const subPath = path.join(dir, subDir);
    const subRelative =
      relativePath === "." ? subDir : path.join(relativePath, subDir);
    const result = findContentLevel(subPath, debug, subRelative);
    if (result) {
      return result;
    }
  }

  return null;
}

function scanAssetsDir(
  assetsDir: string,
  debug: boolean
): IAssetInfo[] {
  const entries = fs.readdirSync(assetsDir, { withFileTypes: true });
  const assetDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  const assets: IAssetInfo[] = [];

  for (const assetName of assetDirs) {
    const assetPath = path.join(assetsDir, assetName);

    logDebug(`\nScanning asset: ${assetName}`, debug);

    const result = findContentLevel(assetPath, debug);

    if (result) {
      const absolutePath = path.join(assetsDir, assetName, result.contentPath);
      assets.push({
        assetName,
        contentPath: absolutePath,
        foundFolders: result.foundFolders,
      });
    } else {
      assets.push({
        assetName,
        contentPath: "(no content found)",
        foundFolders: [],
      });
    }
  }

  return assets;
}

export async function listAssets(config: IListAssetsConfig): Promise<void> {
  const { assetSources, debug } = config;

  for (const source of assetSources) {
    if (!fs.existsSync(source.path)) {
      log(`Warning: ${source.label} directory not found: ${source.path}\n`);
      continue;
    }

    log(`=== ${source.label} ===`);
    log(`Scanning: ${source.path}\n`);

    const assets = scanAssetsDir(source.path, debug);

    log(`Found ${assets.length} assets\n`);

    for (const asset of assets) {
      log(asset.assetName);
      log(`  Path: ${asset.contentPath}`);
      log(
        `  Folders: ${asset.foundFolders.length > 0 ? asset.foundFolders.join(", ") : "(none)"}\n`
      );
    }
  }
}
