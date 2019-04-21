declare module "@reach/rect" {
  import { Ref } from "react"
  interface ClientRect {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  type RectProps = {
    observe?: boolean;
    onChange?: (rect: ClientRect) => void;
    children?: React.ReactNode;
  };

  const Rect: React.FC<RectProps>

  export default Rect
  export function useRect(rect: Ref, isSelected?: boolean): ClientRect
}
