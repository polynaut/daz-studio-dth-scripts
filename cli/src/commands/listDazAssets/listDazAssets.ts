import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import AdmZip from "adm-zip";
import type { IAssetInfo, IListDazAssetsConfig } from "../../common/types.js";
import { log, logDebug } from "../../common/utils.js";

// Content folders contain actual assets; Documentation is metadata only
export const CONTENT_FOLDERS = ["data", "People", "Runtime"];
export const METADATA_FOLDERS = ["Documentation"];
export const SPECIAL_FOLDERS = [...CONTENT_FOLDERS, ...METADATA_FOLDERS];

/**
 * Recursively find the first file in a directory tree.
 * Returns the relative path from the starting directory.
 */
function findFirstFile(dir: string, relativePath: string = ""): string | null {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryRelative = relativePath
        ? path.join(relativePath, entry.name)
        : entry.name;
      if (entry.isFile()) {
        return entryRelative;
      }
      if (entry.isDirectory()) {
        const found = findFirstFile(path.join(dir, entry.name), entryRelative);
        if (found) return found;
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }
  return null;
}

export function findContentLevel(
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
  const foundContent = subDirs.filter((name) => CONTENT_FOLDERS.includes(name));
  const foundMetadata = subDirs.filter((name) => METADATA_FOLDERS.includes(name));
  const foundSpecial = [...foundContent, ...foundMetadata];

  logDebug(`  Checking ${relativePath}: found [${subDirs.join(", ")}]`, debug);

  // If we found actual content folders (data, People, Runtime), return immediately
  if (foundContent.length > 0) {
    return { contentPath: relativePath, foundFolders: foundSpecial };
  }

  // If we only found metadata (Documentation), keep searching subdirectories
  // for actual content, but remember this level as a fallback
  let fallbackResult: { contentPath: string; foundFolders: string[] } | null = null;
  if (foundMetadata.length > 0) {
    fallbackResult = { contentPath: relativePath, foundFolders: foundMetadata };
  }

  // Recursively search subdirectories
  for (const subDir of subDirs) {
    const subPath = path.join(dir, subDir);
    const subRelative =
      relativePath === "." ? subDir : path.join(relativePath, subDir);
    const result = findContentLevel(subPath, debug, subRelative);
    if (result) {
      // If we found content in a subdirectory, prefer that over metadata-only fallback
      return result;
    }
  }

  // Return metadata-only result as fallback if nothing better was found
  return fallbackResult;
}

export function scanZipAsset(
  zipPath: string,
  debug: boolean
): IAssetInfo | null {
  const zipName = path.basename(zipPath, ".zip");
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "daz-asset-"));

  try {
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(tempDir, true);

    const result = findContentLevel(tempDir, debug);

    if (result) {
      const contentPath = path.join(tempDir, result.contentPath);
      // Find a marker file for skip detection
      let markerFile: string | undefined;
      for (const folder of result.foundFolders) {
        const folderPath = path.join(contentPath, folder);
        const firstFile = findFirstFile(folderPath, folder);
        if (firstFile) {
          markerFile = firstFile;
          break;
        }
      }
      return {
        assetName: zipName,
        contentPath,
        foundFolders: result.foundFolders,
        isTemp: true,
        tempDir,
        markerFile,
      };
    }

    fs.rmSync(tempDir, { recursive: true, force: true });
    return null;
  } catch (err) {
    logDebug(`Failed to extract ${zipPath}: ${err}`, debug);
    fs.rmSync(tempDir, { recursive: true, force: true });
    return null;
  }
}

export function scanAssetsDir(
  assetsDir: string,
  debug: boolean
): IAssetInfo[] {
  const entries = fs.readdirSync(assetsDir, { withFileTypes: true });
  const assetDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const zipFiles = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".zip"))
    .map((e) => e.name);

  const assets: IAssetInfo[] = [];

  for (const assetName of assetDirs) {
    const assetPath = path.join(assetsDir, assetName);

    logDebug(`\nScanning asset: ${assetName}`, debug);

    const result = findContentLevel(assetPath, debug);

    if (result) {
      const absolutePath = path.join(assetsDir, assetName, result.contentPath);
      // Find a marker file for skip detection
      let markerFile: string | undefined;
      for (const folder of result.foundFolders) {
        const folderPath = path.join(absolutePath, folder);
        const firstFile = findFirstFile(folderPath, folder);
        if (firstFile) {
          markerFile = firstFile;
          break;
        }
      }
      assets.push({
        assetName,
        contentPath: absolutePath,
        foundFolders: result.foundFolders,
        markerFile,
      });
    } else {
      assets.push({
        assetName,
        contentPath: "(no content found)",
        foundFolders: [],
      });
    }
  }

  for (const zipName of zipFiles) {
    const zipPath = path.join(assetsDir, zipName);

    logDebug(`\nScanning ZIP: ${zipName}`, debug);

    const asset = scanZipAsset(zipPath, debug);
    if (asset) {
      assets.push(asset);
    } else {
      assets.push({
        assetName: path.basename(zipName, ".zip"),
        contentPath: "(no content found in ZIP)",
        foundFolders: [],
      });
    }
  }

  return assets;
}

export async function listDazAssets(config: IListDazAssetsConfig): Promise<void> {
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
