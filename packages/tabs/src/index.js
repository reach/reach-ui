import React, { cloneElement, useState, useEffect, useRef } from "react";
import { node, func, number, oneOf } from "prop-types";

////////////////////////////////////////////////////////////////////////////////
// Tabs
const TabsProps = {
  children: node.isRequired,
  onChange: func,
  index: number,
  defaultIndex: number,

  // Auto:
  // - only the active tab is focusable with tab key navigation
  // - arrow keys navigate the tabs and automatically select
  //   the next tab in the list
  // Manual:
  // - all tabs are focusable with tab key navigation
  // - arrow keys do nothing, user must focus an item and select it
  mode: oneOf(["auto", "manual"])
};

export function Tabs({
  children,
  onChange,
  index: controlledIndex = undefined,
  defaultIndex,
  mode = "auto",
  ...props
}) {
  // null checks because index can be 0
  // useRef because you shouldn't switch between controlled/uncontrolled
  let { current: isControlled } = useRef(controlledIndex != null);

  // we only manage focus if the user caused the update vs.
  // a new controlled index coming in
  let userInteractedRef = useRef(false);

  let activePanelRef = useRef(null);

  let [activeIndex, setActiveIndex] = useState(defaultIndex || 0);

  // seems like the type on cloneElement could be better?
  let clones = React.Children.map(children, child =>
    cloneElement(child, {
      activeIndex: isControlled ? controlledIndex : activeIndex,
      mode,
      userInteractedRef,
      activePanelRef,
      onFocusPanel: () =>
        activePanelRef.current && activePanelRef.current.focus(),
      onActivateTab: (index: number) => {
        userInteractedRef.current = true;
        onChange && onChange(index);
        if (!isControlled) {
          setActiveIndex(index);
        }
      }
    })
  );

  return <div data-reach-tabs {...props} children={clones} />;
}

Tabs.propTypes = TabsProps;

////////////////////////////////////////////////////////////////////////////////
// TabList
const TabListProps = {
  children: node
};

export function TabList({ children, ...clonedProps }) {
  let {
    mode,
    activeIndex,
    pendingIndex,
    onActivateTab,
    userInteractedRef,
    onFocusPanel,
    activePanelRef,
    ...htmlProps
  } = clonedProps;

  let clones = React.Children.map(children, (child, index) => {
    return cloneElement(child, {
      mode,
      userInteractedRef,
      isActive: index === activeIndex,
      onActivate: () => onActivateTab(index)
    });
  });

  // TODO: wrap in preventable event
  let handleKeyDown = event => {
    switch (event.key) {
      case "ArrowRight": {
        onActivateTab((activeIndex + 1) % React.Children.count(children));
        break;
      }
      case "ArrowLeft": {
        let count = React.Children.count(children);
        onActivateTab((activeIndex - 1 + count) % count);
        break;
      }
      case "ArrowDown": {
        // don't scroll down
        event.preventDefault();
        onFocusPanel();
        break;
      }
      case "Home": {
        onActivateTab(0);
        break;
      }
      case "End": {
        onActivateTab(React.Children.count(children) - 1);
        break;
      }
      default: {
      }
    }
  };

  return (
    <div
      role="tablist"
      data-reach-tab-list
      onKeyDown={mode === "auto" ? handleKeyDown : undefined}
      children={clones}
      {...htmlProps}
    />
  );
}

TabList.propTypes = TabListProps;

// TODO: move into utils
function useUpdateEffect(effect: () => void, deps: any[]) {
  let mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) {
      effect();
    } else {
      mounted.current = true;
    }
  }, deps);
}

////////////////////////////////////////////////////////////////////////////////
// Tab
const TabProps = {
  children: node
};

export function Tab({ children, ...rest }) {
  let { userInteractedRef, mode, onActivate, isActive, ...htmlProps } = rest;

  // TODO
  let controls = undefined;

  let ref = useRef(null);

  useUpdateEffect(
    () => {
      if (isActive && ref.current && userInteractedRef.current) {
        userInteractedRef.current = false;
        ref.current.focus();
      }
    },
    [isActive]
  );

  return (
    <button
      ref={ref}
      role="tab"
      data-reach-tab
      aria-selected={isActive}
      aria-controls={controls}
      onClick={onActivate}
      tabIndex={mode === "manual" ? undefined : isActive ? 0 : -1}
      children={children}
      {...htmlProps}
    />
  );
}

Tab.propTypes = TabProps;

////////////////////////////////////////////////////////////////////////////////
// TabPanels
const TabPanelsProps = {
  children: node
};

export function TabPanels({ children, ...rest }) {
  let {
    activeIndex,
    activePanelRef,
    mode,
    userInteractedRef,
    onFocusPanel,
    onActivateTab,
    ...htmlAttrs
  } = rest;

  let clones = React.Children.map(children, (child, index) =>
    cloneElement(child, { isActive: index === activeIndex, activePanelRef })
  );

  return <div data-reach-tab-panels {...htmlAttrs} children={clones} />;
}

TabPanels.propTypes = TabPanels;

////////////////////////////////////////////////////////////////////////////////
// TabPanel
const TabPanelProps = {
  children: node
};

export function TabPanel({ children, ...rest }: TabPanelProps) {
  let { isActive, activePanelRef, ...htmlProps } = rest;

  // TODO: should match aria-controls in Tab
  let labelledBy = undefined;

  return (
    <div
      tabIndex={-1}
      ref={isActive ? activePanelRef : undefined}
      role="tabpanel"
      aria-labelledby={labelledBy}
      data-reach-tabpanel
      data-active={isActive ? "true" : undefined}
      hidden={!isActive}
      children={children}
      {...htmlProps}
    />
  );
}
