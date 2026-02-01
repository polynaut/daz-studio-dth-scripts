export interface IOptions {
  out?: string;
  debug?: boolean;
  dryRun?: boolean;
  assetsDir?: string;
  gen?: number;
  force?: boolean;
}

export interface IConfig {
  dazScriptsFolder: string;
  debug: boolean;
  dryRun: boolean;
}

export interface IAssetInfo {
  assetName: string;
  contentPath: string;
  foundFolders: string[];
  isTemp?: boolean;
  tempDir?: string;
  markerFile?: string; // relative path to first file (for skip detection)
}

export interface IAssetSource {
  label: string;
  path: string;
}

export interface IListDazAssetsConfig {
  assetSources: IAssetSource[];
  debug: boolean;
}

export interface IInstallDazAssetsConfig {
  assetSources: IAssetSource[];
  dazLibFolder: string;
  debug: boolean;
  dryRun: boolean;
  force: boolean;
}

export interface IInstallDazDthConfig {
  dthReleasesFolder: string;
  dazLibFolder: string;
  dazPluginsFolder: string;
  debug: boolean;
  dryRun: boolean;
}

export interface IInstallDazPresetsConfig {
  sourceDir: string;
  destDir: string;
  debug: boolean;
  dryRun: boolean;
}

export interface IInstallHoudiniDthConfig {
  dthReleasesFolder: string;
  houdiniFolder: string;
  debug: boolean;
  dryRun: boolean;
}

export interface IInstallHoudiniPresetsConfig {
  sourceDir: string;
  houdiniFolder: string;
  debug: boolean;
  dryRun: boolean;
}

export interface ISyncSolScriptsConfig {
  solScriptsFolder: string;
  dazScriptsFolder: string;
  debug: boolean;
  dryRun: boolean;
}
