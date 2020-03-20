declare module "rollup-plugin-babel" {
  export function custom(arg: any): any;
  let def: { custom: typeof custom };
  export default def;
}
