import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import PropTypes from "prop-types";
import warning from "warning";
import {
  checkStyles,
  wrapEvent,
  useUpdateEffect,
  makeId,
  useForkedRef
} from "@reach/utils";
import { useId } from "@reach/auto-id";

const createNamedContext = name => {
  const context = createContext();
  context.displayName = name;

  return context;
};

const TabsContext = createNamedContext("Tabs");
const TabContext = createNamedContext("Tab");
const TabPanelContext = createNamedContext("TabPanel");

export const useTabState = () => {
  const index = useContext(TabContext);
  const { selectedIndex } = useContext(TabsContext);

  return {
    isSelected: index === selectedIndex
  };
};

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

  const tabsContext = React.useMemo(
    () => ({
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
    }),
    [id, controlledIndex, isControlled, onChange, readOnly, selectedIndex]
  );

  useEffect(() => checkStyles("tabs"), []);

  return (
    <Comp data-reach-tabs="" ref={ref} {...props}>
      <TabsContext.Provider value={tabsContext}>
        {children}
      </TabsContext.Provider>
    </Comp>
  );
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
  { children, as: Comp = "div", onKeyDown, ...htmlProps },
  ref
) {
  const { selectedIndex, _onSelectTab, _onFocusPanel } = useContext(
    TabsContext
  );

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

  const wrappedChildren = React.Children.map(children, (child, index) => (
    <TabContext.Provider value={index}>{child}</TabContext.Provider>
  ));

  return (
    <Comp
      data-reach-tab-list=""
      ref={ref}
      role="tablist"
      onKeyDown={handleKeyDown}
      children={wrappedChildren}
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
  { children, as: Comp = "button", ...htmlProps },
  forwardedRef
) {
  const index = useContext(TabContext);
  const { selectedIndex, _onSelectTab, _userInteractedRef, _id } = useContext(
    TabsContext
  );

  const isSelected = index === selectedIndex;

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
      id={makeId("tab", makeId(_id, index))}
      tabIndex={isSelected ? 0 : -1}
      aria-selected={isSelected}
      aria-controls={makeId("panel", makeId(_id, index))}
      data-selected={isSelected ? "" : undefined}
      onClick={() => _onSelectTab(index)}
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
  { children, as: Comp = "div", ...htmlAttrs },
  forwardedRef
) {
  const wrappedChildren = React.Children.map(children, (child, index) => (
    <TabPanelContext.Provider value={index}>{child}</TabPanelContext.Provider>
  ));

  return (
    <Comp
      data-reach-tab-panels=""
      ref={forwardedRef}
      {...htmlAttrs}
      children={wrappedChildren}
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
  { children, as: Comp = "div", ...htmlProps },
  forwardedRef
) {
  const index = useContext(TabPanelContext);
  const { selectedIndex, _selectedPanelRef, _id } = useContext(TabsContext);
  const isSelected = index === selectedIndex;
  const ref = useForkedRef(forwardedRef, isSelected ? _selectedPanelRef : null);

  return (
    <Comp
      data-reach-tab-panel=""
      ref={ref}
      role="tabpanel"
      tabIndex={-1}
      aria-labelledby={makeId("tab", makeId(_id, index))}
      hidden={!isSelected}
      id={makeId("panel", makeId(_id, index))}
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
