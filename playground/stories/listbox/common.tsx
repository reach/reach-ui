import * as React from "react";

export const Tag: React.FC<React.ComponentPropsWithoutRef<"span">> = (
  props
) => {
  let [innerText, setInnerText] = React.useState<string | null>(null);
  let ref = React.useRef<HTMLSpanElement | null>(null);
  let setInnerTextRef = React.useCallback((node: HTMLSpanElement) => {
    ref.current = node;
    if (node) {
      setInnerText(node.innerText);
    }
  }, []);
  return (
    <span
      ref={setInnerTextRef}
      aria-label={innerText || undefined}
      style={{
        display: "inline-block",
        lineHeight: 1,
        fontSize: 11,
        textTransform: "uppercase",
        fontWeight: "bolder",
        marginLeft: 6,
        padding: 4,
        background: "crimson",
        borderRadius: 2,
        color: "#fff",
      }}
      {...props}
    />
  );
};

export function Taco() {
  return (
    <span aria-hidden style={{ display: "inline-block", margin: "0 4px" }}>
      🌮
    </span>
  );
}
