import args from "args";
import { getConfig, getInstallDazAssetsConfig, getInstallDazDthConfig, getInstallDazPresetsConfig, getInstallHoudiniDthConfig, getInstallHoudiniPresetsConfig, getListDazAssetsConfig, getSyncSolScriptsConfig } from "./common/config.js";
import { logError } from "./common/utils.js";
import { syncDazDthScripts } from "./commands/syncDazDthScripts/syncDazDthScripts.js";
import { listDazAssets } from "./commands/listDazAssets/listDazAssets.js";
import { uninstallDaz } from "./commands/uninstallDaz/uninstallDaz.js";
import { installDazAssets } from "./commands/installDazAssets/installDazAssets.js";
import { installDazDth } from "./commands/installDazDth/installDazDth.js";
import { installDazPresets } from "./commands/installDazPresets/installDazPresets.js";
import { installHoudiniDth } from "./commands/installHoudiniDth/installHoudiniDth.js";
import { installHoudiniPresets } from "./commands/installHoudiniPresets/installHoudiniPresets.js";
import { syncSolScripts } from "./commands/syncSolScripts/syncSolScripts.js";
import type { IOptions } from "./common/types.js";

args
  .option("out", "Override DAZ_SCRIPTS_FOLDER path")
  .option("assets-dir", "Override DAZ_ASSETS_G* path")
  .option("gen", "Genesis version (3, 8, or 9)")
  .option("debug", "Enable debug logging", false)
  .option("dry-run", "Show what would be copied without doing it", false)
  .option("force", "Force install even if assets appear already installed", false);

const flags = args.parse(process.argv) as IOptions;
const command = args.sub[0];

async function run() {
  try {
    if (command === "list-daz-assets") {
      const config = getListDazAssetsConfig(flags);
      await listDazAssets(config);
    } else if (command === "uninstall-daz") {
      await uninstallDaz({ dryRun: flags.dryRun ?? false });
    } else if (command === "install-daz-assets") {
      const config = getInstallDazAssetsConfig(flags);
      await installDazAssets(config);
    } else if (command === "install-daz-dth") {
      const config = getInstallDazDthConfig(flags);
      await installDazDth(config);
    } else if (command === "install-daz-presets") {
      const config = getInstallDazPresetsConfig(flags);
      await installDazPresets(config);
    } else if (command === "install-houdini-dth") {
      const config = getInstallHoudiniDthConfig(flags);
      await installHoudiniDth(config);
    } else if (command === "install-houdini-presets") {
      const config = getInstallHoudiniPresetsConfig(flags);
      await installHoudiniPresets(config);
    } else if (command === "sync-sol-scripts") {
      const config = getSyncSolScriptsConfig(flags);
      await syncSolScripts(config);
    } else {
      const config = getConfig(flags);
      await syncDazDthScripts(config);
    }
  } catch (error) {
    if (error instanceof Error) {
      logError(error.message);
    }
    process.exit(1);
  }
}

run();
