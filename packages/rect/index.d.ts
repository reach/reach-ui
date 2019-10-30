import * as React from "react";

export type RectProps<T = any> = {
  observe?: boolean;
  onChange?: (rect: DOMRect) => void;
  children?(args: { rect: DOMRect; ref: React.Ref<T> }): React.ReactNode;
};

declare const Rect: React.FunctionComponent<RectProps>;

export function useRect<T = any>(
  ref: React.Ref<T>,
  observe?: boolean,
  onChange?: (rect: DOMRect) => void
): DOMRect;

export default Rect;
