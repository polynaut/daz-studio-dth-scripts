import { config as loadEnv } from "dotenv";
import type { IConfig, IListAssetsConfig, IOptions } from "./types.js";

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

export function getListAssetsConfig(options: IOptions): IListAssetsConfig {
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
