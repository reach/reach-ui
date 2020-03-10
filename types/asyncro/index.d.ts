declare module "asyncro" {
  export function map<T = any, R = any>(
    array: T[],
    mapper: (value: T, index?: number, arr?: T[]) => Promise<R>
  ): Promise<R[]>;
  let def: { map: typeof map };
  export default def;
}
