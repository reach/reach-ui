////////////////////////////////////////////////////////////////////////////////
// Welcome to @reach/accordion!

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import {
  assignRef,
  checkStyles,
  makeId,
  noop,
  wrapEvent,
  useForkedRef
} from "@reach/utils";
import { useId } from "@reach/auto-id";
import PropTypes from "prop-types";
import warning from "warning";

// A11y reference:
//   - https://www.w3.org/TR/wai-aria-practices/examples/accordion/accordion.html
//   - https://inclusive-components.design/collapsible-sections/

// TODO: Screen reader testing
// TODO: Animation examples

const AccordionContext = createContext({});
const AccordionItemContext = createContext({});
const DescendantContext = createContext();
const useAccordionContext = () => useContext(AccordionContext);
const useAccordionItemContext = () => useContext(AccordionItemContext);
const useDescendantContext = () => useContext(DescendantContext);

////////////////////////////////////////////////////////////////////////////////
// Accordion

export const Accordion = forwardRef(function Accordion(
  {
    children,
    defaultIndex,
    index: controlledIndex,
    onChange,
    readOnly = false,
    toggle = false,
    ...props
  },
  forwardedRef
) {
  /*
   * You shouldn't switch between controlled/uncontrolled. We'll check for a
   * controlled component and track any changes in a ref to show a warning.
   */
  const wasControlled = typeof controlledIndex !== "undefined";
  const { current: isControlled } = useRef(wasControlled);

  const [descendants, setDescendants] = useDescendants();

  const id = useId(props.id);

  const [activeIndex, setActiveIndex] = useState(
    isControlled
      ? controlledIndex
      : defaultIndex != null
      ? defaultIndex
      : toggle
      ? -1
      : 0
  );

  /*
   * We will store all AccordionTrigger refs inside this array to manage focus.
   */
  const focusableTriggerNodes = useRef([]);

  if (__DEV__) {
    warning(
      !((isControlled && !wasControlled) || (!isControlled && wasControlled)),
      "Accordion is changing from controlled to uncontrolled. Accordion should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled Accordion for the lifetime of the component. Check the `index` prop being passed in."
    );
  }

  function onSelectPanel(index) {
    onChange && onChange(index);
    /*
     * Before updating the active item internally, check that:
     *   - Component is uncontrolled
     *   - If toggle is not allowed, check that the change isn't coming from an
     *     item that is already active.
     */
    if (!isControlled && !(activeIndex === index && !toggle)) {
      setActiveIndex(activeIndex === index && toggle ? -1 : index);
    }
  }

  const context = {
    accordionId: id,
    activeIndex,
    focusableTriggerNodes,
    onSelectPanel: readOnly ? noop : onSelectPanel,
    readOnly
  };

  if (
    isControlled &&
    /*
     * A controlled index may be a number or an array of numbers.
     * Quickly compare array or numeric indices without type checking
     */
    JSON.stringify(activeIndex) !== JSON.stringify(controlledIndex)
  ) {
    /*
     * If the component is controlled, we'll sync internal state with the
     * controlled state
     */
    setActiveIndex(controlledIndex);
  }

  useEffect(() => checkStyles("accordion"), []);

  return (
    <DescendantProvider descendants={descendants} set={setDescendants}>
      <AccordionContext.Provider value={context}>
        <div data-reach-accordion="" ref={forwardedRef} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    </DescendantProvider>
  );
});

Accordion.displayName = "Accordion";
if (__DEV__) {
  Accordion.propTypes = {
    children: PropTypes.node.isRequired,
    index: (props, name, compName, ...rest) => {
      if (props.index != null && props.onChange == null) {
        return new Error(
          "You provided an `index` prop to `Accordion` without an `onChange` handler. This will render a read-only accordion element. If the accordion should be functional, remove the `index` value to render an uncontrolled accordion or set an `onChange` handler to set an index when a change occurs."
        );
      }
      if (Array.isArray(props.index)) {
        return props.index.every(i => typeof i === "number")
          ? null
          : new Error(
              "You provided an array as an index in `Accordion` but one or more of the values are not numeric. Please check to make sure all indices are valid numbers."
            );
      }
      return PropTypes.number(name, props, compName, ...rest);
    },
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
    toggle: PropTypes.bool
  };
}

////////////////////////////////////////////////////////////////////////////////
// AccordionItem

export const AccordionItem = forwardRef(function AccordionItem(
  { children, disabled = false, index: indexProp, ...props },
  forwardedRef
) {
  const { accordionId, activeIndex, readOnly } = useAccordionContext();

  const ownRef = useRef(null);
  const [index, setRef] = useDescendant(ownRef, indexProp, disabled);
  const ref = useForkedRef(setRef, forwardedRef);

  // We need unique IDs for the panel and trigger to point to one another
  const itemId = makeId(accordionId, index);
  const panelId = makeId("panel", itemId);
  const triggerId = makeId("trigger", itemId);

  const active = Array.isArray(activeIndex)
    ? activeIndex.includes(index)
    : activeIndex === index;

  const context = {
    active,
    disabled,
    triggerId,
    index,
    itemId,
    panelId
  };

  return (
    <AccordionItemContext.Provider value={context}>
      <div
        {...props}
        ref={ref}
        data-reach-accordion-item=""
        data-active={active ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        data-read-only={readOnly ? "" : undefined}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
});

AccordionItem.displayName = "AccordionItem";
if (__DEV__) {
  AccordionItem.propTypes = {
    disabled: PropTypes.bool
  };
}

////////////////////////////////////////////////////////////////////////////////
// AccordionTrigger

export const AccordionTrigger = forwardRef(function AccordionTrigger(
  {
    as: Comp = "button",
    children,
    onClick,
    onKeyDown,
    onMouseDown,
    onPointerDown,
    tabIndex,
    ...props
  },
  forwardedRef
) {
  const {
    focusableTriggerNodes,
    onSelectPanel,
    readOnly
  } = useAccordionContext();

  const {
    active,
    disabled,
    triggerId,
    index,
    panelId
  } = useAccordionItemContext();

  const ownRef = useRef(null);

  /*
   * We only need an array of refs for our triggers for keyboard navigation, and
   * we already know the index because we can constrain Accordion children to
   * only AccordionItems. So we shouldn't need to do any funky render dancing
   * here, just update the ref in the same order if the index changes.
   */
  const setFocusableTriggerRefs = useCallback(
    node => {
      if (node && !disabled) {
        focusableTriggerNodes.current[index] = node;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, index]
  );

  const ref = useForkedRef(forwardedRef, ownRef, setFocusableTriggerRefs);

  function handleClick(event) {
    event.preventDefault();
    if (disabled) {
      return;
    }
    ownRef.current.focus();
    onSelectPanel(index);
  }

  function handleKeyDown(event) {
    const { key, ctrlKey } = event;
    const { current: focusNodes } = focusableTriggerNodes;
    const firstItem = focusNodes[0];
    const lastItem = focusNodes[focusNodes.length - 1];
    const nextItem = focusNodes[index + 1];
    const prevItem = focusNodes[index - 1];

    // Bail if we aren't moving focus
    if (
      !(
        key === "ArrowDown" ||
        key === "ArrowUp" ||
        (ctrlKey && key === "PageDown") ||
        (ctrlKey && key === "PageUp") ||
        key === "Home" ||
        key === "End"
      )
    ) {
      return;
    }

    event.preventDefault();

    if (key === "ArrowDown" || (ctrlKey && key === "PageDown")) {
      nextItem ? nextItem.focus() : firstItem && firstItem.focus();
    } else if (key === "ArrowUp" || (ctrlKey && key === "PageUp")) {
      prevItem ? prevItem.focus() : lastItem && lastItem.focus();
    } else if (key === "Home") {
      firstItem && firstItem.focus();
    } else if (key === "End") {
      lastItem && lastItem.focus();
    }
  }

  return (
    <Comp
      {...props}
      ref={ref}
      aria-controls={panelId}
      aria-expanded={active}
      data-reach-accordion-trigger=""
      data-active={active ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-read-only={readOnly ? "" : undefined}
      disabled={disabled || undefined}
      id={triggerId}
      onClick={wrapEvent(onClick, handleClick)}
      onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
      tabIndex={disabled ? -1 : tabIndex}
    >
      {children}
    </Comp>
  );
});

AccordionTrigger.displayName = "AccordionTrigger";
if (__DEV__) {
  AccordionTrigger.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////
// AccordionHeader

/* export const AccordionHeader = forwardRef(function AccordionHeader(
  { children, ...props },
  forwardedRef
) {
  return (
    <div {...props} ref={forwardedRef}></div>
  )
}) */

////////////////////////////////////////////////////////////////////////////////
// AccordionPanel

export const AccordionPanel = forwardRef(function AccordionPanel(
  { children, ...props },
  forwardedRef
) {
  const { readOnly } = useAccordionContext();

  const { disabled, panelId, triggerId, active } = useAccordionItemContext();

  return (
    <div
      {...props}
      ref={forwardedRef}
      aria-labelledby={triggerId}
      data-active={active ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-reach-accordion-panel=""
      data-read-only={readOnly ? "" : undefined}
      hidden={!active}
      id={panelId}
      role="region"
      tabIndex={-1}
    >
      {children}
    </div>
  );
});

AccordionPanel.displayName = "AccordionPanel";
if (__DEV__) {
  AccordionPanel.propTypes = {
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * This hook registers our descendant by passing it into an array. We can then
 * search that array by a unique key to find its index. We use this for focus
 * management and keyboard navigation. We would like to skip any updates if an
 * explicit index OR a bypass arg is provided (such is the case for disabled
 * button elements, etc.), as we can't call hooks conditionally.
 *
 * The key can be
 *   1) an explicit index prop passed by the app which bypasses most of our work
 *      here,
 *   2) a value string passed by the app, or
 *   3) we look at the DOM node's inner text and use it as the key
 *
 * Our main goals with this are:
 *   1) maximum composability,
 *   2) minimal API friction
 *   3) SSR compatibility
 *   4) concurrent safe
 *   5) index always up-to-date with the tree despite changes
 *   6) works with memoization of any component in the tree (hopefully)
 *
 * As for SSR, the good news is that we don't actually need the index on the
 * server for most use-cases, as we are only using it to determine the order of
 * composed descendants for keyboard navigation. However, in the few cases where
 * this is not the case, we can either
 *   1) require an explicit key, or
 *   2) require a controlled component where the parent always knows the state
 *      of its descendants
 *
 * This still feels like it could be a lot clearer TBH, but it works for now
 * and we can reassess if we find issues and fix as needed.
 *
 * An alternative would be to bail on React altogether an just use DOM APIs in
 * the parent and find the child nodes on every render. Again, if we need
 * something from the server we just require an explicit index or controlled
 * component. TBH that might still be better (or at much less convoluted and
 * easier for folks to see what's going on).
 */
function useDescendant(ref, indexOrKey, bypass) {
  /*
   * If the first argument is a number we'll treat it as an index. If it is a
   * string, we treat it as a value/key.
   */
  let indexProp = typeof indexOrKey === "number" ? indexOrKey : null;
  let [index, setIndex] = useState(indexProp ?? -1);

  // If a falsey value is provided as the second arg, this returns null.
  let [domText, setRef] = useDomTextContent(ref, indexOrKey != null || bypass);
  let key = indexOrKey ?? domText;

  let {
    descendants,
    registerDescendant,
    deregisterDescendant
  } = useDescendantContext();

  // First effect registers our descendant
  useEffect(() => {
    // Descendants require a unique key. Skip updates if none exists.
    if (key == null) {
      return;
    }

    registerDescendant(key, ref);
    return () => void deregisterDescendant(key);
  }, [ref, registerDescendant, deregisterDescendant, key]);

  // Second effect finds our index and updates accordingly any time descendants
  // are updated
  useEffect(() => {
    if (key == null) {
      return;
    }

    if (indexProp == null) {
      let newIndex = descendants.findIndex(i => i.key === key);
      if (newIndex !== index) {
        setIndex(newIndex);
      }
    }
  }, [descendants, key, index, indexProp]);

  if (indexProp != null && indexProp !== index) {
    setIndex(indexProp);
  }

  return [index, setRef];
}

function useDescendants() {
  return useState([]);
}

function DescendantProvider({ children, descendants, set }) {
  let registerDescendant = useCallback(
    (key, ref) => {
      set(items => {
        let newItem = { key, ref };

        /*
         * When registering a descendant, we need to make sure we insert in into
         * the array in the same order that it appears in the DOM. So as new
         * descendants are added or maybe some are removed, we always know that
         * the array is up-to-date and correct.
         *
         * So here we look at our registered descendants and see if the new
         * element we are adding appears earlier than an existing descendant's DOM
         * node via `node.compareDocumentPosition`. If it does, we insert the new
         * element at this index. Because `registerDescendant` will be called in
         * an effect every time the descendants state value changes, we should be
         * sure that this index is accurate when descendent elements come or go
         * from our component.
         */
        let index = items.findIndex(el => {
          if (!el.ref.current || !ref.current) {
            return false;
          }
          /*
           * Does this element's DOM node appear before another item in the array
           * in our DOM tree? If so, return true to grab the index at this point
           * in the array so we know where to insert the new element.
           */
          return Boolean(
            el.ref.current.compareDocumentPosition(ref.current) &
              Node.DOCUMENT_POSITION_PRECEDING
          );
        });

        // If an index is not found we will push the element to the end.
        if (index === -1) {
          return [...items, newItem];
        }
        return [...items.slice(0, index), newItem, ...items.slice(index)];
      });
    },
    [set]
  );

  let deregisterDescendant = useCallback(
    key => {
      set(items => items.filter(el => el.key !== key));
    },
    [set]
  );

  return (
    <DescendantContext.Provider
      value={{
        descendants,
        registerDescendant,
        deregisterDescendant
      }}
    >
      {children}
    </DescendantContext.Provider>
  );
}

/**
 * This hook gives us a DOM node's inner text content. Because we cannot call
 * hooks conditionally, we accept a bypass argument in the event that an
 * explicit value is passed and we don't need the DOM text.
 */
function useDomTextContent(ref, bypass) {
  let [domText, setDomText] = useState(null);
  let setRef = useCallback(
    node => {
      if (node) {
        assignRef(ref, node);
        if (!bypass && node.textContent && domText !== node.textContent) {
          setDomText(node.textContent);
        }
      }
    },
    [bypass, domText, ref]
  );
  return [domText, setRef];
}
