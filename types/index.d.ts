declare const __DEV__: boolean;

declare module "jest-axe" {
  import { run, RunOptions, AxeResults } from "axe-core";
  export function axe<T extends RunOptions = RunOptions>(
    html: any,
    additionalOptions?: T
  ): Promise<AxeResults>;
  export function configureAxe<T extends RunOptions = RunOptions>(
    defaultOptions?: T
  ): (html: any, additionalOptions: RunOptions) => Promise<AxeResults>;
  export const toHaveNoViolations: jest.ExpectExtendMap;
}

declare module "latinize" {
  export default function latinize(string: string): string;
}
