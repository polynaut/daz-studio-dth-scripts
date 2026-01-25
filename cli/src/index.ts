import args from "args";
import { getConfig, getListAssetsConfig } from "./common/config.js";
import { logError } from "./common/utils.js";
import { syncScripts } from "./commands/sync/sync.js";
import { listAssets } from "./commands/listAssets/listAssets.js";
import { uninstallDaz } from "./commands/uninstallDaz/uninstallDaz.js";
import type { IOptions } from "./common/types.js";

args
  .option("out", "Override DAZ_SCRIPTS_FOLDER path")
  .option("assets-dir", "Override DAZ_ASSETS_G* path")
  .option("gen", "Genesis version (3, 8, or 9)", 9)
  .option("debug", "Enable debug logging", false)
  .option("dry-run", "Show what would be copied without doing it", false);

const flags = args.parse(process.argv) as IOptions;
const command = args.sub[0];

async function run() {
  try {
    if (command === "list-assets") {
      const config = getListAssetsConfig(flags);
      await listAssets(config);
    } else if (command === "uninstall-daz") {
      await uninstallDaz({ dryRun: flags.dryRun ?? false });
    } else {
      const config = getConfig(flags);
      await syncScripts(config);
    }
  } catch (error) {
    if (error instanceof Error) {
      logError(error.message);
    }
    process.exit(1);
  }
}

run();
