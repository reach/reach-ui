////////////////////////////////////////////////////////////////////////////////
// Welcome to @reach/accordion!

import React, {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
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

const AccordionContext = createContext({});
const AccordionItemContext = createContext({});
const useAccordionContext = () => useContext(AccordionContext);
const useAccordionItemContext = () => useContext(AccordionItemContext);

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

  /*
   * Loop through children and find all `disabled` items. This will allow us
   * to determine next/previous focusable items. We also need to count children
   * with the `active` prop to deal with instances where `allowMultiple` is set
   * on an accordion with multiple active children.
   */
  const childrenArray = useMemo(() => {
    const arr = React.Children.toArray(children);
    return Array.isArray(arr) ? arr : [];
  }, [children]);

  const enabledIndices = useMemo(() => {
    let enabledIndices = [];

    for (let i = 0; i < childrenArray.length; i++) {
      const child = childrenArray[i];
      if (!(typeof child.type === "string" || child.props.disabled)) {
        enabledIndices.push(i);
      }
    }
    return enabledIndices;
  }, [childrenArray]);

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
    enabledIndices,
    onSelectPanel: readOnly ? noop : onSelectPanel,
    readOnly
  };

  if (isControlled && controlledIndex !== activeIndex) {
    /*
     * If the component is controlled, we'll sync internal state with the
     * controlled state
     */
    setActiveIndex(controlledIndex);
  }

  useEffect(() => checkStyles("accordion"), []);

  return (
    <AccordionContext.Provider value={context}>
      <div data-reach-accordion="" ref={forwardedRef} {...props}>
        {Children.map(children, (child, _index) =>
          cloneElement(child, { _index })
        )}
      </div>
    </AccordionContext.Provider>
  );
});

Accordion.displayName = "Accordion";
if (__DEV__) {
  Accordion.propTypes = {
    children: PropTypes.node.isRequired,
    index: (props, name, compName, ...rest) => {
      if (props.index == null && props.onChange == null) {
        return new Error(
          "You provided an `index` prop to `Accordion` without an `onChange` handler. This will render a read-only accordion element. If the accordion should be mutable, remove `index` and use the `active` prop on the nested items that should be active. Otherwise, set `onChange`."
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
  {
    _index: index,

    children,
    disabled = false,
    ...props
  },
  forwardedRef
) {
  const { accordionId, activeIndex, readOnly } = useAccordionContext();
  // We need unique IDs for the panel and trigger to point to one another
  const itemId = makeId(accordionId, index);
  const panelId = makeId("panel", itemId);
  const triggerId = makeId("trigger", itemId);

  const context = {
    active: activeIndex === index,
    disabled,
    triggerId,
    index,
    itemId,
    panelId
  };

  return (
    <AccordionItemContext.Provider value={context}>
      <div
        ref={forwardedRef}
        data-reach-accordion-item=""
        data-active={activeIndex === index ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        data-read-only={readOnly ? "" : undefined}
        {...props}
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
    enabledIndices,
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
    const focusNodeIndex = focusNodes.indexOf(document.activeElement);
    const enabledFocusedIndex = enabledIndices.indexOf(focusNodeIndex);
    const count = enabledIndices.length;

    // Check if we are moving focus
    if (
      key === "ArrowDown" ||
      key === "ArrowUp" ||
      (ctrlKey && key === "PageDown") ||
      (ctrlKey && key === "PageUp") ||
      key === "Home" ||
      key === "End"
    ) {
      event.preventDefault();
    }

    if (key === "ArrowDown" || (ctrlKey && key === "PageDown")) {
      const nextIndex = enabledIndices[(enabledFocusedIndex + 1) % count];
      focusNodes[nextIndex] && focusNodes[nextIndex].focus();
      return;
    }

    if (key === "ArrowUp" || (ctrlKey && key === "PageUp")) {
      const previousIndex =
        enabledIndices[(enabledFocusedIndex - 1 + count) % count];
      focusNodes[previousIndex] && focusNodes[previousIndex].focus();
      return;
    }

    if (key === "Home") {
      const firstIndex = enabledIndices[0];
      focusNodes[firstIndex] && focusNodes[firstIndex].focus();
      return;
    }

    if (key === "End") {
      const lastIndex = enabledIndices[count - 1];
      focusNodes[lastIndex] && focusNodes[lastIndex].focus();
      return;
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
