import React, { useRef, useState, useLayoutEffect } from "react";
import Component from "@reach/component-component";
import observeRect from "@reach/observe-rect";
import { func, bool } from "prop-types";

const render = ({ refs, props: { children }, state: { rect } }) =>
  children({ ref: node => (refs.node = node), rect });

const didMount = ({ setState, refs, props }) => {
  if (!refs.node) {
    console.warn("You need to place the ref");
    return;
  }
  refs.observer = observeRect(refs.node, rect => {
    props.onChange && props.onChange(rect);
    setState({ rect });
  });
  if (props.observe) {
    refs.observer.observe();
  }
};

const didUpdate = ({ refs, props, prevProps }) => {
  if (props.observe && !prevProps.observe) {
    refs.observer.observe();
  } else if (!props.observe && prevProps.observe) {
    refs.observer.unobserve();
  }
};

const willUnmount = ({ refs }) => {
  refs.observer.unobserve();
};

const Rect = props => (
  <Component
    {...props}
    refs={{
      node: undefined,
      observer: undefined
    }}
    initialState={{
      rect: undefined
    }}
    didMount={didMount}
    didUpdate={didUpdate}
    willUnmount={willUnmount}
    render={render}
  />
);

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

export function useRect(nodeRef, observe = true) {
  const [rect, setRect] = useState(null);
  const observerRef = useRef(null);
  useLayoutEffect(() => {
    if (!observerRef.current && nodeRef.current) {
      observerRef.current = observeRect(nodeRef.current, setRect);
    }
    if (observe) {
      observerRef.current.observe();
    }
    return () => observerRef.current.unobserve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observe]);
  return rect;
}

export default Rect;
