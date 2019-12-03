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

import React, { forwardRef, useEffect, useRef, useMemo } from "react";
import { render } from "react-dom";
import VisuallyHidden from "@reach/visually-hidden";
import { usePrevious, useForkedRef } from "@reach/utils";
import PropTypes from "prop-types";

// singleton state is fine because you don't server render
// an alert (SRs don't read them on first load anyway)
let keys = {
  polite: -1,
  assertive: -1
};

let elements = {
  polite: {},
  assertive: {}
};

let liveRegions = {
  polite: null,
  assertive: null
};

let renderTimer = null;

////////////////////////////////////////////////////////////////////////////////
// Alert

export const Alert = forwardRef(function Alert(
  { children, type = "polite", ...props },
  forwardedRef
) {
  const ownRef = useRef(null);
  const ref = useForkedRef(forwardedRef, ownRef);
  const child = useMemo(
    () => (
      <div {...props} ref={ref} data-reach-alert>
        {children}
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [children, props]
  );
  useMirrorEffects(type, child, ownRef);

  return child;
});

Alert.displayName = "Alert";
if (__DEV__) {
  Alert.propTypes = {
    children: PropTypes.node,
    type: PropTypes.string
  };
}

export default Alert;

////////////////////////////////////////////////////////////////////////////////

function createMirror(type, doc = document) {
  let key = ++keys[type];

  let mount = element => {
    if (liveRegions[type]) {
      elements[type][key] = element;
      renderAlerts();
    } else {
      let node = doc.createElement("div");
      node.setAttribute(`data-reach-live-${type}`, "true");
      liveRegions[type] = node;
      doc.body.appendChild(liveRegions[type]);
      mount(element);
    }
  };

  let update = element => {
    elements[type][key] = element;
    renderAlerts();
  };

  let unmount = () => {
    delete elements[type][key];
    renderAlerts();
  };

  return { mount, update, unmount };
}

function renderAlerts() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    Object.keys(elements).forEach(type => {
      let container = liveRegions[type];
      if (container) {
        render(
          <VisuallyHidden>
            <div
              role={type === "assertive" ? "alert" : "status"}
              aria-live={type}
            >
              {Object.keys(elements[type]).map(key =>
                React.cloneElement(elements[type][key], {
                  key,
                  ref: null
                })
              )}
            </div>
          </VisuallyHidden>,
          liveRegions[type]
        );
      }
    });
  }, 500);
}

function useMirrorEffects(type, element, ref) {
  const prevType = usePrevious(type);
  const mirror = useRef(null);
  const mounted = useRef(false);
  useEffect(() => {
    const { ownerDocument } = ref.current || {};
    if (!mounted.current) {
      mounted.current = true;
      mirror.current = createMirror(type, ownerDocument);
      mirror.current.mount(element);
    } else if (!prevType !== type) {
      mirror.current.unmount();
      mirror.current = createMirror(type, ownerDocument);
      mirror.current.mount(element);
    } else {
      mirror.current.update(element, prevType, type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, type, prevType]);

  useEffect(() => {
    return () => {
      mirror.current && mirror.current.unmount();
    };
  }, []);
}
