/**
 * Welcome to @reach/accordion!
 *
 * TODO: Animation examples
 *
 * @see Docs     https://reacttraining.com/reach-ui/accordion
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/accordion
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#accordion
 */

import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  boolOrBoolString,
  checkStyles,
  createNamedContext,
  createDescendantContext,
  DescendantProvider,
  forwardRefWithAs,
  makeId,
  noop,
  useDescendant,
  useDescendants,
  useForkedRef,
  wrapEvent
} from "@reach/utils";
import { useId } from "@reach/auto-id";
import PropTypes from "prop-types";
import warning from "warning";

const AccordionDescendantContext = createDescendantContext(
  "AccordionDescendantContext"
);
const AccordionContext = createNamedContext<IAccordionContext>(
  "AccordionContext",
  {} as IAccordionContext
);
const AccordionItemContext = createNamedContext<IAccordionItemContext>(
  "AccordionItemContext",
  {} as IAccordionItemContext
);
const useAccordionContext = () => useContext(AccordionContext);
const useAccordionItemContext = () => useContext(AccordionItemContext);

////////////////////////////////////////////////////////////////////////////////

export enum AccordionStates {
  Open = "open",
  Collapsed = "collapsed"
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Accordion
 *
 * The wrapper component for all other accordion components. Each accordion
 * component will consist of accordion items whose buttons are keyboard
 * navigable using arrow keys.
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
      collapsible = false,
      multiple = false,
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

    // Define our default starting index
    const [openPanels, setOpenPanels] = useState<AccordionIndex>(() => {
      switch (true) {
        case isControlled:
          return controlledIndex!;

        // If we have a defaultIndex, we need to do a few checks
        case defaultIndex != null:
          /*
           * If multiple is set to true, we need to make sure the `defaultIndex`
           * is an array (and vice versa). We'll handle console warnings in
           * our propTypes, but this will at least keep the component from
           * blowing up.
           */
          if (multiple) {
            return Array.isArray(defaultIndex) ? defaultIndex : [defaultIndex!];
          } else {
            return Array.isArray(defaultIndex)
              ? defaultIndex[0] ?? 0
              : defaultIndex!;
          }

        /*
         * Collapsible accordions with no defaultIndex will start with all
         * panels collapsed. Otherwise the first panel will be our default.
         */
        case collapsible:
          return multiple ? [-1] : -1;
        default:
          return multiple ? [0] : 0;
      }
    });

    if (__DEV__) {
      warning(
        !(!isControlled && wasControlled),
        "Accordion is changing from controlled to uncontrolled. Accordion should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled Accordion for the lifetime of the component. Check the `index` prop being passed in."
      );
      warning(
        !(isControlled && !wasControlled),
        "Accordion is changing from uncontrolled to controlled. Accordion should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled Accordion for the lifetime of the component. Check the `index` prop being passed in."
      );
      warning(
        !(isControlled && collapsible),
        "The `collapsible` prop on Accordion has no effect when the state of the component is controlled."
      );
      warning(
        !(isControlled && multiple),
        "The `multiple` prop on Accordion has no effect when the state of the component is controlled."
      );
    }

    const onSelectPanel = useCallback(
      (index: AccordionIndex) => {
        onChange && onChange(index);

        if (!isControlled) {
          setOpenPanels(prevOpenPanels => {
            /*
             * If we're dealing with an uncontrolled component, the index arg
             * in selectChange will always be a number rather than an array.
             */
            index = index as number;
            // multiple allowed
            if (multiple) {
              // state will always be an array here
              prevOpenPanels = prevOpenPanels as number[];
              if (
                // User is clicking on an already-open button
                prevOpenPanels.includes(index as number)
              ) {
                // Other panels are open OR accordion is allowed to collapse
                if (prevOpenPanels.length > 1 || collapsible) {
                  // Close the panel by filtering it from the array
                  return prevOpenPanels.filter(i => i !== index);
                }
              } else {
                // Open the panel by adding it to the array.
                return [...prevOpenPanels, index].sort();
              }
            } else {
              prevOpenPanels = prevOpenPanels as number;
              return prevOpenPanels === index && collapsible ? -1 : index;
            }
            return prevOpenPanels;
          });
        }
      },
      [collapsible, isControlled, multiple, onChange]
    );

    const context: IAccordionContext = useMemo(
      () => ({
        accordionId: id,
        openPanels: isControlled ? controlledIndex! : openPanels,
        onSelectPanel: readOnly ? noop : onSelectPanel,
        readOnly
      }),
      [openPanels, controlledIndex, id, isControlled, onSelectPanel, readOnly]
    );

    useEffect(() => checkStyles("accordion"), []);

    return (
      <DescendantProvider
        context={AccordionDescendantContext}
        items={descendants}
        set={setDescendants}
      >
        <AccordionContext.Provider value={context}>
          <div {...props} ref={forwardedRef} data-reach-accordion="">
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
   * `Accordion` can accept `AccordionItem` components as children.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-children
   */
  children: React.ReactNode;
  /**
   * Whether or not all panels of an uncontrolled accordion can be toggled
   * to a closed state. By default, an uncontrolled accordion will have an open
   * panel at all times, meaning a panel can only be closed if the user opens
   * another panel. This prop allows the user to collapse all open panels.
   *
   * It's important to note that this prop has no impact on controlled
   * components, since the state of any given accordion panel is managed solely
   * by the index prop.
   */
  collapsible?: boolean;
  /**
   * A default value for the open panel's index or indices in an uncontrolled
   * accordion component when it is initially rendered.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-defaultindex
   */
  defaultIndex?: AccordionIndex;
  /**
   * The index or array of indices for open accordion panels. The `index` props
   * should be used along with `onChange` to create controlled accordion
   * components.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-index
   */
  index?: AccordionIndex;
  /**
   * The callback that is fired when an accordion item's open state is changed.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-onchange
   */
  onChange?(index?: AccordionIndex): void;
  /**
   * Whether or not an uncontrolled accordion is read-only or controllable by a
   * user interaction.
   *
   * Generally speaking you probably want to avoid this, as
   * it can be confusing especially when navigating by keyboard. However, this
   * may be useful if you want to lock an accordion under certain conditions
   * (perhaps user authentication is required to access the content). In these
   * instances, you may want to include an alert when a user tries to activate
   * a read-only accordion panel to let them know why it does not toggle as may
   * be expected.
   *
   * TODO: Create example with @reach/alert.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-onchange
   */
  readOnly?: boolean;
  /**
   * Whether or not multiple panels in an uncontrolled accordion can be opened
   * at the same time. By default, when a user opens a new panel, the previously
   * opened panel will close. This prop prevents that behavior.
   *
   * It's important to note that this prop has no impact on controlled
   * components, since the state of any given accordion panel is managed solely
   * by the index prop.
   */
  multiple?: boolean;
};

if (__DEV__) {
  Accordion.displayName = "Accordion";
  Accordion.propTypes = {
    children: PropTypes.node.isRequired,
    defaultIndex: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number)
    ]) as any,
    index: (props, name, compName, location, propName) => {
      let val = props[name];
      if (props[name] != null && props.onChange == null && !props.readOnly) {
        return new Error(
          "You provided an `index` prop to `Accordion` without an `onChange` handler. This will render a read-only accordion element. If the accordion should be functional, remove the `index` value to render an uncontrolled accordion or set an `onChange` handler to set an index when a change occurs. If the accordion is intended to have a fixed state, use the `readOnly` prop with a `defaultIndex` instead of an `index`."
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
          `Invalid prop "${propName}" supplied to "${compName}". Expected "number", received "${
            Array.isArray(val) ? "array" : typeof val
          }".`
        );
      }
      return null;
    },
    multiple: (props, name, compName, location, propName) => {
      if (!props[name] && Array.isArray(props.defaultIndex)) {
        return new Error(
          `The "${propName}" prop supplied to "${compName}" is not set or set to "false", but an array of indices was provided to the "defaultIndex" prop. "${compName}" can only have more than one default index if the "${propName}" prop is set to "true".`
        );
      } else if (props[name] != null && typeof props[name] !== "boolean") {
        return new Error(
          `Invalid prop "${propName}" supplied to "${compName}". Expected "boolean", received "${
            Array.isArray(props[name]) ? "array" : typeof props[name]
          }".`
        );
      }
      return null;
    },
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
    collapsible: PropTypes.bool
  };
}

/**
 * AccordionItem
 *
 * A group that wraps a an accordion's button and panel components.
 *
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordionitem
 */
export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem(
    { children, disabled = false, ...props },
    forwardedRef
  ) {
    const { accordionId, openPanels, readOnly } = useAccordionContext();
    const buttonRef: ButtonRef = useRef(null);
    const index = useDescendant({
      context: AccordionDescendantContext,
      element: buttonRef.current
    });

    // We need unique IDs for the panel and button to point to one another
    const itemId = makeId(accordionId, index);
    const panelId = makeId("panel", itemId);
    const buttonId = makeId("button", itemId);

    const open = Array.isArray(openPanels)
      ? openPanels.includes(index)
      : openPanels === index;

    const dataAttributes = {
      "data-state": open ? AccordionStates.Open : AccordionStates.Collapsed,
      "data-disabled": disabled ? "true" : undefined,
      "data-read-only": readOnly ? "true" : undefined
    };

    const context: IAccordionItemContext = {
      open,
      disabled,
      buttonId,
      index,
      itemId,
      buttonRef,
      panelId,
      dataAttributes
    };

    return (
      <AccordionItemContext.Provider value={context}>
        <div
          {...props}
          ref={forwardedRef}
          data-reach-accordion-item=""
          {...dataAttributes}
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
   * An `AccordionItem` expects to receive an `AccordionButton` and
   * `AccordionPanel` components as its children, though you can also nest other
   * components within an `AccordionItem` if you want some persistant content
   * that is relevant to the section but not collapsible when the
   * `AccordionButton` is toggled.
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
};

if (__DEV__) {
  AccordionItem.displayName = "AccordionItem";
  AccordionItem.propTypes = {
    disabled: PropTypes.bool
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * AccordionButton
 *
 * The trigger button a user clicks to interact with an accordion.
 *
 * Must be a direct child of a `AccordionItem`.
 *
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordionbutton
 */
export const AccordionButton = forwardRefWithAs<AccordionButtonProps, "button">(
  function AccordionButton(
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
    const { onSelectPanel } = useAccordionContext();

    const {
      open,
      dataAttributes,
      disabled,
      buttonId,
      buttonRef: ownRef,
      index,
      panelId
    } = useAccordionItemContext();

    let { descendants } = useContext(AccordionDescendantContext);
    let focusableButtons = useMemo(() => {
      let nodes: HTMLElement[] = [];
      for (let i = 0; i < descendants.length; i++) {
        let element = descendants[i].element;
        if (element && !boolOrBoolString(element.dataset.disabled)) {
          nodes.push(element);
        }
      }
      return nodes;
    }, [descendants]);

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
      const focusIndex = focusableButtons.findIndex(
        el => el === ownRef.current
      );

      const firstItem = focusableButtons[0];
      const lastItem = focusableButtons[focusableButtons.length - 1];
      const nextItem = focusableButtons[focusIndex + 1];
      const prevItem = focusableButtons[focusIndex - 1];

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
        data-reach-accordion-button=""
        {...dataAttributes}
        aria-controls={panelId}
        aria-expanded={open}
        disabled={disabled || undefined}
        id={buttonId}
        onClick={wrapEvent(onClick, handleClick)}
        onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
        tabIndex={disabled ? -1 : tabIndex}
      >
        {children}
      </Comp>
    );
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordionbutton-props
 */
export type AccordionButtonProps = {
  /**
   * Typically a text string that serves as a label for the accordion, though
   * nested DOM nodes can be passed as well so long as they are valid children
   * of interactive elements.
   *
   * @see https://github.com/w3c/html-aria/issues/54
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordionbutton-children
   */
  children: React.ReactNode;
};

if (__DEV__) {
  AccordionButton.displayName = "AccordionButton";
  AccordionButton.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * AccordionPanel
 *
 * The collapsible panel in which inner content for an accordion item is
 * rendered.
 *
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordionpanel
 */
export const AccordionPanel = forwardRef<HTMLDivElement, AccordionPanelProps>(
  function AccordionPanel({ children, ...props }, forwardedRef) {
    const {
      dataAttributes,
      panelId,
      buttonId,
      open
    } = useAccordionItemContext();

    return (
      <div
        hidden={!open}
        role="region"
        {...props}
        ref={forwardedRef}
        data-reach-accordion-panel=""
        {...dataAttributes}
        aria-labelledby={buttonId}
        id={panelId}
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
   * Inner collapsible content for the accordion item.
   *
   * @see Docs https://reacttraining.com/reach-ui/accordion#accordionpanel-children
   */
  children: React.ReactNode;
};

if (__DEV__) {
  AccordionPanel.displayName = "AccordionPanel";
  AccordionPanel.propTypes = {
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////
// Types

type ResultBox<T> = { v: T };

type ButtonRef = React.MutableRefObject<any>;

type AccordionIndex = number | number[];

interface IAccordionContext {
  accordionId: string;
  openPanels: AccordionIndex;
  onSelectPanel(index: AccordionIndex): void;
  readOnly: boolean;
}

interface IAccordionItemContext {
  open: boolean;
  disabled: boolean;
  buttonId: string;
  index: number;
  itemId: string;
  buttonRef: ButtonRef;
  panelId: string;
  dataAttributes: {
    "data-state": AccordionStates;
    "data-disabled": string | undefined;
    "data-read-only": string | undefined;
  };
}
