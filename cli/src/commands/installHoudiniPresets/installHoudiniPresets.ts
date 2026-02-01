import * as fs from "fs";
import * as path from "path";
import type { IInstallHoudiniPresetsConfig } from "../../common/types.js";
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

function ensureHoudiniEnv(
  houdiniFolder: string,
  presetsFolderName: string,
  dryRun: boolean,
  debug: boolean
): void {
  const houdiniEnvPath = path.join(houdiniFolder, "houdini.env");

  // Use forward slashes for the env file (works on Windows)
  const presetsPath = path.join(houdiniFolder, presetsFolderName).replace(/\\/g, "/");

  const sharedPresetsLine = `SHARED_PRESETS = "${presetsPath}"`;
  const houdiniPathLine = `HOUDINI_PATH = $HOUDINI_PATH;$SHARED_PRESETS`;

  let existingContent = "";
  if (fs.existsSync(houdiniEnvPath)) {
    existingContent = fs.readFileSync(houdiniEnvPath, "utf-8");
  }

  // Check if lines already exist
  const lines = existingContent.split(/\r?\n/);
  const hasSharedPresets = lines.some((line) => {
    const trimmed = line.trim();
    return trimmed.startsWith("SHARED_PRESETS =") || trimmed.startsWith("SHARED_PRESETS=");
  });
  const hasHoudiniPath = lines.some((line) => {
    const trimmed = line.trim();
    return trimmed.startsWith("HOUDINI_PATH =") || trimmed.startsWith("HOUDINI_PATH=");
  });

  if (hasSharedPresets && hasHoudiniPath) {
    log(`\nhoudini.env already contains required configuration.`);
    logDebug(`  Path: ${houdiniEnvPath}`, debug);
    return;
  }

  // Build the content to add
  const linesToAdd: string[] = [];
  if (!hasSharedPresets) {
    linesToAdd.push(sharedPresetsLine);
  }
  if (!hasHoudiniPath) {
    linesToAdd.push(houdiniPathLine);
  }

  // Format with blank line between if both are being added
  const contentToAdd = linesToAdd.length === 2
    ? `${linesToAdd[0]}\n\n${linesToAdd[1]}`
    : linesToAdd.join("\n");

  if (dryRun) {
    log(`\nWould update houdini.env with:`);
    for (const line of linesToAdd) {
      log(`  ${line}`);
    }
    return;
  }

  // Append to file
  let newContent = existingContent;
  if (newContent.length > 0 && !newContent.endsWith("\n")) {
    newContent += "\n";
  }
  if (newContent.length > 0) {
    newContent += "\n"; // Add blank line before our additions
  }
  newContent += contentToAdd + "\n";

  fs.writeFileSync(houdiniEnvPath, newContent, "utf-8");
  log(`\nUpdated houdini.env with:`);
  for (const line of linesToAdd) {
    log(`  ${line}`);
  }
}

export async function installHoudiniPresets(config: IInstallHoudiniPresetsConfig): Promise<void> {
  const { sourceDir, houdiniFolder, debug, dryRun } = config;

  if (dryRun) {
    log("=== DRY RUN MODE ===\n");
  }

  const presetsFolderName = path.basename(sourceDir);
  const destDir = path.join(houdiniFolder, presetsFolderName);

  log(`Source: ${sourceDir}`);
  log(`Destination: ${destDir}\n`);

  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory does not exist: ${sourceDir}`);
  }

  // Delete existing destination folder if it exists
  if (fs.existsSync(destDir)) {
    const existingFileCount = countFiles(destDir);
    if (dryRun) {
      log(`Would delete existing folder: ${destDir} (${existingFileCount} files)`);
    } else {
      logDebug(`Deleting existing folder: ${destDir}`, debug);
      fs.rmSync(destDir, { recursive: true, force: true });
      log(`Deleted existing folder (${existingFileCount} files)`);
    }
  }

  // Copy source folder to destination
  const fileCount = countFiles(sourceDir);

  if (dryRun) {
    log(`Would copy: ${sourceDir}`);
    log(`  -> ${destDir} (${fileCount} files)`);
  } else {
    logDebug(`Copying: ${sourceDir} -> ${destDir}`, debug);
    fs.cpSync(sourceDir, destDir, { recursive: true });
    log(`Copied ${fileCount} files`);
  }

  // Update houdini.env
  ensureHoudiniEnv(houdiniFolder, presetsFolderName, dryRun, debug);

  log("");

  if (dryRun) {
    log(`=== DRY RUN COMPLETE ===`);
  } else {
    log(`=== INSTALL COMPLETE ===`);
  }
}
