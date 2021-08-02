/**
 * Welcome to @reach/accordion!
 *
 * TODO: Animation examples
 *
 * @see Docs     https://reach.tech/accordion
 * @see Source   https://github.com/reach/reach-ui/tree/main/packages/accordion
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
 */

import * as React from "react";
import { createNamedContext } from "@reach/utils/context";
import { isBoolean, isNumber } from "@reach/utils/type-check";
import { makeId } from "@reach/utils/make-id";
import { noop } from "@reach/utils/noop";
import { useCheckStyles } from "@reach/utils/dev-utils";
import { useComposedRefs } from "@reach/utils/compose-refs";
import { composeEventHandlers } from "@reach/utils/compose-event-handlers";
import { useStatefulRefValue } from "@reach/utils/use-stateful-ref-value";
import warning from "tiny-warning";
import {
  createDescendantContext,
  DescendantProvider,
  useDescendant,
  useDescendantKeyDown,
  useDescendantsInit,
} from "@reach/descendants";
import { useId } from "@reach/auto-id";
import PropTypes from "prop-types";

import type * as Polymorphic from "@reach/utils/polymorphic";
import type { Descendant } from "@reach/descendants";

const AccordionDescendantContext = createDescendantContext<AccordionDescendant>(
  "AccordionDescendantContext"
);
const AccordionContext = createNamedContext<InternalAccordionContextValue>(
  "AccordionContext",
  {} as InternalAccordionContextValue
);
const AccordionItemContext =
  createNamedContext<InternalAccordionItemContextValue>(
    "AccordionItemContext",
    {} as InternalAccordionItemContextValue
  );

////////////////////////////////////////////////////////////////////////////////

enum AccordionStates {
  Open = "OPEN",
  Collapsed = "COLLAPSED",
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Accordion
 *
 * The wrapper component for all other accordion components. Each accordion
 * component will consist of accordion items whose buttons are keyboard
 * navigable using arrow keys.
 *
 * @see Docs https://reach.tech/accordion#accordion-1
 */
const Accordion = React.forwardRef(function Accordion(
  {
    as: Comp = "div",
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
  let wasControlled = typeof controlledIndex !== "undefined";
  let { current: isControlled } = React.useRef(wasControlled);

  let [descendants, setDescendants] = useDescendantsInit<AccordionDescendant>();

  let id = useId(props.id);

  // Define our default starting index
  let [openPanels, setOpenPanels] = React.useState<AccordionIndex>(() => {
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
        return multiple ? [] : -1;
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

  let onSelectPanel = React.useCallback(
    (index: number) => {
      onChange && onChange(index);

      if (!isControlled) {
        setOpenPanels((prevOpenPanels) => {
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
                return prevOpenPanels.filter((i) => i !== index);
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

  let context: InternalAccordionContextValue = React.useMemo(
    () => ({
      accordionId: id,
      openPanels: isControlled ? controlledIndex! : openPanels,
      onSelectPanel: readOnly ? noop : onSelectPanel,
      readOnly,
    }),
    [openPanels, controlledIndex, id, isControlled, onSelectPanel, readOnly]
  );

  useCheckStyles("accordion");

  return (
    <DescendantProvider
      context={AccordionDescendantContext}
      items={descendants}
      set={setDescendants}
    >
      <AccordionContext.Provider value={context}>
        <Comp {...props} ref={forwardedRef} data-reach-accordion="">
          {children}
        </Comp>
      </AccordionContext.Provider>
    </DescendantProvider>
  );
}) as Polymorphic.ForwardRefComponent<"div", AccordionProps>;

/**
 * @see Docs https://reach.tech/accordion#accordion-props
 */
interface AccordionProps {
  /**
   * `Accordion` can accept `AccordionItem` components as children.
   *
   * @see Docs https://reach.tech/accordion#accordion-children
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
   * @see Docs https://reach.tech/accordion#accordion-defaultindex
   */
  defaultIndex?: AccordionIndex;
  /**
   * The index or array of indices for open accordion panels. The `index` props
   * should be used along with `onChange` to create controlled accordion
   * components.
   *
   * @see Docs https://reach.tech/accordion#accordion-index
   */
  index?: AccordionIndex;
  /**
   * The callback that is fired when an accordion item's open state is changed.
   *
   * @see Docs https://reach.tech/accordion#accordion-onchange
   */
  onChange?(index?: number): void;
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
   * @see Docs https://reach.tech/accordion#accordion-onchange
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
}

if (__DEV__) {
  Accordion.displayName = "Accordion";
  Accordion.propTypes = {
    children: PropTypes.node.isRequired,
    defaultIndex: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
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
        return props[name].some((i: any) => !isNumber(i))
          ? new Error(
              "You provided an array as an index in `Accordion` but one or more of the values are not numeric. Please check to make sure all indices are valid numbers."
            )
          : null;
      } else if (props[name] != null && !isNumber(props[name])) {
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
      } else if (props[name] != null && !isBoolean(props[name])) {
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
    collapsible: PropTypes.bool,
  };
}

/**
 * AccordionItem
 *
 * A group that wraps a an accordion's button and panel components.
 *
 * @see Docs https://reach.tech/accordion#accordionitem
 */
const AccordionItem = React.forwardRef(function AccordionItem(
  { as: Comp = "div", children, disabled = false, index: indexProp, ...props },
  forwardedRef
) {
  let { accordionId, openPanels, readOnly } =
    React.useContext(AccordionContext);
  let buttonRef: ButtonRef = React.useRef(null);

  let [element, handleButtonRefSet] = useStatefulRefValue<HTMLElement | null>(
    buttonRef,
    null
  );
  let descendant = React.useMemo(() => {
    return {
      element,
      disabled,
    };
  }, [disabled, element]);
  let index = useDescendant(descendant, AccordionDescendantContext, indexProp);

  // We need unique IDs for the panel and button to point to one another
  let itemId = makeId(accordionId, index);
  let panelId = makeId("panel", itemId);
  let buttonId = makeId("button", itemId);

  let state =
    (Array.isArray(openPanels)
      ? openPanels.includes(index) && AccordionStates.Open
      : openPanels === index && AccordionStates.Open) ||
    AccordionStates.Collapsed;

  let context: InternalAccordionItemContextValue = {
    buttonId,
    buttonRef,
    disabled,
    handleButtonRefSet,
    index,
    itemId,
    panelId,
    state,
  };

  return (
    <AccordionItemContext.Provider value={context}>
      <Comp
        {...props}
        ref={forwardedRef}
        data-reach-accordion-item=""
        data-state={getDataState(state)}
        data-disabled={disabled ? "" : undefined}
        data-read-only={readOnly ? "" : undefined}
      >
        {children}
      </Comp>
    </AccordionItemContext.Provider>
  );
}) as Polymorphic.ForwardRefComponent<"div", AccordionItemProps>;

/**
 * @see Docs https://reach.tech/accordion#accordionitem-props
 */
interface AccordionItemProps {
  /**
   * An `AccordionItem` expects to receive an `AccordionButton` and
   * `AccordionPanel` components as its children, though you can also nest other
   * components within an `AccordionItem` if you want some persistant content
   * that is relevant to the section but not collapsible when the
   * `AccordionButton` is toggled.
   *
   * @see Docs https://reach.tech/accordion#accordionitem-children
   */
  children: React.ReactNode;
  /**
   * Whether or not an accordion panel is disabled from user interaction.
   *
   * @see Docs https://reach.tech/accordion#accordionitem-disabled
   */
  disabled?: boolean;
  /**
   * TODO: Document this!
   */
  index?: number;
}

if (__DEV__) {
  AccordionItem.displayName = "AccordionItem";
  AccordionItem.propTypes = {
    disabled: PropTypes.bool,
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
 * @see Docs https://reach.tech/accordion#accordionbutton
 */
const AccordionButton = React.forwardRef(function AccordionButton(
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
  let { onSelectPanel } = React.useContext(AccordionContext);

  let {
    disabled,
    buttonId,
    buttonRef: ownRef,
    handleButtonRefSet,
    index,
    panelId,
    state,
  } = React.useContext(AccordionItemContext);

  let ref = useComposedRefs(forwardedRef, handleButtonRefSet);

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    if (disabled) {
      return;
    }
    ownRef.current.focus();
    onSelectPanel(index);
  }

  let handleKeyDown = useDescendantKeyDown(AccordionDescendantContext, {
    currentIndex: index,
    orientation: "vertical",
    key: "element",
    rotate: true,
    callback(element: HTMLElement) {
      element?.focus();
    },
    filter: (button) => !button.disabled,
  });

  return (
    <Comp
      // Each accordion header `button` is wrapped in an element with role
      // `heading` that has a value set for `aria-level` that is appropriate
      // for the information architecture of the page.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
      // I believe this should be left for apps to handle, since headings
      // are necessarily context-aware. An app can wrap a button inside any
      // arbitrary tag(s).
      // TODO: Revisit documentation and examples
      // @example
      // <div>
      //   <h3>
      //     <AccordionButton>Click Me</AccordionButton>
      //   </h3>
      //   <SomeComponent />
      // </div>

      // The title of each accordion header is contained in an element with
      // role `button`. We use an HTML button by default, so we can omit
      // this attribute.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
      // role="button"

      // The accordion header `button` element has `aria-controls` set to the
      // ID of the element containing the accordion panel content.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
      aria-controls={panelId}
      // If the accordion panel associated with an accordion header is
      // visible, the header `button` element has `aria-expanded` set to
      // `true`. If the panel is not visible, `aria-expanded` is set to
      // `false`.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
      aria-expanded={state === AccordionStates.Open}
      tabIndex={disabled ? -1 : tabIndex}
      {...props}
      ref={ref}
      data-reach-accordion-button=""
      data-state={getDataState(state)}
      // If the accordion panel associated with an accordion header is
      // visible, and if the accordion does not permit the panel to be
      // collapsed, the header `button` element has `aria-disabled` set to
      // `true`. We can use `disabled` since we opt for an HTML5 `button`
      // element.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
      disabled={disabled || undefined}
      id={buttonId}
      onClick={composeEventHandlers(onClick, handleClick)}
      onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
    >
      {children}
    </Comp>
  );
}) as Polymorphic.ForwardRefComponent<"button", AccordionButtonProps>;

/**
 * @see Docs https://reach.tech/accordion#accordionbutton-props
 */
interface AccordionButtonProps {
  /**
   * Typically a text string that serves as a label for the accordion, though
   * nested DOM nodes can be passed as well so long as they are valid children
   * of interactive elements.
   *
   * @see https://github.com/w3c/html-aria/issues/54
   * @see Docs https://reach.tech/accordion#accordionbutton-children
   */
  children: React.ReactNode;
}

if (__DEV__) {
  AccordionButton.displayName = "AccordionButton";
  AccordionButton.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * AccordionPanel
 *
 * The collapsible panel in which inner content for an accordion item is
 * rendered.
 *
 * @see Docs https://reach.tech/accordion#accordionpanel
 */
const AccordionPanel = React.forwardRef(function AccordionPanel(
  { as: Comp = "div", children, ...props },
  forwardedRef
) {
  let { disabled, panelId, buttonId, state } =
    React.useContext(AccordionItemContext);

  return (
    <Comp
      hidden={state !== AccordionStates.Open}
      // Optionally, each element that serves as a container for panel content
      // has role `region` and `aria-labelledby` with a value that refers to
      // the button that controls display of the panel.
      // Role `region` is especially helpful to the perception of structure by
      // screen reader users when panels contain heading elements or a nested
      // accordion.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#accordion

      // Avoid using the region role in circumstances that create landmark
      // region proliferation, e.g., in an accordion that contains more than
      // approximately 6 panels that can be expanded at the same time.
      // A user can override this with `role="none"` or `role="presentation"`
      // TODO: Add to docs
      role="region"
      aria-labelledby={buttonId}
      {...props}
      ref={forwardedRef}
      data-reach-accordion-panel=""
      data-disabled={disabled || undefined}
      data-state={getDataState(state)}
      id={panelId}
    >
      {children}
    </Comp>
  );
}) as Polymorphic.ForwardRefComponent<"div", AccordionPanelProps>;

/**
 * @see Docs https://reach.tech/accordion#accordionpanel-props
 */
interface AccordionPanelProps {
  /**
   * Inner collapsible content for the accordion item.
   *
   * @see Docs https://reach.tech/accordion#accordionpanel-children
   */
  children: React.ReactNode;
}

if (__DEV__) {
  AccordionPanel.displayName = "AccordionPanel";
  AccordionPanel.propTypes = {
    children: PropTypes.node,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * A hook that exposes data for a given `Accordion` component to its
 * descendants.
 *
 * @see Docs https://reach.tech/accordion#useaccordioncontext
 */
function useAccordionContext(): AccordionContextValue {
  let { openPanels, accordionId } = React.useContext(AccordionContext);
  return React.useMemo(() => {
    let panels: number[] = [];
    return {
      id: accordionId,
      openPanels: panels.concat(openPanels).filter((i) => i >= 0),
    };
  }, [accordionId, openPanels]);
}

/**
 * A hook that exposes data for a given `AccordionItem` component to its
 * descendants.
 *
 * @see Docs https://reach.tech/accordion#useaccordionitemcontext
 */
function useAccordionItemContext(): AccordionItemContextValue {
  let { index, state } = React.useContext(AccordionItemContext);
  return React.useMemo(
    () => ({
      index,
      isExpanded: state === AccordionStates.Open,
    }),
    [index, state]
  );
}

////////////////////////////////////////////////////////////////////////////////

function getDataState(state: AccordionStates) {
  return state === AccordionStates.Open ? "open" : "collapsed";
}

////////////////////////////////////////////////////////////////////////////////
// Types

interface AccordionContextValue {
  id: string | undefined;
  openPanels: number[];
}

interface AccordionItemContextValue {
  index: number;
  isExpanded: boolean;
}

type AccordionDescendant = Descendant & {
  disabled: boolean;
};

type ButtonRef = React.MutableRefObject<any>;

type AccordionIndex = number | number[];

interface InternalAccordionContextValue {
  accordionId: string | undefined;
  openPanels: AccordionIndex;
  onSelectPanel(index: AccordionIndex): void;
  readOnly: boolean;
}

interface InternalAccordionItemContextValue {
  disabled: boolean;
  buttonId: string;
  index: number;
  itemId: string;
  handleButtonRefSet(refValue: HTMLElement): void;
  buttonRef: ButtonRef;
  panelId: string;
  state: AccordionStates;
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export type {
  AccordionButtonProps,
  AccordionContextValue,
  AccordionItemContextValue,
  AccordionItemProps,
  AccordionPanelProps,
  AccordionProps,
};
export {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  AccordionStates,
  useAccordionContext,
  useAccordionItemContext,
};
