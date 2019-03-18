import React, {
  cloneElement,
  useState,
  useEffect,
  useRef,
  forwardRef
} from "react";
import { node, func, number } from "prop-types";
import warning from "warning";
import { wrapEvent } from "@reach/utils";
import { useId } from "@reach/auto-id";

////////////////////////////////////////////////////////////////////////////////
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

  const _id = useId();

  // we only manage focus if the user caused the update vs.
  // a new controlled index coming in
  const _userInteractedRef = useRef(false);

  const _selectedPanelRef = useRef(null);

  const [selectedIndex, setSelectedIndex] = useState(defaultIndex || 0);

  const clones = React.Children.map(children, child => {
    // ignore random <div/>s etc.
    if (typeof child.type === "string") return child;
    return cloneElement(child, {
      selectedIndex: isControlled ? controlledIndex : selectedIndex,
      _id,
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

Tabs.propTypes = {
  children: node.isRequired,
  onChange: func,
  index: (props, name, compName, ...rest) => {
    if (props.index > -1 && props.onChange == null && props.readOnly !== true) {
      return new Error(
        "You provided a `value` prop to `Tabs` without an `onChange` handler. This will render a read-only tabs element. If the tabs should be mutable use `defaultIndex`. Otherwise, set `onChange`."
      );
    } else {
      return number(name, props, compName, ...rest);
    }
  },
  defaultIndex: number
};

////////////////////////////////////////////////////////////////////////////////
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

TabList.propTypes = {
  children: node
};

////////////////////////////////////////////////////////////////////////////////
export const Tab = forwardRef(function Tab(
  { children, as: Comp = "button", ...rest },
  forwardedRef
) {
  const { isSelected, _userInteractedRef, _onSelect, _id, ...htmlProps } = rest;

  const ownRef = useRef(null);
  const ref = forwardedRef || ownRef;

  useUpdateEffect(() => {
    if (isSelected && ref.current && _userInteractedRef.current) {
      _userInteractedRef.current = false;
      ref.current.focus();
    }
  }, [isSelected]);

  return (
    <Comp
      data-reach-tab=""
      ref={ref}
      role="tab"
      id={`tab:${_id}`}
      tabIndex={isSelected ? 0 : -1}
      aria-selected={isSelected}
      aria-controls={`panel:${_id}`}
      data-selected={isSelected ? "" : undefined}
      onClick={_onSelect}
      children={children}
      {...htmlProps}
    />
  );
});

Tab.propTypes = {
  children: node
};

////////////////////////////////////////////////////////////////////////////////
export const TabPanels = forwardRef(function TabPanels(
  { children, as: Comp = "div", ...rest },
  ref
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

  const clones = React.Children.map(children, (child, index) =>
    cloneElement(child, {
      isSelected: index === selectedIndex,
      _selectedPanelRef,
      _id: makeId(_id, index)
    })
  );

  return (
    <Comp data-reach-tab-panels="" ref={ref} {...htmlAttrs} children={clones} />
  );
});

TabPanels.propTypes = {
  children: node
};

////////////////////////////////////////////////////////////////////////////////
export const TabPanel = forwardRef(function TabPanel(
  { children, as: Comp = "div", ...rest },
  ref
) {
  const { isSelected, _selectedPanelRef, _id, ...htmlProps } = rest;

  return (
    <Comp
      data-reach-tab-panel=""
      ref={isSelected ? _selectedPanelRef : undefined}
      role="tabpanel"
      tabIndex={-1}
      aria-labelledby={`tab:${_id}`}
      hidden={!isSelected}
      id={`panel:${_id}`}
      children={children}
      {...htmlProps}
    />
  );
});

TabPanel.propTypes = {
  children: node
};

////////////////////////////////////////////////////////////////////////////////
// TODO: move into @reach/utils when something else needs it
function useUpdateEffect(effect, deps) {
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) {
      effect();
    } else {
      mounted.current = true;
    }
  }, deps);
}

const makeId = (id, index) => `${id}:${index}`;
