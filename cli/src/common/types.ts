export interface IOptions {
  out?: string;
  debug?: boolean;
  dryRun?: boolean;
  assetsDir?: string;
  gen?: number;
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
}

export interface IAssetSource {
  label: string;
  path: string;
}

export interface IListAssetsConfig {
  assetSources: IAssetSource[];
  debug: boolean;
}

export interface IInstallAssetsConfig {
  assetSources: IAssetSource[];
  dazLibFolder: string;
  debug: boolean;
  dryRun: boolean;
}

export interface IInstallDthConfig {
  dthReleasesFolder: string;
  dazLibFolder: string;
  dazPluginsFolder: string;
  debug: boolean;
  dryRun: boolean;
}
