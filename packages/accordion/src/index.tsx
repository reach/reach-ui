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
  forwardRefWithAs,
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

const AccordionContext = createContext<IAccordionContext>(
  {} as IAccordionContext
);
const AccordionItemContext = createContext<IAccordionItemContext>(
  {} as IAccordionItemContext
);
const useAccordionContext = () => useContext(AccordionContext);
const useAccordionItemContext = () => useContext(AccordionItemContext);

////////////////////////////////////////////////////////////////////////////////

/**
 * Accordion
 *
 * The wrapper component for the other components.
 *
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-1
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
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

    const id = useId(props.id) || "accordion";

    const [activeIndex, setActiveIndex] = useState<AccordionIndex>(
      isControlled
        ? (controlledIndex as AccordionIndex)
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
      (index: AccordionIndex) => {
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

    const context: IAccordionContext = useMemo(
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
      setActiveIndex(controlledIndex as AccordionIndex);
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
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-props
 */
export type AccordionProps = Omit<
  React.HTMLProps<HTMLDivElement>,
  "onChange"
> & {
  /**
   * Requires AccordionItem components as direct children.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-children
   */
  children: React.ReactNode;
  /**
   * A default value for the active index in an uncontrolled component.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-defaultindex
   */
  defaultIndex?: AccordionIndex;
  /**
   * The index or array of indices for active accordion items. Used along with
   * `onChange` to create controlled accordion components.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-index
   */
  index?: AccordionIndex;
  /**
   * Callback that is fired when an accordion item's open state is changed.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-onchange
   */
  onChange?(index?: AccordionIndex): void;
  /**
   * Whether or not an uncontrolled accordion is read-only or controllable by a
   * user interaction.
   *
   * Generally speaking you probably want to avoid this, as
   * is can be confusing especially when navigating by keyboard. However, this
   * may be useful if you want to lock an accordion under certain conditions
   * (perhaps user authentication is required to access the content). In these
   * instances, you may want to include an alert when a user tries to activate
   * a read-only accordion panel to let them know why it does not toggle.
   *
   * TODO: Create example with @reach/alert.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-onchange
   */
  readOnly?: boolean;
  /**
   * Whether or not all panels of an uncontrolled accordion can be toggled
   * to a closed state. By default, an uncontrolled accordion will have an open
   * panel at all times, meaning a panel can only be closed if the user opens
   * another panel. This prop allows the user to close an open panel by clicking
   * its trigger while it is open.
   */
  toggle?: boolean;
};

Accordion.displayName = "Accordion";
if (__DEV__) {
  Accordion.propTypes = {
    children: PropTypes.node.isRequired,
    defaultIndex: PropTypes.number,
    index: (props, name, compName, location, propName) => {
      let val = props[name];
      if (props[name] != null && props.onChange == null) {
        return new Error(
          "You provided an `index` prop to `Accordion` without an `onChange` handler. This will render a read-only accordion element. If the accordion should be functional, remove the `index` value to render an uncontrolled accordion or set an `onChange` handler to set an index when a change occurs."
        );
      }
      if (props[name] != null && props.defaultIndex != null) {
        return new Error(
          "You provided an `index` prop as well as a `defaultIndex` prop to `Accordion`. If you want a controlled component, use the index prop with an onChange handler. If you want an uncontrolled component, remove the index prop and use `defaultIndex` instead."
        );
      }
      if (Array.isArray(props[name])) {
        return props[name].every((i: any) => typeof i === "number")
          ? null
          : new Error(
              "You provided an array as an index in `Accordion` but one or more of the values are not numeric. Please check to make sure all indices are valid numbers."
            );
      } else if (props[name] != null && typeof props[name] !== "number") {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${compName}\`. Expected \`number\`, received \`${
            Array.isArray(val) ? "array" : typeof val
          }\`.`
        );
      }
      return null;
    },
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
    toggle: PropTypes.bool
  };
}

/**
 * AccordionItem
 *
 * Wraps a DOM `button` an accordion's trigger and panel components.
 *
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordionitem
 */
export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem(
    { children, disabled = false, index: indexProp, key, ...props },
    forwardedRef
  ) {
    const { accordionId, activeIndex, readOnly } = useAccordionContext();
    const triggerRef: TriggerRef = useRef(null);
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

    const context: IAccordionItemContext = {
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
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordionitem-props
 */
export type AccordionItemProps = React.HTMLProps<HTMLDivElement> & {
  /**
   * Requires AccordionTrigger and AccordionPanel components as direct children.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordionitem-children
   */
  children: React.ReactNode;
  /**
   * Whether or not an accordion panel is disabled from user interaction.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordionitem-disabled
   */
  disabled?: boolean;
  index?: number;
};

AccordionItem.displayName = "AccordionItem";
if (__DEV__) {
  AccordionItem.propTypes = {
    disabled: PropTypes.bool
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * AccordionTrigger
 *
 * The trigger button a user clicks to interact with an accordion.
 *
 * Must be a direct child of a `AccordionItem`.
 *
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordiontrigger
 */
export const AccordionTrigger = forwardRefWithAs<
  "button",
  AccordionTriggerProps
>(function AccordionTrigger(
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

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    if (disabled) {
      return;
    }
    ownRef.current.focus();
    onSelectPanel(index);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
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

/**
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordiontrigger-props
 */
export type AccordionTriggerProps = {
  /**
   * Typically a text string that serves as a label for the accordion, though
   * nested DOM nodes can be passed as well so long as they are valid children
   * of interactive elements.
   *
   * @see https://github.com/w3c/html-aria/issues/54
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordiontrigger-children
   */
  children: React.ReactNode;
};

AccordionTrigger.displayName = "AccordionTrigger";
if (__DEV__) {
  AccordionTrigger.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * AccordionPanel
 *
 * The panel in which inner content for an accordion item is rendered.
 *
 * Must be a direct child of a `AccordionItem`.
 *
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordionpanel
 */
export const AccordionPanel = forwardRef<HTMLDivElement, AccordionPanelProps>(
  function AccordionPanel({ children, ...props }, forwardedRef) {
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
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordionpanel-props
 */
export type AccordionPanelProps = {
  /**
   * Inner content for the accordion item.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordionpanel-children
   */
  children: React.ReactNode;
};

AccordionPanel.displayName = "AccordionPanel";
if (__DEV__) {
  AccordionPanel.propTypes = {
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////
// Types

type TriggerRef = React.MutableRefObject<any>;

type AccordionIndex = number | number[];

interface IAccordionContext {
  accordionId: string;
  activeIndex: AccordionIndex;
  onSelectPanel(index: AccordionIndex): void;
  readOnly: boolean;
}

interface IAccordionItemContext {
  active: boolean;
  disabled: boolean;
  triggerId: string;
  index: number;
  itemId: string;
  triggerRef: TriggerRef;
  panelId: string;
}

////////////////////////////////////////////////////////////////////////////////

type DescendantElement<T = HTMLElement> = T extends HTMLElement
  ? T
  : HTMLElement;

type Descendant<T> = {
  element: DescendantElement<T>;
  key?: string | number | null;
  disabled?: boolean;
};

interface IDescendantContext<T> {
  descendants: Descendant<T>[];
  focusNodes: DescendantElement<T>[];
  registerDescendant(descendant: Descendant<T>): void;
  unregisterDescendant(element: Descendant<T>["element"]): void;
}

const DescendantContext = createContext<IDescendantContext<any>>(
  {} as IDescendantContext<any>
);

function useDescendantContext<T>() {
  return useContext(DescendantContext as React.Context<IDescendantContext<T>>);
}

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
 */
function useDescendant<T>(
  { element, key, disabled }: Descendant<T>,
  indexProp?: number
) {
  let [, forceUpdate] = useState();
  let {
    registerDescendant,
    unregisterDescendant,
    descendants
  } = useDescendantContext<T>();

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

function useDescendants<T>() {
  return useState<Descendant<T>[]>([]);
}

function DescendantProvider<T>({
  children,
  descendants,
  setDescendants
}: {
  children: React.ReactNode;
  descendants: Descendant<T>[];
  setDescendants: React.Dispatch<React.SetStateAction<Descendant<T>[]>>;
}) {
  let registerDescendant = React.useCallback(
    ({ disabled, element, key: providedKey }: Descendant<T>) => {
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
        return items;
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
    (element: Descendant<T>["element"]) => {
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

  const value: IDescendantContext<T> = useMemo(() => {
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
