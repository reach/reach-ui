declare module "@reach/alert" {
  type AlertProps = {
    type?: "assertive" | "polite";
  } & HTMLDivElement;

  const Alert: React.FC<AlertProps>;

  export default Alert;
}
