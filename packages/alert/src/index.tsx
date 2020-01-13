/**
 * Welcome to @reach/alert!
 *
 * The approach here is to allow developers to render a visual <Alert> and then
 * we mirror that to a couple of aria live regions behind the scenes. This way,
 * most of the time, developers don't have to think about visual vs. aria
 * alerts.
 *
 * Limitations: Developers can't read from context inside of an Alert because
 * we aren't using ReactDOM.createPortal(), we're actually creating a couple of
 * brand new React roots. We could use createPortal but then apps would need to
 * render the entire app tree in an <AlertProvider>, or maybe there's a way
 * with default context to do it, but we haven't explored that yet. So, we'll
 * see how this goes, and if it becomes a problem, we can introduce a portal
 * later.
 *
 * @see Docs     https://reacttraining.com/reach-ui/alert
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/alert
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#alert
 */
import React, { forwardRef, useEffect, useRef, useMemo } from "react";
import { render } from "react-dom";
import VisuallyHidden from "@reach/visually-hidden";
import { usePrevious, useForkedRef } from "@reach/utils";
import PropTypes from "prop-types";

/*
 * Singleton state is fine because you don't server render
 * an alert (SRs don't read them on first load anyway)
 */
let keys: RegionKeys = {
  polite: -1,
  assertive: -1
};

let elements: ElementTypes = {
  polite: {},
  assertive: {}
};

let liveRegions: RegionElements = {
  polite: null,
  assertive: null
};

let renderTimer: number | null;

////////////////////////////////////////////////////////////////////////////////

/**
 * Alert
 *
 * Screen-reader-friendly alert messages. In many apps developers add "alert"
 * messages when network events or other things happen. Users with assistive
 * technologies may not know about the message unless you develop for it.
 *
 * @see Docs https://reacttraining.com/reach-ui/alert
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
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

/**
 * @see Docs https://reacttraining.com/reach-ui/alert#alert-props
 */
export type AlertProps = {
  /**
   * Controls whether the assistive technology should read immediately
   * ("assertive") or wait until the user is idle ("polite").
   *
   * @see Docs https://reacttraining.com/reach-ui/alert#alert-type
   */
  type?: "assertive" | "polite";
  children: React.ReactNode;
};

Alert.displayName = "Alert";
if (__DEV__) {
  Alert.propTypes = {
    children: PropTypes.node,
    type: PropTypes.oneOf(["assertive", "polite"])
  };
}

export default Alert;

////////////////////////////////////////////////////////////////////////////////

function createMirror(type: "polite" | "assertive", doc = document): Mirror {
  let key = ++keys[type];

  let mount = (element: JSX.Element) => {
    if (liveRegions[type]) {
      elements[type][key] = element;
      renderAlerts();
    } else {
      let node = doc.createElement("div");
      node.setAttribute(`data-reach-live-${type}`, "true");
      liveRegions[type] = node;
      doc.body.appendChild(liveRegions[type]!);
      mount(element);
    }
  };

  let update = (element: JSX.Element) => {
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
  if (renderTimer != null) {
    window.clearTimeout(renderTimer);
  }
  renderTimer = window.setTimeout(() => {
    Object.keys(elements).forEach(elementType => {
      let type: RegionTypes = elementType as RegionTypes;
      let container = liveRegions[type]!;
      if (container) {
        render(
          <VisuallyHidden>
            <div
              role={type === "assertive" ? "alert" : "status"}
              aria-live={type}
            >
              {Object.keys(elements[type]).map(key =>
                React.cloneElement(elements[type][key as any], {
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

function useMirrorEffects(
  type: RegionTypes,
  element: JSX.Element,
  ref: React.RefObject<any>
) {
  const prevType = usePrevious<RegionTypes>(type);
  const mirror = useRef<Mirror | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    const { ownerDocument } = ref.current || {};
    if (!mounted.current) {
      mounted.current = true;
      mirror.current = createMirror(type, ownerDocument);
      mirror.current.mount(element);
    } else if (prevType !== type) {
      mirror.current && mirror.current.unmount();
      mirror.current = createMirror(type, ownerDocument);
      mirror.current.mount(element);
    } else {
      mirror.current && mirror.current.update(element);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, type, prevType]);

  useEffect(() => {
    return () => {
      mirror.current && mirror.current.unmount();
    };
  }, []);
}

////////////////////////////////////////////////////////////////////////////////
// Types

type Mirror = {
  mount: (element: JSX.Element) => void;
  update: (element: JSX.Element) => void;
  unmount: () => void;
};

type RegionTypes = "polite" | "assertive";

type ElementTypes = {
  [key in RegionTypes]: {
    [key: number]: JSX.Element;
  };
};

type RegionElements<T extends HTMLElement = HTMLDivElement> = {
  [key in RegionTypes]: T | null;
};

type RegionKeys = {
  [key in RegionTypes]: number;
};
