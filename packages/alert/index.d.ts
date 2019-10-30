import * as React from "react";

export type AlertProps = {
  type?: "assertive" | "polite";
} & HTMLDivElement;

declare const Alert: React.FunctionComponent<AlertProps>;

export default Alert;
