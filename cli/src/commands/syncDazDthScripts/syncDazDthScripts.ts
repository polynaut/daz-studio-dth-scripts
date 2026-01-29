import { rm, cp, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { IConfig } from "../../common/types.js";
import {
  logError,
  logSuccess,
  logInfo,
  logDebug,
  logDryRun,
} from "../../common/utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEST_FOLDER_NAME = "DTH Scripts Workflow";

async function countFiles(dir: string): Promise<number> {
  let count = 0;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += await countFiles(join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

export async function syncDazDthScripts(config: IConfig): Promise<void> {
  const srcPath = join(__dirname, "..", "..", "..", "..", "scripts");
  const destPath = join(config.dazScriptsFolder, DEST_FOLDER_NAME);

  logDebug(`Source path: ${srcPath}`, config.debug);
  logDebug(`Destination path: ${destPath}`, config.debug);

  if (config.dryRun) {
    logDryRun(`Would delete: ${destPath}`);
    logDryRun(`Would copy: ${srcPath} -> ${destPath}`);
    const fileCount = await countFiles(srcPath);
    logDryRun(`Would copy ${fileCount} files`);
    return;
  }

  logInfo(`Syncing scripts to ${destPath}...`);

  try {
    logDebug("Removing existing destination folder...", config.debug);
    await rm(destPath, { recursive: true, force: true });

    logDebug("Copying scripts...", config.debug);
    await cp(srcPath, destPath, { recursive: true });

    const fileCount = await countFiles(destPath);
    logSuccess(`Synced ${fileCount} files to ${destPath}`);
  } catch (error) {
    if (error instanceof Error) {
      logError(error.message);
    } else {
      logError("An unknown error occurred");
    }
    process.exit(1);
  }
}
