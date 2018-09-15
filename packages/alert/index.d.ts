declare module "@reach/alert" {
  type AlertProps = {
    type?: "assertive" | "polite";
  } & HTMLDivElement;

  const Alert: React.SFC<AlertProps>;

  export default Alert;
}
