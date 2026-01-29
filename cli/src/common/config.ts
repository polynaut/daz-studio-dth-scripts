import { config as loadEnv } from "dotenv";
import type { IConfig, IInstallDazAssetsConfig, IInstallDazDthConfig, IInstallDazPresetsConfig, IListDazAssetsConfig, IOptions } from "./types.js";

loadEnv();

export function getConfig(options: IOptions): IConfig {
  const dazScriptsFolder = options.out || process.env.DAZ_SCRIPTS_FOLDER;

  if (!dazScriptsFolder) {
    throw new Error(
      "DAZ_SCRIPTS_FOLDER not set. Provide --out option or set DAZ_SCRIPTS_FOLDER in .env file."
    );
  }

  return {
    dazScriptsFolder,
    debug: options.debug ?? false,
    dryRun: options.dryRun ?? false,
  };
}

const GENESIS_VERSIONS = [3, 8, 9];

export function getListDazAssetsConfig(options: IOptions): IListDazAssetsConfig {
  // If --assets-dir is provided, use only that
  if (options.assetsDir) {
    return {
      assetSources: [{ label: "Custom", path: options.assetsDir }],
      debug: options.debug ?? false,
    };
  }

  // If --gen is provided, use only that version
  if (options.gen) {
    const envVarName = `DAZ_ASSETS_G${options.gen}`;
    const assetsDir = process.env[envVarName];
    if (!assetsDir) {
      throw new Error(`${envVarName} not set in .env file.`);
    }
    return {
      assetSources: [{ label: `Genesis ${options.gen}`, path: assetsDir }],
      debug: options.debug ?? false,
    };
  }

  // Default: scan all configured versions
  const assetSources = GENESIS_VERSIONS.map((gen) => {
    const envVarName = `DAZ_ASSETS_G${gen}`;
    const path = process.env[envVarName];
    return path ? { label: `Genesis ${gen}`, path } : null;
  }).filter((s) => s !== null);

  if (assetSources.length === 0) {
    throw new Error(
      "No asset directories configured. Set DAZ_ASSETS_G3, DAZ_ASSETS_G8, or DAZ_ASSETS_G9 in .env file."
    );
  }

  return {
    assetSources,
    debug: options.debug ?? false,
  };
}

export function getInstallDazAssetsConfig(options: IOptions): IInstallDazAssetsConfig {
  const listConfig = getListDazAssetsConfig(options);
  const dazLibFolder = options.out || process.env.DAZ_LIB_FOLDER;

  if (!dazLibFolder) {
    throw new Error(
      "DAZ_LIB_FOLDER not set. Provide --out option or set DAZ_LIB_FOLDER in .env file."
    );
  }

  return {
    assetSources: listConfig.assetSources,
    dazLibFolder,
    debug: listConfig.debug,
    dryRun: options.dryRun ?? false,
    force: options.force ?? false,
  };
}

export function getInstallDazDthConfig(options: IOptions): IInstallDazDthConfig {
  const dthReleasesFolder = process.env.DTH_RELEASES_FOLDER;
  const dazLibFolder = options.out || process.env.DAZ_LIB_FOLDER;
  const dazPluginsFolder =
    process.env.DAZ_PLUGINS_FOLDER ||
    "C:/Program Files/DAZ 3D/DAZStudio4/plugins";

  if (!dthReleasesFolder) {
    throw new Error(
      "DTH_RELEASES_FOLDER not set. Set DTH_RELEASES_FOLDER in .env file."
    );
  }

  if (!dazLibFolder) {
    throw new Error(
      "DAZ_LIB_FOLDER not set. Provide --out option or set DAZ_LIB_FOLDER in .env file."
    );
  }

  return {
    dthReleasesFolder,
    dazLibFolder,
    dazPluginsFolder,
    debug: options.debug ?? false,
    dryRun: options.dryRun ?? false,
  };
}

export function getInstallDazPresetsConfig(options: IOptions): IInstallDazPresetsConfig {
  const sourceDir = options.assetsDir || process.env.DAZ_PRESETS_SOURCE;
  const destDir = options.out || process.env.DAZ_PRESETS_DEST;

  if (!sourceDir) {
    throw new Error(
      "DAZ_PRESETS_SOURCE not set. Provide --assets-dir option or set DAZ_PRESETS_SOURCE in .env file."
    );
  }

  if (!destDir) {
    throw new Error(
      "DAZ_PRESETS_DEST not set. Provide --out option or set DAZ_PRESETS_DEST in .env file."
    );
  }

  return {
    sourceDir,
    destDir,
    debug: options.debug ?? false,
    dryRun: options.dryRun ?? false,
  };
}
