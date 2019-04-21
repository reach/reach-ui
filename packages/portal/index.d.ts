declare module "@reach/portal" {
  type PortalProps = {
    type?: string;
    children?: React.ReactNode;
  };

  export const Portal: React.FC<PortalProps>;
}
