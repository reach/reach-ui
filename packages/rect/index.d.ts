declare module "@reach/rect" {
  interface IClientRect {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  type IRectProps = {
    observe?: boolean;
    onChange?: (rect: IClientRect) => void;
    children?: React.ReactNode;
  };

  const Rect: React.SFC<IRectProps>;

  export default Rect;
}
