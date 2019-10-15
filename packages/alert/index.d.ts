declare module "@reach/alert" {
  import * as React from "react";

  export type AlertProps = {
    type?: "assertive" | "polite";
  } & HTMLDivElement;

  const Alert: React.FunctionComponent<AlertProps>;

  export default Alert;
}
