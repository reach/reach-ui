declare module "@reach/utils" {
  export const checkStyles: (pkg: string) => void;
  export const wrapEvent: (
    handler: React.ReactEventHandler,
    cb: React.ReactEventHandler
  ) => React.ReactEventHandler;
}
