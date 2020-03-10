declare module "pascal-case" {
  export interface Options {
    splitRegexp?: RegExp | RegExp[];
    stripRegexp?: RegExp | RegExp[];
    delimiter?: string;
    transform?: (part: string, index: number, parts: string[]) => string;
  }
  export function pascalCaseTransform(input: string, index: number): string;
  export function pascalCaseTransformMerge(input: string): string;
  export function pascalCase(input: string, options?: Options): string;
  export default pascalCase;
}
