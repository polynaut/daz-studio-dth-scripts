import * as fs from "fs";
import * as path from "path";
import type { IInstallDazPresetsConfig } from "../../common/types.js";
import { log, logDebug } from "../../common/utils.js";

interface CopyResult {
  added: number;
  skipped: number;
}

function copyFolderAddOnly(
  srcDir: string,
  destDir: string,
  dryRun: boolean,
  debug: boolean
): CopyResult {
  const result: CopyResult = { added: 0, skipped: 0 };

  if (!fs.existsSync(srcDir)) {
    logDebug(`Source directory does not exist: ${srcDir}`, debug);
    return result;
  }

  // Ensure destination directory exists
  if (!dryRun && !fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    logDebug(`Created directory: ${destDir}`, debug);
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      // Recurse into subdirectory
      const subResult = copyFolderAddOnly(srcPath, destPath, dryRun, debug);
      result.added += subResult.added;
      result.skipped += subResult.skipped;
    } else {
      // Check if file already exists in destination
      if (fs.existsSync(destPath)) {
        logDebug(`Skipping (exists): ${destPath}`, debug);
        result.skipped++;
      } else {
        if (dryRun) {
          log(`Would add: ${destPath}`);
        } else {
          // Ensure parent directory exists
          const parentDir = path.dirname(destPath);
          if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
          }
          fs.copyFileSync(srcPath, destPath);
          logDebug(`Added: ${destPath}`, debug);
        }
        result.added++;
      }
    }
  }

  return result;
}

export async function installDazPresets(config: IInstallDazPresetsConfig): Promise<void> {
  const { sourceDir, destDir, debug, dryRun } = config;

  if (dryRun) {
    log("=== DRY RUN MODE ===\n");
  }

  log(`Source: ${sourceDir}`);
  log(`Destination: ${destDir}\n`);

  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory does not exist: ${sourceDir}`);
  }

  log("Scanning for new preset files...\n");

  const result = copyFolderAddOnly(sourceDir, destDir, dryRun, debug);

  if (dryRun) {
    log(`\n=== DRY RUN COMPLETE ===`);
    log(`Would add ${result.added} new files.`);
    log(`Would skip ${result.skipped} existing files.`);
  } else {
    log(`\n=== INSTALL COMPLETE ===`);
    log(`Added ${result.added} new files.`);
    log(`Skipped ${result.skipped} existing files.`);
  }
}
