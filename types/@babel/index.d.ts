declare module "@babel/core" {
  // @see line 226 of https://unpkg.com/@babel/core@7.4.4/lib/index.js
  export const DEFAULT_EXTENSIONS: string[];
  export function createConfigItem(boop: any[], options: any): void;
}
