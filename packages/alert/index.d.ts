declare module "@reach/alert" {
  type AlertProps = {
    type?: "assertive" | "polite";
  } & HTMLDivElement;

  const Alert: React.FunctionComponent<AlertProps>;

  export default Alert;
}
