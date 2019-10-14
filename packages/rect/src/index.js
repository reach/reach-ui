import React, { useRef, useState, useLayoutEffect } from "react";
import observeRect from "@reach/observe-rect";
import { func, bool } from "prop-types";

let Rect = ({ onChange, observe, children }) => {
  const ref = React.useRef(null);
  const rect = useRect(ref, observe, onChange);
  return children({ ref, rect });
};

Rect.defaultProps = {
  observe: true
};

if (__DEV__) {
  Rect.propTypes = {
    children: func,
    observe: bool,
    onChange: func
  };
}

export function useRect(nodeRef, observe = true, onChange) {
  let [rect, setRect] = useState(null);
  let observerRef = useRef(null);
  useLayoutEffect(() => {
    const cleanup = () => {
      observerRef.current && observerRef.current.unobserve();
    };

    if (!nodeRef.current) {
      console.warn("You need to place the ref");
      return cleanup;
    }

    if (!observerRef.current && nodeRef.current) {
      observerRef.current = observeRect(nodeRef.current, rect => {
        onChange && onChange(rect);
        setRect(rect);
      });
    }

    observe && observerRef.current.observe();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observe, onChange]);
  return rect;
}

export default Rect;
