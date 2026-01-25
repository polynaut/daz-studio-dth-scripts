import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import * as readline from "node:readline";
import { config as loadEnv } from "dotenv";
import {
  log,
  logError,
  logSuccess,
  logWarning,
  logDryRun,
} from "../../common/utils.js";

loadEnv();

interface UninstallOptions {
  dryRun: boolean;
}

function getDazFolders(): string[] {
  const appData = process.env.APPDATA || "";
  const myDazLibFolder = process.env.UNINSTALL_MY_DAZ_LIB_FOLDER;

  const folders: string[] = [];

  if (myDazLibFolder) {
    folders.push(myDazLibFolder);
  }

  folders.push(
    "D:\\User Data\\Documents\\DAZ 3D",
    "E:\\User Data\\Documents\\DAZ 3D",
    "C:\\Users\\Public\\Documents\\My DAZ 3D Library",
    join(appData, "DAZ 3D"),
    join(appData, "Microsoft\\Windows\\Start Menu\\Programs\\DAZ 3D")
  );

  return folders;
}

function waitForKeypress(): Promise<void> {
  return new Promise((resolve) => {
    // If not running in a TTY, skip waiting for keypress
    if (!process.stdin.isTTY) {
      resolve();
      return;
    }

    const rl = readline.createInterface({ input: process.stdin });
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once("data", () => {
      process.stdin.setRawMode(false);
      rl.close();
      resolve();
    });
  });
}

function deleteFolderIfExists(
  path: string,
  dryRun: boolean
): "deleted" | "not found" | "error" {
  if (!existsSync(path)) {
    return "not found";
  }

  if (dryRun) {
    return "deleted";
  }

  try {
    rmSync(path, { recursive: true, force: true });
    return "deleted";
  } catch {
    return "error";
  }
}

export async function uninstallDaz(options: UninstallOptions): Promise<void> {
  log("DAZ Studio Cleanup Helper\n");
  log("Before running this cleanup, please:");
  log("1. Uninstall everything with DAZ Install Manager");
  log('2. Use "Add or Remove Programs" in Windows to uninstall DAZ Install Manager\n');

  if (options.dryRun) {
    logDryRun("Running in dry-run mode - no folders will be deleted\n");
  }

  log("Press any key to continue...");
  await waitForKeypress();
  log("");

  const folders = getDazFolders();

  for (const folder of folders) {
    const prefix = options.dryRun ? "[dry-run] " : "";
    process.stdout.write(`${prefix}Deleting ${folder}... `);

    const result = deleteFolderIfExists(folder, options.dryRun);

    switch (result) {
      case "deleted":
        logSuccess("deleted");
        break;
      case "not found":
        logWarning("not found");
        break;
      case "error":
        logError("error (permission denied or in use)");
        break;
    }
  }

  log("\nCleanup complete!");
  log("");
  logSuccess("Now get DAZ Install Manager again and before installing anything with it,");
  logSuccess(`add "${process.env.UNINSTALL_MY_DAZ_LIB_FOLDER}" as a custom My DAZ Library folder in the settings.`);
}
