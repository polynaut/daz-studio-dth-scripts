import { styleText } from "node:util";

export function log(message: string): void {
  console.log(message);
}

export function logError(message: string): void {
  console.error(styleText("red", `Error: ${message}`));
}

export function logSuccess(message: string): void {
  console.log(styleText("green", message));
}

export function logInfo(message: string): void {
  console.log(styleText("cyan", message));
}

export function logDebug(message: string, debug: boolean): void {
  if (debug) {
    console.log(styleText("gray", `[debug] ${message}`));
  }
}

export function logDryRun(message: string): void {
  console.log(styleText("yellow", `[dry-run] ${message}`));
}

export function logWarning(message: string): void {
  console.log(styleText("yellow", message));
}
