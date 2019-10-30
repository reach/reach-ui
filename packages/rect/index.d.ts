declare module "@reach/rect" {
  import * as React from "react";

  export type RectProps = {
    observe?: boolean;
    onChange?: (rect: DOMRect) => void;
    children?(args: { rect: DOMRect; ref: React.Ref<any> }): React.ReactNode;
  };

  const Rect: React.FunctionComponent<RectProps>;

  export function useRect(
    ref: React.Ref<any>,
    observe?: boolean,
    onChange?: (rect: DOMRect) => void
  ): DOMRect;

  export default Rect;
}
