import React, { cloneElement, useState, useRef, forwardRef } from "react";
import PropTypes from "prop-types";
import warning from "warning";
import { wrapEvent, useUpdateEffect, makeId, useForkedRef } from "@reach/utils";
import { useId } from "@reach/auto-id";

////////////////////////////////////////////////////////////////////////////////
// Tabs

export const Tabs = forwardRef(function Tabs(
  {
    children,
    as: Comp = "div",
    onChange,
    index: controlledIndex = undefined,
    readOnly = false,
    defaultIndex,
    ...props
  },
  ref
) {
  // useRef because you shouldn't switch between controlled/uncontrolled
  const { current: isControlled } = useRef(controlledIndex != null);

  warning(
    !(isControlled && controlledIndex == null),
    "Tabs is changing from controlled to uncontrolled. Tabs should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled Tabs for the lifetime of the component. Check the `index` prop being passed in."
  );

  warning(
    !(!isControlled && controlledIndex != null),
    "Tabs is changing from uncontrolled to controlled. Tabs should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled Tabs for the lifetime of the component. Check the `index` prop being passed in."
  );

  const id = useId(props.id);

  // we only manage focus if the user caused the update vs.
  // a new controlled index coming in
  const _userInteractedRef = useRef(false);

  const _selectedPanelRef = useRef(null);

  const [selectedIndex, setSelectedIndex] = useState(defaultIndex || 0);

  const clones = React.Children.map(children, child => {
    if (elementIsNullOrString(child)) return child;
    return cloneElement(child, {
      selectedIndex: isControlled ? controlledIndex : selectedIndex,
      _id: id,
      _userInteractedRef,
      _selectedPanelRef,
      _onFocusPanel: () =>
        _selectedPanelRef.current && _selectedPanelRef.current.focus(),
      _onSelectTab: readOnly
        ? () => {}
        : index => {
            _userInteractedRef.current = true;
            onChange && onChange(index);
            if (!isControlled) {
              setSelectedIndex(index);
            }
          }
    });
  });

  return <Comp data-reach-tabs="" ref={ref} {...props} children={clones} />;
});

Tabs.displayName = "Tabs";
if (__DEV__) {
  Tabs.propTypes = {
    children: PropTypes.node.isRequired,
    onChange: PropTypes.func,
    index: (props, name, compName, ...rest) => {
      if (
        props.index > -1 &&
        props.onChange == null &&
        props.readOnly !== true
      ) {
        return new Error(
          "You provided a `value` prop to `Tabs` without an `onChange` handler. This will render a read-only tabs element. If the tabs should be mutable use `defaultIndex`. Otherwise, set `onChange`."
        );
      } else {
        return PropTypes.number(name, props, compName, ...rest);
      }
    },
    defaultIndex: PropTypes.number
  };
}

////////////////////////////////////////////////////////////////////////////////
// TabList

export const TabList = forwardRef(function TabList(
  { children, as: Comp = "div", onKeyDown, ...clonedProps },
  ref
) {
  const {
    selectedIndex,
    _onSelectTab,
    _userInteractedRef,
    _onFocusPanel,
    _selectedPanelRef,
    _id,
    ...htmlProps
  } = clonedProps;

  const clones = React.Children.map(children, (child, index) => {
    if (elementIsNullOrString(child)) return child;
    return cloneElement(child, {
      isSelected: index === selectedIndex,
      _id: makeId(_id, index),
      _userInteractedRef,
      _onSelect: () => _onSelectTab(index)
    });
  });

  const handleKeyDown = wrapEvent(onKeyDown, event => {
    const enabledIndexes = React.Children.map(children, (child, index) =>
      child.props.disabled === true ? null : index
    ).filter(index => index != null); // looks something like: [0, 2, 3, 5]
    const enabledSelectedIndex = enabledIndexes.indexOf(selectedIndex);

    switch (event.key) {
      case "ArrowRight": {
        const nextEnabledIndex =
          (enabledSelectedIndex + 1) % enabledIndexes.length;
        const nextIndex = enabledIndexes[nextEnabledIndex];
        _onSelectTab(nextIndex);
        break;
      }
      case "ArrowLeft": {
        const count = enabledIndexes.length;
        const nextEnabledIndex = (enabledSelectedIndex - 1 + count) % count;
        const nextIndex = enabledIndexes[nextEnabledIndex];
        _onSelectTab(nextIndex);
        break;
      }
      case "ArrowDown": {
        // don't scroll down
        event.preventDefault();
        _onFocusPanel();
        break;
      }
      case "Home": {
        _onSelectTab(0);
        break;
      }
      case "End": {
        _onSelectTab(React.Children.count(children) - 1);
        break;
      }
      default: {
      }
    }
  });

  return (
    <Comp
      data-reach-tab-list=""
      ref={ref}
      role="tablist"
      onKeyDown={handleKeyDown}
      children={clones}
      {...htmlProps}
    />
  );
});

TabList.displayName = "TabList";
if (__DEV__) {
  TabList.propTypes = {
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////
// Tab

export const Tab = forwardRef(function Tab(
  { children, as: Comp = "button", ...rest },
  forwardedRef
) {
  const { isSelected, _userInteractedRef, _onSelect, _id, ...htmlProps } = rest;
  const htmlType =
    Comp === "button" && htmlProps.type == null ? "button" : undefined;

  const ownRef = useRef(null);
  const ref = useForkedRef(forwardedRef, ownRef);

  useUpdateEffect(() => {
    if (isSelected && ownRef.current && _userInteractedRef.current) {
      _userInteractedRef.current = false;
      ownRef.current.focus();
    }
  }, [isSelected]);

  return (
    <Comp
      data-reach-tab=""
      ref={ref}
      role="tab"
      id={makeId("tab", _id)}
      tabIndex={isSelected ? 0 : -1}
      aria-selected={isSelected}
      aria-controls={makeId("panel", _id)}
      data-selected={isSelected ? "" : undefined}
      onClick={_onSelect}
      children={children}
      type={htmlType}
      {...htmlProps}
    />
  );
});

Tab.displayName = "Tab";
if (__DEV__) {
  Tab.propTypes = {
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////
// TabPanels

export const TabPanels = forwardRef(function TabPanels(
  { children, as: Comp = "div", ...rest },
  forwardedRef
) {
  const {
    selectedIndex,
    _selectedPanelRef,
    _userInteractedRef,
    _onFocusPanel,
    _onSelectTab,
    _id,
    ...htmlAttrs
  } = rest;

  const clones = React.Children.map(children, (child, index) => {
    if (elementIsNullOrString(child)) return child;
    return cloneElement(child, {
      isSelected: index === selectedIndex,
      _selectedPanelRef,
      _id: makeId(_id, index)
    });
  });

  return (
    <Comp
      data-reach-tab-panels=""
      ref={forwardedRef}
      {...htmlAttrs}
      children={clones}
    />
  );
});

TabPanels.displayName = "TabPanels";
if (__DEV__) {
  TabPanels.propTypes = {
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////
// TabPanel

export const TabPanel = forwardRef(function TabPanel(
  { children, as: Comp = "div", ...rest },
  forwardedRef
) {
  const { isSelected, _selectedPanelRef, _id, ...htmlProps } = rest;
  const ref = useForkedRef(forwardedRef, isSelected ? _selectedPanelRef : null);

  return (
    <Comp
      data-reach-tab-panel=""
      ref={ref}
      role="tabpanel"
      tabIndex={-1}
      aria-labelledby={makeId("tab", _id)}
      hidden={!isSelected}
      id={makeId("panel", _id)}
      children={children}
      {...htmlProps}
    />
  );
});

TabPanel.displayName = "TabPanel";
if (__DEV__) {
  TabPanel.propTypes = {
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////

// Check children before cloning to ignore strings or null values
function elementIsNullOrString(child) {
  return !child || typeof child.type === "string";
}
