////////////////////////////////////////////////////////////////////////////////
// Welcome to @reach/accordion!

import React, {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from "react";
import { makeId, wrapEvent, useForkedRef } from "@reach/utils";
import { useId } from "@reach/auto-id";
import PropTypes from "prop-types";
import warning from "warning";

// A11y reference:
//   - https://www.w3.org/TR/wai-aria-practices/examples/accordion/accordion.html
//   - https://inclusive-components.design/collapsible-sections/

// TODO: Screen reader testing
// TODO: Read only state bugs

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
   * We will store all AccordionHeader refs inside this array to manage focus.
   */
  const focusabledHeaderNodes = useRef([]);

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
      if (!(typeof child.type === "string" || child.props.disabled === true)) {
        enabledIndices.push(i);
      }
    }
    return enabledIndices;
  }, [childrenArray]);

  if (__DEV__) {
    warning(
      !(isControlled && !wasControlled),
      "Accordion is changing from controlled to uncontrolled. Accordion should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled Accordion for the lifetime of the component. Check the `index` prop being passed in."
    );

    warning(
      !(!isControlled && wasControlled),
      "Accordion is changing from uncontrolled to controlled. Accordion should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled Accordion for the lifetime of the component. Check the `index` prop being passed in."
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
    focusabledHeaderNodes,
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
  { _index: index, children, disabled = false, ...props },
  forwardedRef
) {
  const { accordionId, activeIndex, readOnly } = useAccordionContext();

  // We need unique IDs for the panel and header to point to one another
  const itemId = makeId(accordionId, index);
  const panelId = makeId("panel", itemId);
  const headerId = makeId("header", itemId);

  const context = {
    active: activeIndex === index,
    disabled,
    headerId,
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
// AccordionHeader

export const AccordionHeader = forwardRef(function AccordionHeader(
  {
    as: Comp = "button",
    children,
    onClick,
    onKeyDown,
    onMouseDown,
    onPointerDown,
    ...props
  },
  forwardedRef
) {
  const {
    enabledIndices,
    focusabledHeaderNodes,
    onSelectPanel,
    readOnly
  } = useAccordionContext();

  const {
    active,
    disabled,
    headerId,
    index,
    panelId
  } = useAccordionItemContext();

  /*
   * If the user decides to use a div instead of a native button, we check the
   * ref's node type after it mounts to the DOM in order to shim the necessary
   * attributes.
   */
  const [isButtonElement, setIsButtonElement] = useState(Comp === "button");
  const ownRef = useRef(null);
  const setButtonRef = useCallback(
    node => {
      ownRef.current = node;
      if (node && Comp !== "button") {
        setIsButtonElement(node.nodeName === "BUTTON");
      }
    },
    [Comp]
  );
  const buttonAttributeProps = isButtonElement
    ? {
        disabled: disabled || undefined,
        tabIndex: disabled ? -1 : undefined
      }
    : {
        "aria-disabled": disabled || undefined,
        role: "button",
        tabIndex: disabled ? -1 : 0
      };

  /*
   * We only need an array of refs for our headers for keyboard navigation, and
   * we already know the index because we can constrain Accordion children to
   * only AccordionItems. So we shouldn't need to do any funky render dancing
   * here, just update the ref in the same order if the index changes.
   */
  const setFocusableHeaderRefs = useCallback(
    node => {
      if (node && !disabled) {
        focusabledHeaderNodes.current[index] = node;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, index]
  );

  const ref = useForkedRef(forwardedRef, setButtonRef, setFocusableHeaderRefs);

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
    const { current: focusNodes } = focusabledHeaderNodes;
    const focusNodeIndex = focusNodes.indexOf(document.activeElement);
    const enabledFocusedIndex = enabledIndices.indexOf(focusNodeIndex);
    const count = enabledIndices.length;

    const isMovingFocus =
      key === "ArrowDown" ||
      key === "ArrowUp" ||
      (ctrlKey && key === "PageDown") ||
      (ctrlKey && key === "PageUp") ||
      key === "Home" ||
      key === "End";

    if (isMovingFocus) {
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

    if (!isButtonElement && (key === " " || key === "Enter")) {
      event.preventDefault();
      ownRef.current.click();
    }
  }

  return (
    <Comp
      ref={ref}
      aria-controls={panelId}
      aria-expanded={active}
      data-reach-accordion-header=""
      data-active={active ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-read-only={readOnly ? "" : undefined}
      id={headerId}
      onClick={wrapEvent(onClick, handleClick)}
      onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
      {...buttonAttributeProps}
      {...props}
    >
      {children}
    </Comp>
  );
});

AccordionHeader.displayName = "AccordionHeader";
if (__DEV__) {
  AccordionHeader.propTypes = {
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

  const { disabled, panelId, headerId, active } = useAccordionItemContext();

  return (
    <div
      ref={forwardedRef}
      aria-labelledby={headerId}
      data-reach-accordion-panel=""
      data-active={active ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-read-only={readOnly ? "" : undefined}
      hidden={!active}
      id={panelId}
      role={"region"}
      tabIndex={-1}
      {...props}
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

function noop() {}
