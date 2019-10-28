declare module "@reach/portal" {
  import * as React from "react";

  export type PortalProps = {
    children: React.ReactNode;
    type?: string;
  };

  const Portal: React.FunctionComponent<PortalProps>;
  export default Portal;
}
