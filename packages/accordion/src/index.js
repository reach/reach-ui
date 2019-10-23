////////////////////////////////////////////////////////////////////////////////
// Welcome to @reach/accordion!

import React, {
  cloneElement,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { node, func, number, string, bool } from "prop-types";
import warning from "warning";
import { wrapEvent, useUpdateEffect } from "@reach/utils";
import { useId } from "@reach/auto-id";

const { isArray } = Array;

// A11y reference:
//   - https://www.w3.org/TR/wai-aria-practices/examples/accordion/accordion.html
//   - https://www.scottohara.me/blog/2018/09/03/details-and-summary.html
//   - https://inclusive-components.design/collapsible-sections/

// TODO: Screen reader testing

const AccordionContext = createContext({});
const useAccordionContext = () => useContext(AccordionContext);

////////////////////////////////////////////////////////////////////////////////
export const Accordion = forwardRef(function Accordion(
  {
    allowMultiple: _allowMultiple = true,
    allowToggle: _allowToggle = true,
    as: Comp = "div",
    children,
    index: controlledIndex = undefined,
    itemElement = "details",
    onChange,
    readOnly = false,
    ...props
  },
  ref
) {
  // You shouldn't switch between controlled/uncontrolled. We'll check
  // for a controlled component and track any changes in a ref to show
  // a warning.
  const wasControlled = typeof controlledIndex !== "undefined";
  const { current: isControlled } = useRef(wasControlled);

  // `allowMultiple` can only be false in an uncontrolled component.
  // The same is true for `allowToggle` which can also only be false if
  // `allowMultiple` is false.
  const allowMultiple = isControlled || _allowMultiple;
  const allowToggle = allowMultiple || _allowToggle;

  // Even though we're calling the component uncontrolled, we'll track the
  // state internally rather than give control to the DOM. This helps us
  // create a disabled disclosure, which is not available for plain `details`
  // or `summary` elements. Further, there are some inconsistencies still in
  // how some devices and screen readers handle `details`/`summary`, so we
  // should let the developer determine if a button toggle better fits their
  // browser support needs.
  const [activePanelIndices, setActivePanelIndices] = useState([]);
  const _id = useId();

  // Using state here in addition to a ref so we can move focus around
  // when the user navigates with arrow keys
  const [focusedItem, setFocusedItem] = useState(null);
  const userInteractedRef = useRef(false);

  warning(
    !(isControlled && !wasControlled),
    "Accordion is changing from controlled to uncontrolled. Accordion should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled Accordion for the lifetime of the component. Check the `index` prop being passed in."
  );

  warning(
    !(!isControlled && wasControlled),
    "Accordion is changing from uncontrolled to controlled. Accordion should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled Accordion for the lifetime of the component. Check the `index` prop being passed in."
  );

  warning(
    !(isControlled && readOnly),
    "The `readOnly` prop on Accordion was used with controlled state. This will result in buggy behavior. If the accordion does not need toggle state, you should use an uncontrolled component instead. Switch to uncontrolled or remove the `readOnly` prop."
  );

  // Loop through children and find all `disabled` items. This will allow us
  // to determine next/previous focusable items.
  // We also need to count children with the `active` prop to deal with
  // instances where `allowMultiple` is set on an accordion with multiple
  // active children.
  // We'll memoize these to avoid looping through children unneccessarily.
  const childrenArray = useMemo(() => {
    const arr = React.Children.toArray(children);
    return isArray(arr) ? arr : [];
  }, [children]);

  const { enabledIndexes, activeChildCount, hasActiveChild } = useMemo(() => {
    let enabledIndexes = [];
    let activeChildCount = 0;
    let hasActiveChild = false;
    for (let i = 0; i < childrenArray.length; i++) {
      const child = childrenArray[i];
      if (!(typeof child.type === "string" || child.props.disabled === true)) {
        enabledIndexes.push(i);
      }
      if (child.props.active) {
        if (!hasActiveChild) hasActiveChild = true;
        activeChildCount++;
      }
    }
    return {
      enabledIndexes,
      activeChildCount,
      hasActiveChild
    };
  }, [childrenArray]);

  const toggleActivePanelIndex = index => {
    if (
      !enabledIndexes.includes(index) ||
      (activePanelIndices.includes(index) && !allowToggle)
    ) {
      return;
    }
    if (activePanelIndices.includes(index) && allowToggle) {
      setActivePanelIndices(activePanelIndices.filter(i => i !== index));
      return;
    }
    setActivePanelIndices(
      allowMultiple && allowToggle
        ? [...activePanelIndices, index].sort()
        : [index]
    );
  };

  const onActivatePanel = index => {
    onChange && onChange(index);
    if (!isControlled) {
      if (isArray(index)) {
        index.map(toggleActivePanelIndex);
      } else {
        toggleActivePanelIndex(index);
      }
    }
  };

  const ctx = {
    enabledIndexes,
    focusedItem,
    onActivatePanel,
    onSelectPanel: readOnly
      ? () => {}
      : index => {
          userInteractedRef.current = true;
          onActivatePanel(index);
        },
    setFocusedItem,
    userInteractedRef,
    allowMultiple,
    allowToggle,
    isControlled,
    itemElement,
    readOnly
  };

  const clones = React.Children.map(children, (child, index) => {
    // ignore random <div/>s etc.
    if (typeof child.type === "string") return child;

    const isActive = isControlled
      ? isArray(controlledIndex)
        ? controlledIndex.includes(index)
        : controlledIndex === index
      : activePanelIndices.includes(index);

    const clone = cloneElement(child, {
      _id: makeId(_id, index),
      _isDisabled:
        readOnly || (isActive && !allowToggle) ? true : child.props.disabled,
      _index: index,
      active:
        activeChildCount > 1 && !allowMultiple ? false : child.props.active,
      _headerHasFocus: index === focusedItem,
      _isActive: readOnly ? Boolean(child.props.active) : isActive
    });

    return clone;
  });

  useEffect(() => {
    warning(
      !(activeChildCount > 1 && !allowMultiple),
      "You provided an `active` prop to multiple `AccordionItem` components, but the `Accordion` component has a `allowMultiple` prop value of `false`. Only the first active nested `AccordionItem` will retain its active state."
    );
  }, [activeChildCount, allowMultiple]);

  useEffect(() => {
    // If there is no active child and allowToggle is false, set
    // the first child to active.
    if (!isControlled && !allowToggle) {
      if (!hasActiveChild) {
        setActivePanelIndices([0]);
      }
    }
  }, [allowToggle, isControlled, hasActiveChild]);

  return (
    <AccordionContext.Provider value={ctx}>
      <Comp data-reach-accordion="" ref={ref} {...props} children={clones} />
    </AccordionContext.Provider>
  );
});

Accordion.propTypes = {
  allowMultiple: bool,
  allowToggle: bool,
  as: string,
  children: node.isRequired,
  index: (props, name, compName, ...rest) => {
    if (props.index > -1 && props.onChange == null && props.readOnly !== true) {
      return new Error(
        "You provided an `index` prop to `Accordion` without an `onChange` handler. This will render a read-only accordion element. If the accordion should be mutable, remove `index` and use the `active` prop on the nested items that should be active. Otherwise, set `onChange`."
      );
    }
    if (isArray(props.index)) {
      const error = props.index.find(
        i => number(i, props, compName, ...rest) instanceof Error
      );
      if (typeof invalidIndex !== "undefined") return error;
    } else {
      return number(name, props, compName, ...rest);
    }
  },
  itemElement: string,
  onChange: func,
  readOnly: bool
};

////////////////////////////////////////////////////////////////////////////////
export const AccordionItem = forwardRef(function AccordionItem(
  { children, active = false, disabled = false, ...clonedProps },
  ref
) {
  const {
    onActivatePanel,
    onSelectPanel,
    isControlled,
    itemElement,
    readOnly
  } = useAccordionContext();

  const {
    _isDisabled,
    _id,
    _index,
    _headerHasFocus,
    _isActive,
    ...htmlProps
  } = clonedProps;

  const Comp = itemElement || "button";
  const _isNestedInDetailsElement = Comp === "details";

  const clones = React.Children.map(children, child =>
    cloneElement(child, {
      // Whether or not the device picks up an item as disabled is a litle
      // different from whether the element is set by the developer as
      // disabled. For example, assistive technology needs to see an item as
      // disabled any time the user is prevented from toggling for any number
      // of reasons (such as mutually exclusive accordion items preventing
      // the user from closing the only currently active item). We'll use the
      // `disabled` prop on individual items to declare that an item should be
      // perceived as truly disabled from use.
      _actuallyDisabled: disabled,
      _id,
      _index,
      _isDisabled,
      _isNestedInDetailsElement, // details component requires `summary` child
      _onSelect: () => onSelectPanel(_index),
      _isActive,
      _isFocused: _headerHasFocus
    })
  );

  useEffect(() => {
    if (!isControlled && active) {
      onActivatePanel(_index);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [isControlled, active, _index]);

  return (
    <Comp
      ref={ref}
      data-reach-accordion-item=""
      data-active={_isActive ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-read-only={readOnly ? "" : undefined}
      open={_isNestedInDetailsElement ? _isActive : undefined}
      children={clones}
      {...htmlProps}
    />
  );
});

AccordionItem.propTypes = {
  active: (props, name, compName, ...rest) => {
    if (props.isControlled && props.active) {
      return new Error(
        "You provided an `active` prop to `AccordionItem` inside of a controlled `Accordion`. To set an item to active in a controlled parent, pass the the item's index value into the `index` prop on the `Accordion` compomnent, otherwise switch to uncontrolled."
      );
    }
    return bool(name, props, compName, ...rest);
  },
  disabled: bool
};

////////////////////////////////////////////////////////////////////////////////
export const AccordionHeader = forwardRef(function AccordionHeader(
  { children, onClick, onKeyDown, onMouseDown, onPointerDown, ...clonedProps },
  forwardedRef
) {
  const {
    enabledIndexes,
    focusedItem,
    setFocusedItem,
    userInteractedRef,
    readOnly
  } = useAccordionContext();

  const {
    _actuallyDisabled,
    _id,
    _index,
    _isDisabled,
    _isNestedInDetailsElement,
    _onSelect,
    _isFocused,
    _isActive,
    ...htmlProps
  } = clonedProps;

  const Comp = _isNestedInDetailsElement ? "summary" : "button";
  const isButtonElement = Comp === "button";
  const ownRef = useRef(null);
  const ref = forwardedRef || ownRef;

  useUpdateEffect(() => {
    if (_isFocused && userInteractedRef.current) {
      userInteractedRef.current = false;
      ref.current.focus();
    }
  }, [_isActive, _isFocused]);

  const handleClick = wrapEvent(onClick, event => {
    event.preventDefault();
    if (_isDisabled) {
      return;
    }
    setFocusedItem(_index);
    _onSelect();
  });

  const handleKeyDown = wrapEvent(onKeyDown, event => {
    const { key, ctrlKey } = event;
    const enabledFocusedIndex = enabledIndexes.indexOf(focusedItem);
    const isMovingFocus =
      key === "ArrowDown" ||
      key === "ArrowUp" ||
      (ctrlKey && key === "PageDown") ||
      (ctrlKey && key === "PageUp") ||
      key === "Home" ||
      key === "End";

    if (isMovingFocus) {
      event.preventDefault();
      userInteractedRef.current = true;
    }

    if (key === "ArrowDown" || (ctrlKey && key === "PageDown")) {
      const nextEnabledIndex =
        (enabledFocusedIndex + 1) % enabledIndexes.length;
      const nextIndex = enabledIndexes[nextEnabledIndex];
      setFocusedItem(nextIndex);
      return;
    }

    if (key === "ArrowUp" || (ctrlKey && key === "PageUp")) {
      const count = enabledIndexes.length;
      const nextEnabledIndex = (enabledFocusedIndex - 1 + count) % count;
      const nextIndex = enabledIndexes[nextEnabledIndex];
      setFocusedItem(nextIndex);
      return;
    }

    if (key === "Home") {
      setFocusedItem(0);
      return;
    }

    if (key === "End") {
      setFocusedItem(enabledIndexes[enabledIndexes.length - 1]);
      return;
    }
  });

  return (
    <Comp
      ref={ref}
      data-reach-accordion-header=""
      data-active={_isActive ? "" : undefined}
      data-disabled={_actuallyDisabled ? "" : undefined}
      aria-controls={_isNestedInDetailsElement ? undefined : `panel:${_id}`}
      aria-disabled={isButtonElement ? undefined : _isDisabled}
      aria-expanded={_isActive}
      data-read-only={readOnly ? "" : undefined}
      disabled={isButtonElement ? _isDisabled : undefined}
      id={`header:${_id}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={Comp !== "button" ? "button" : undefined}
      tabIndex={_isDisabled ? -1 : _isNestedInDetailsElement ? 0 : undefined}
      children={children}
      {...htmlProps}
    />
  );
});

AccordionHeader.propTypes = {
  children: node
};

////////////////////////////////////////////////////////////////////////////////
export const AccordionPanel = forwardRef(function AccordionPanel(
  { children, as: Comp = "div", ...rest },
  forwardedRef
) {
  const { readOnly } = useAccordionContext();

  const {
    _actuallyDisabled,
    _id,
    _index,
    _isDisabled,
    _isNestedInDetailsElement,
    _onSelect,
    _isActive,
    _isFocused,
    ...htmlProps
  } = rest;

  const ownRef = useRef(null);
  const ref = forwardedRef || ownRef;

  return (
    <Comp
      ref={ref}
      data-reach-accordion-panel=""
      data-active={_isActive ? "" : undefined}
      data-disabled={_actuallyDisabled ? "" : undefined}
      data-read-only={readOnly ? "" : undefined}
      aria-labelledby={_isNestedInDetailsElement ? undefined : `header:${_id}`}
      hidden={_isNestedInDetailsElement ? undefined : !_isActive}
      id={`panel:${_id}`}
      role={_isNestedInDetailsElement ? undefined : "region"}
      tabIndex={-1}
      children={children}
      {...htmlProps}
    />
  );
});

AccordionPanel.propTypes = {
  as: string,
  children: node
};

const makeId = (id, index) => `${id}:${index}`;
