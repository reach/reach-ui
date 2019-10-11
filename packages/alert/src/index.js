// The approach here is to allow developers to render a visual <Alert> and then
// we mirror that to a couple of aria live regions behind the scenes. This way,
// most of the time, developers don't have to think about visual vs. aria
// alerts.
//
// Limitations: Developers can't read from context inside of an Alert because
// we aren't using ReactDOM.createPortal(), we're actually creating a couple of
// brand new React roots. We could use createPortal but then apps would need to
// render the entire app tree in an <AlertProvider>, or maybe there's a way
// with default context to do it, but we haven't explored that yet. So, we'll
// see how this goes, and if it becomes a problem, we can introduce a portal
// later.

import React from "react";
import { render } from "react-dom";
import Component from "@reach/component-component";
import VisuallyHidden from "@reach/visually-hidden";
import { node, string } from "prop-types";

// singleton state is fine because you don't server render
// an alert (SRs don't read them on first load anyway)
const keys = {
  polite: -1,
  assertive: -1
};

const elements = {
  polite: {},
  assertive: {}
};

const liveRegions = {
  polite: null,
  assertive: null
};

let renderTimer = null;

const renderAlerts = () => {
  clearTimeout(renderTimer);

  renderTimer = setTimeout(() => {
    Object.keys(elements).forEach(type => {
      const container = liveRegions[type];
      if (container) {
        render(
          <VisuallyHidden>
            <div
              role={type === "assertive" ? "alert" : "status"}
              aria-live={type}
            >
              {Object.keys(elements[type]).map(key =>
                React.cloneElement(elements[type][key], {
                  key
                })
              )}
            </div>
          </VisuallyHidden>,
          liveRegions[type]
        );
      }
    });
  }, 500);
};

const createMirror = type => {
  const key = ++keys[type];

  const mount = element => {
    if (liveRegions[type]) {
      elements[type][key] = element;
      renderAlerts();
    } else {
      const node = document.createElement("div");
      node.setAttribute(`data-reach-live-${type}`, "true");
      liveRegions[type] = node;
      document.body.appendChild(liveRegions[type]);
      mount(element);
    }
  };

  const update = element => {
    elements[type][key] = element;
    renderAlerts();
  };

  const unmount = element => {
    delete elements[type][key];
    renderAlerts();
  };

  return { mount, update, unmount };
};

const Alert = ({ children, type, ...props }) => {
  const element = (
    <div {...props} data-reach-alert>
      {children}
    </div>
  );
  return (
    <Component
      type={type}
      getRefs={() => ({ mirror: createMirror(type) })}
      didMount={({ refs }) => refs.mirror.mount(element)}
      didUpdate={({ refs, prevProps }) => {
        if (prevProps.type !== type) {
          refs.mirror.unmount();
          refs.mirror = createMirror(type);
          refs.mirror.mount(element);
        } else {
          refs.mirror.update(element, prevProps.type, type);
        }
      }}
      willUnmount={({ refs }) => refs.mirror.unmount(element)}
      children={element}
    />
  );
};

Alert.defaultProps = {
  type: "polite"
};

if (__DEV__) {
  Alert.propTypes = {
    children: node,
    type: string
  };
}

export default Alert;
