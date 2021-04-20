/**
 * Welcome to @reach/alert!
 *
 * An alert is an element that displays a brief, important message in a way that
 * attracts the user's attention without interrupting the user's task.
 * Dynamically rendered alerts are automatically announced by most screen
 * readers, and in some operating systems, they may trigger an alert sound.
 *
 * The approach here is to allow developers to render a visual <Alert> and then
 * we mirror that to a couple of aria-live regions behind the scenes. This way,
 * most of the time, developers don't have to think about visual vs. aria
 * alerts.
 *
 * Limitations: Developers can't read from context inside of an Alert because
 * we aren't using ReactDOM.createPortal(), we're actually creating a couple of
 * brand new React roots. We could use createPortal but then apps would need to
 * render the entire app tree in an <AlertProvider>, or maybe there's a way
 * with default context to do it, but we haven't explored that yet. So, we'll
 * see how this goes. If it becomes a problem we can introduce a portal later.
 *
 * @see Docs     https://reach.tech/alert
 * @see Source   https://github.com/reach/reach-ui/tree/main/packages/alert
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#alert
 */
import * as React from "react";
import * as ReactDOM from "react-dom";
import { VisuallyHidden } from "@reach/visually-hidden";
import { usePrevious } from "@reach/utils/use-previous";
import { getOwnerDocument } from "@reach/utils/owner-document";
import { useComposedRefs } from "@reach/utils/compose-refs";
import PropTypes from "prop-types";

import type * as Polymorphic from "@reach/utils/polymorphic";

/*
 * Singleton state is fine because you don't server render
 * an alert (SRs don't read them on first load anyway)
 */
let keys: RegionKeys = {
  polite: -1,
  assertive: -1,
};

let elements: ElementTypes = {
  polite: {},
  assertive: {},
};

let liveRegions: RegionElements = {
  polite: null,
  assertive: null,
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
 * @see Docs https://reach.tech/alert
 */
const Alert = React.forwardRef(function Alert(
  { as: Comp = "div", children, type: regionType = "polite", ...props },
  forwardedRef
) {
  const ownRef = React.useRef<HTMLDivElement>(null);
  const ref = useComposedRefs(forwardedRef, ownRef);
  const child = React.useMemo(
    () => (
      <Comp {...props} ref={ref} data-reach-alert>
        {children}
      </Comp>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [children, props]
  );
  useMirrorEffects(regionType, child, ownRef);

  return child;
}) as Polymorphic.ForwardRefComponent<"div", AlertProps>;

/**
 * @see Docs https://reach.tech/alert#alert-props
 */
interface AlertProps {
  /**
   * Controls whether the assistive technology should read immediately
   * ("assertive") or wait until the user is idle ("polite").
   *
   * @see Docs https://reach.tech/alert#alert-type
   */
  type?: "assertive" | "polite";
  children: React.ReactNode;
}

if (__DEV__) {
  Alert.displayName = "Alert";
  Alert.propTypes = {
    children: PropTypes.node,
    type: PropTypes.oneOf(["assertive", "polite"]),
  };
}

////////////////////////////////////////////////////////////////////////////////

function createMirror(type: "polite" | "assertive", doc: Document): Mirror {
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
    Object.keys(elements).forEach((elementType) => {
      let regionType: RegionTypes = elementType as RegionTypes;
      let container = liveRegions[regionType]!;
      if (container) {
        ReactDOM.render(
          <VisuallyHidden as="div">
            <div
              // The status role is a type of live region and a container whose
              // content is advisory information for the user that is not
              // important enough to justify an alert, and is often presented as
              // a status bar. When the role is added to an element, the browser
              // will send out an accessible status event to assistive
              // technology products which can then notify the user about it.
              // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_status_role
              role={regionType === "assertive" ? "alert" : "status"}
              aria-live={regionType}
            >
              {Object.keys(elements[regionType]).map((key) =>
                React.cloneElement(elements[regionType][key], {
                  key,
                  ref: null,
                })
              )}
            </div>
          </VisuallyHidden>,
          liveRegions[regionType]
        );
      }
    });
  }, 500);
}

function useMirrorEffects(
  regionType: RegionTypes,
  element: JSX.Element,
  ref: React.RefObject<Element>
) {
  const prevType = usePrevious<RegionTypes>(regionType);
  const mirror = React.useRef<Mirror | null>(null);
  const mounted = React.useRef(false);
  React.useEffect(() => {
    const ownerDocument = getOwnerDocument(ref.current)!;

    if (!mounted.current) {
      mounted.current = true;
      mirror.current = createMirror(regionType, ownerDocument);
      mirror.current.mount(element);
    } else if (prevType !== regionType) {
      mirror.current && mirror.current.unmount();
      mirror.current = createMirror(regionType, ownerDocument);
      mirror.current.mount(element);
    } else {
      mirror.current && mirror.current.update(element);
    }
  }, [element, regionType, prevType, ref]);

  React.useEffect(() => {
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
    [key: string]: JSX.Element;
  };
};

type RegionElements<T extends HTMLElement = HTMLDivElement> = {
  [key in RegionTypes]: T | null;
};

type RegionKeys = {
  [key in RegionTypes]: number;
};

////////////////////////////////////////////////////////////////////////////////
// Exports

export type { AlertProps };
export { Alert };
export default Alert;
