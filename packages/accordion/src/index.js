////////////////////////////////////////////////////////////////////////////////
// Welcome to @reach/accordion!

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
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

  if (__DEV__) {
    warning(
      !((isControlled && !wasControlled) || (!isControlled && wasControlled)),
      "Accordion is changing from controlled to uncontrolled. Accordion should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled Accordion for the lifetime of the component. Check the `index` prop being passed in."
    );
  }

  const onSelectPanel = useCallback(
    index => {
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
    },
    [activeIndex, isControlled, onChange, toggle]
  );

  const context = useMemo(
    () => ({
      accordionId: id,
      activeIndex,
      onSelectPanel: readOnly ? noop : onSelectPanel,
      readOnly
    }),
    [activeIndex, id, onSelectPanel, readOnly]
  );

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
    <DescendantProvider
      descendants={descendants}
      setDescendants={setDescendants}
    >
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
    defaultIndex: PropTypes.number,
    index: (props, name, compName, ...rest) => {
      if (props.index != null && props.onChange == null) {
        return new Error(
          "You provided an `index` prop to `Accordion` without an `onChange` handler. This will render a read-only accordion element. If the accordion should be functional, remove the `index` value to render an uncontrolled accordion or set an `onChange` handler to set an index when a change occurs."
        );
      }
      if (props.index != null && props.defaultIndex != null) {
        return new Error(
          "You provided an `index` prop as well as a `defaultIndex` prop to `Accordion`. If you want a controlled component, use the index prop with an onChange handler. If you want an uncontrolled component, remove the index prop and use `defaultIndex` instead."
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
  { children, disabled = false, index: indexProp, key, ...props },
  forwardedRef
) {
  const { accordionId, activeIndex, readOnly } = useAccordionContext();
  const triggerRef = useRef(null);
  const index = useDescendant(
    { disabled, element: triggerRef.current, key },
    indexProp
  );

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
    triggerRef,
    panelId
  };

  return (
    <AccordionItemContext.Provider value={context}>
      <div
        {...props}
        ref={forwardedRef}
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
  const { onSelectPanel, readOnly } = useAccordionContext();

  const {
    active,
    disabled,
    triggerId,
    triggerRef: ownRef,
    index,
    panelId
  } = useAccordionItemContext();

  let { focusNodes } = useDescendantContext();

  const ref = useForkedRef(forwardedRef, ownRef);

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
    const focusIndex = focusNodes.findIndex(el => el === ownRef.current);

    const firstItem = focusNodes[0];
    const lastItem = focusNodes[focusNodes.length - 1];
    const nextItem = focusNodes[focusIndex + 1];
    const prevItem = focusNodes[focusIndex - 1];

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
      data-active={active ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-reach-accordion-trigger=""
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
 * @typedef {{ element: HTMLElement; key?: string; disabled?: boolean }} Descendant
 */

/**
 * This hook registers our descendant by passing it into an array. We can then
 * search that array by to find its index when registering it in the component.
 * We use this for focus management, keyboard navigation, and typeahead
 * functionality for some components.
 *
 * The hook accepts the element node and (optionally) a key. The key is useful
 * if multiple descendants have identical text values and we need to
 * differentiate siblings for some reason.
 *
 * Our main goals with this are:
 *   1) maximum composability,
 *   2) minimal API friction
 *   3) SSR compatibility*
 *   4) concurrent safe
 *   5) index always up-to-date with the tree despite changes
 *   6) works with memoization of any component in the tree (hopefully)
 *
 * * As for SSR, the good news is that we don't actually need the index on the
 * server for most use-cases, as we are only using it to determine the order of
 * composed descendants for keyboard navigation. However, in the few cases where
 * this is not the case, we can require an explicit index from the app.
 *
 * @param {Descendant} descendant
 * @param {number} [indexProp]
 * @returns {number}
 */
function useDescendant({ element, key, disabled }, indexProp) {
  let [, forceUpdate] = useState();
  let {
    registerDescendant,
    unregisterDescendant,
    descendants
  } = useDescendantContext();

  // Prevent any flashing
  useIsomorphicLayoutEffect(() => {
    if (!element) forceUpdate({});
    registerDescendant({ element, key, disabled });
    return () => unregisterDescendant(element);
  }, [element, key, disabled]);

  return (
    indexProp ?? descendants.findIndex(({ element: _el }) => _el === element)
  );
}

/**
 * @returns {[Descendant[], React.Dispatch<React.SetStateAction<Descendant[]>>]}
 */
function useDescendants() {
  return useState([]);
}

function DescendantProvider({ children, descendants, setDescendants }) {
  /*
  type Descendant = { element: HTMLElement; key: string | number }
  */
  let registerDescendant = React.useCallback(
    ({ disabled, element, key: providedKey }) => {
      if (!element) {
        return;
      }

      setDescendants(items => {
        if (items.find(({ element: _el }) => _el === element) == null) {
          let key = providedKey ?? element.textContent;

          /*
           * When registering a descendant, we need to make sure we insert in
           * into the array in the same order that it appears in the DOM. So as
           * new descendants are added or maybe some are removed, we always know
           * that the array is up-to-date and correct.
           *
           * So here we look at our registered descendants and see if the new
           * element we are adding appears earlier than an existing descendant's
           * DOM node via `node.compareDocumentPosition`. If it does, we insert
           * the new element at this index. Because `registerDescendant` will be
           * called in an effect every time the descendants state value changes,
           * we should be sure that this index is accurate when descendent
           * elements come or go from our component.
           */
          let index = items.findIndex(({ element: existingElement }) => {
            if (!existingElement || !element) {
              return false;
            }
            /*
             * Does this element's DOM node appear before another item in the
             * array in our DOM tree? If so, return true to grab the index at
             * this point in the array so we know where to insert the new
             * element.
             */
            return Boolean(
              existingElement.compareDocumentPosition(element) &
                Node.DOCUMENT_POSITION_PRECEDING
            );
          });

          let newItem = { disabled, element, key };

          // If an index is not found we will push the element to the end.
          if (index === -1) {
            return [...items, newItem];
          }
          return [...items.slice(0, index), newItem, ...items.slice(index)];
        }
      });
    },
    /*
     * setDescendants is a state setter initialized by the useDescendants hook.
     * We can safely ignore the lint warning here because it will not change
     * between renders.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  let unregisterDescendant = useCallback(
    element => {
      if (!element) {
        return;
      }

      setDescendants(items =>
        items.filter(({ element: _el }) => element !== _el)
      );
    },
    /*
     * setDescendants is a state setter initialized by the useDescendants hook.
     * We can safely ignore the lint warning here because it will not change
     * between renders.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  let focusNodes = descendants
    .filter(({ disabled }) => !disabled)
    .map(({ element }) => element);

  const value = useMemo(() => {
    return {
      descendants,
      focusNodes,
      registerDescendant,
      unregisterDescendant
    };
  }, [descendants, focusNodes, registerDescendant, unregisterDescendant]);

  return (
    <DescendantContext.Provider value={value}>
      {children}
    </DescendantContext.Provider>
  );
}

/*
 * React currently throws a warning when using useLayoutEffect on the server.
 * To get around it, we can conditionally useEffect on the server (no-op) and
 * useLayoutEffect in the browser. We occasionally need useLayoutEffect to ensure
 * we don't get a render flash for certain operations, but we may also need
 * affected components to render on the server. One example is when setting a
 * component's descendants to retrieve their index values. The index value may be
 * needed to determine whether a descendant is active, but with useEffect in the
 * browser there will be an initial frame where the active descendant is not set.
 *
 * Important to note that using this hook as an escape hatch will break the
 * eslint dependency warnings, so use sparingly only when needed and pay close
 * attention to the dependency array!
 *
 * TODO: Move to `utils`
 *
 * https://github.com/reduxjs/react-redux/blob/master/src/utils/useIsomorphicLayoutEffect.js
 */
const useIsomorphicLayoutEffect = canUseDOM() ? useLayoutEffect : useEffect;

function canUseDOM() {
  return (
    typeof window !== "undefined" &&
    typeof window.document !== "undefined" &&
    typeof window.document.createElement !== "undefined"
  );
}
