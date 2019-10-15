declare module "@reach/portal" {
  import * as React from "react";

  export type PortalProps = {
    children: React.ReactNode;
    type?: string;
  };

  declare const Portal: React.FunctionComponent<PortalProps>;
  export default Portal;
}
