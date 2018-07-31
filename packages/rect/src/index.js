import React from "react";
import Component from "@reach/component-component";
import observeRect from "@reach/observe-rect";

let render = ({ refs, props: { children }, state: { rect } }) =>
  children({ ref: node => (refs.node = node), rect });

let didMount = ({ setState, refs, props }) => {
  refs.observer = observeRect(refs.node, rect => {
    props.onChange && props.onChange(rect);
    setState({ rect });
  });
  if (props.observe) {
    refs.observer.observe();
  }
};

let didUpdate = ({ refs, props, prevProps }) => {
  if (props.observe && !prevProps.observe) {
    refs.observer.observe();
  } else if (!props.observe && prevProps.observe) {
    refs.observer.unobserve();
  }
};

let willUnmount = ({ refs }) => {
  refs.observer.unobserve();
};

let Rect = props => (
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

Rect.propTypes = {
  onChange: () => {},
  observe: () => {}
};

Rect.defaultProps = {
  observe: true
};

export default Rect;
