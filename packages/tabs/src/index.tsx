/**
 * Welcome to @reach/tabs!
 *
 * An accessible tabs component.
 *
 * The `Tab` and `TabPanel` elements are associated by their order in the tree.
 * None of the components are empty wrappers, each is associated with a real DOM
 * element in the document, giving you maximum control over styling and composition.
 *
 * You can render any other elements you want inside of `Tabs`, but `TabList`
 * should only render `Tab` elements, and `TabPanels` should only render
 * `TabPanel` elements.
 *
 * @see Docs     https://reacttraining.com/reach-ui/tabs
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/tabs
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#tabpanel
 */

import React, {
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  Children,
} from "react";
import PropTypes from "prop-types";
import {
  createDescendantContext,
  Descendant,
  DescendantProvider,
  useDescendant,
  useDescendantKeyDown,
  useDescendantsInit,
  useDescendants,
} from "@reach/descendants";
import {
  boolOrBoolString,
  checkStyles,
  cloneValidElement,
  createNamedContext,
  forwardRefWithAs,
  getElementComputedStyle,
  isNumber,
  isFunction,
  makeId,
  memoWithAs,
  noop,
  useControlledSwitchWarning,
  useControlledState,
  useEventCallback,
  useForkedRef,
  useIsomorphicLayoutEffect,
  useUpdateEffect,
  wrapEvent,
} from "@reach/utils";
import { useId } from "@reach/auto-id";

const TabsDescendantsContext = createDescendantContext<TabDescendant>(
  "TabsDescendantsContext"
);

const TabPanelDescendantsContext = createDescendantContext<TabPanelDescendant>(
  "TabPanelDescendantsContext"
);
const TabsContext = createNamedContext(
  "TabsContext",
  {} as InternalTabsContextValue
);

export enum TabsKeyboardActivation {
  Auto = "auto",
  Manual = "manual",
}

export enum TabsOrientation {
  Horizontal = "horizontal",
  Vertical = "vertical",
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Tabs
 *
 * The parent component of the tab interface.
 *
 * @see Docs https://reacttraining.com/reach-ui/tabs#tabs
 */
export const Tabs = forwardRefWithAs<TabsProps, "div">(function Tabs(
  {
    as: Comp = "div",
    children,
    defaultIndex,
    orientation = TabsOrientation.Horizontal,
    index: controlledIndex = undefined,
    keyboardActivation = TabsKeyboardActivation.Auto,
    onChange,
    readOnly = false,
    ...props
  },
  ref
) {
  let isControlled = useRef(controlledIndex != null);
  useControlledSwitchWarning(controlledIndex, "index", "Tabs");

  let _id = useId(props.id);
  let id = props.id ?? makeId("tabs", _id);

  // We only manage focus if the user caused the update vs. a new controlled
  // index coming in.
  let userInteractedRef = useRef(false);

  let selectedPanelRef = useRef<HTMLElement | null>(null);

  let isRTL = useRef(false);

  let [selectedIndex, setSelectedIndex] = useControlledState(
    controlledIndex,
    defaultIndex ?? 0
  );

  let [focusedIndex, setFocusedIndex] = useState(-1);

  let [tabs, setTabs] = useDescendantsInit<TabDescendant>();

  let context: InternalTabsContextValue = useMemo(() => {
    return {
      focusedIndex,
      id,
      isControlled: isControlled.current,
      isRTL,
      keyboardActivation,
      onFocusPanel() {
        selectedPanelRef.current?.focus();
      },
      onSelectTab: readOnly
        ? noop
        : (index: number) => {
            userInteractedRef.current = true;
            onChange && onChange(index);
            setSelectedIndex(index);
          },
      onSelectTabWithKeyboard: readOnly
        ? noop
        : (index: number) => {
            userInteractedRef.current = true;
            switch (keyboardActivation) {
              case TabsKeyboardActivation.Manual:
                tabs[index].element?.focus();
                return;
              case TabsKeyboardActivation.Auto:
              default:
                onChange && onChange(index);
                setSelectedIndex(index);
                return;
            }
          },
      orientation,
      selectedIndex,
      selectedPanelRef,
      setFocusedIndex,
      setSelectedIndex,
      userInteractedRef,
    };
  }, [
    focusedIndex,
    id,
    keyboardActivation,
    onChange,
    orientation,
    readOnly,
    selectedIndex,
    setSelectedIndex,
    tabs,
  ]);

  useEffect(() => checkStyles("tabs"), []);

  return (
    <DescendantProvider
      context={TabsDescendantsContext}
      items={tabs}
      set={setTabs}
    >
      <TabsContext.Provider value={context}>
        <Comp
          {...props}
          ref={ref}
          data-reach-tabs=""
          data-orientation={orientation}
          id={props.id}
        >
          {isFunction(children)
            ? children({ focusedIndex, id, selectedIndex })
            : children}
        </Comp>
      </TabsContext.Provider>
    </DescendantProvider>
  );
});

/**
 * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-props
 */
export type TabsProps = {
  /**
   * Tabs expects `<TabList>` and `<TabPanels>` as children. The order doesn't
   * matter, you can have tabs on the top or the bottom. In fact, you could have
   * tabs on both the bottom and the top at the same time. You can have random
   * elements inside as well.
   *
   * You can also pass a render function to access data relevant to nested
   * components.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-children
   */
  children: React.ReactNode | ((props: TabsContextValue) => React.ReactNode);
  /**
   * Like form inputs, a tab's state can be controlled by the owner. Make sure
   * to include an `onChange` as well, or else the tabs will not be interactive.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-index
   */
  index?: number;
  /**
   * Describes the activation mode when navigating a tablist with a keyboard.
   * When set to `"auto"`, a tab panel is activated automatically when a tab is
   * highlighted using arrow keys. When set to `"manual"`, the user must
   * activate the tab panel with either the `Spacebar` or `Enter` keys. Defaults
   * to `"auto"`.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-keyboardactivation
   */
  keyboardActivation?: TabsKeyboardActivation;
  /**
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-readonly
   */
  readOnly?: boolean;
  /**
   * Starts the tabs at a specific index.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-defaultindex
   */
  defaultIndex?: number;
  /**
   * Allows you to switch the orientation of the tabs relative to their tab
   * panels. This value can either be `"horizontal"`
   * (`TabsOrientation.Horizontal`) or `"vertical"`
   * (`TabsOrientation.Vertical`). Defaults to `"horizontal"`.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-orientation
   * @see MDN  https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties
   */
  orientation?: TabsOrientation;
  /**
   * Calls back with the tab index whenever the user changes tabs, allowing your
   * app to synchronize with it.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-onchange
   */
  onChange?: (index: number) => void;
};

if (__DEV__) {
  Tabs.displayName = "Tabs";
  Tabs.propTypes = {
    children: PropTypes.node.isRequired,
    onChange: PropTypes.func,
    orientation: PropTypes.oneOf(Object.values(TabsOrientation)),
    index: (props, name, compName, location, propName) => {
      let val = props[name];
      if (
        props.index > -1 &&
        props.onChange == null &&
        props.readOnly !== true
      ) {
        return new Error(
          "You provided a value prop to `" +
            compName +
            "` without an `onChange` handler. This will render a read-only tabs element. If the tabs should be mutable use `defaultIndex`. Otherwise, set `onChange`."
        );
      } else if (val != null && !isNumber(val)) {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${compName}\`. Expected \`number\`, received \`${
            Array.isArray(val) ? "array" : typeof val
          }\`.`
        );
      }
      return null;
    },
    defaultIndex: PropTypes.number,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * TabList
 *
 * The parent component of the tabs.
 *
 * @see Docs https://reacttraining.com/reach-ui/tabs#tablist
 */
const TabListImpl = forwardRefWithAs<TabListProps, "div">(function TabList(
  { children, as: Comp = "div", onKeyDown, ...props },
  forwardedRef
) {
  const {
    focusedIndex,
    isControlled,
    isRTL,
    keyboardActivation,
    onSelectTabWithKeyboard,
    orientation,
    selectedIndex,
    setSelectedIndex,
  } = useContext(TabsContext);
  let tabs = useDescendants(TabsDescendantsContext);

  let ownRef = useRef<HTMLElement | null>(null);
  let ref = useForkedRef(forwardedRef, ownRef);

  useEffect(() => {
    if (
      ownRef.current &&
      ((ownRef.current.ownerDocument &&
        ownRef.current.ownerDocument.dir === "rtl") ||
        getElementComputedStyle(ownRef.current, "direction") === "rtl")
    ) {
      isRTL.current = true;
    }
  }, [isRTL]);

  let handleKeyDown = useEventCallback(
    wrapEvent(
      onKeyDown,
      useDescendantKeyDown(TabsDescendantsContext, {
        currentIndex:
          keyboardActivation === TabsKeyboardActivation.Manual
            ? focusedIndex
            : selectedIndex,
        orientation,
        rotate: true,
        callback: onSelectTabWithKeyboard,
        filter: (tab) => !tab.disabled,
        rtl: isRTL.current,
      })
    )
  );

  useIsomorphicLayoutEffect(() => {
    // In the event an uncontrolled component's selected index is disabled,
    // (this should only happen if the first tab is disabled and no default
    // index is set), we need to override the selection to the next selectable
    // index value.
    if (!isControlled && boolOrBoolString(tabs[selectedIndex]?.disabled)) {
      let next = tabs.find((tab) => !tab.disabled);
      if (next) {
        setSelectedIndex(next.index);
      }
    }
  }, [tabs, isControlled, selectedIndex, setSelectedIndex]);

  return (
    <Comp
      // The element that serves as the container for the set of tabs has role
      // `tablist`
      // https://www.w3.org/TR/wai-aria-practices-1.2/#tabpanel
      role="tablist"
      // If the `tablist` element is vertically oriented, it has the property
      // `aria-orientation` set to `"vertical"`. The default value of
      // `aria-orientation` for a tablist element is `"horizontal"`.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#tabpanel
      aria-orientation={orientation}
      {...props}
      data-reach-tab-list=""
      ref={ref}
      onKeyDown={handleKeyDown}
    >
      {Children.map(children, (child, index) => {
        // TODO: Remove in 1.0
        return cloneValidElement(child, {
          isSelected: index === selectedIndex,
        });
      })}
    </Comp>
  );
});

if (__DEV__) {
  TabListImpl.displayName = "TabList";
  TabListImpl.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node,
  };
}

const TabList = memoWithAs(TabListImpl);

/**
 * @see Docs https://reacttraining.com/reach-ui/tabs#tablist-props
 */
export type TabListProps = {
  /**
   * `TabList` expects multiple `Tab` elements as children.
   *
   * `TabPanels` expects multiple `TabPanel` elements as children.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tablist-children
   */
  children?: React.ReactNode;
};

if (__DEV__) {
  TabList.displayName = "TabList";
}

export { TabList };

////////////////////////////////////////////////////////////////////////////////

/**
 * Tab
 *
 * The interactive element that changes the selected panel.
 *
 * @see Docs https://reacttraining.com/reach-ui/tabs#tab
 */
export const Tab = forwardRefWithAs<
  // TODO: Remove this when cloneElement is removed
  TabProps & { isSelected?: boolean },
  "button"
>(function Tab(
  {
    children,
    isSelected: _,
    as: Comp = "button",
    index: indexProp,
    disabled,
    onBlur,
    onFocus,
    ...props
  },
  forwardedRef
) {
  const {
    id: tabsId,
    onSelectTab,
    orientation,
    selectedIndex,
    userInteractedRef,
    setFocusedIndex,
  } = useContext(TabsContext);
  const ownRef = useRef<HTMLElement | null>(null);
  const ref = useForkedRef(forwardedRef, ownRef);
  const index = useDescendant(
    {
      element: ownRef.current!,
      disabled: !!disabled,
    },
    TabsDescendantsContext,
    indexProp
  );
  const htmlType =
    Comp === "button" && props.type == null ? "button" : props.type;

  const isSelected = index === selectedIndex;

  function onSelect() {
    onSelectTab(index);
  }

  useUpdateEffect(() => {
    if (isSelected && ownRef.current && userInteractedRef.current) {
      userInteractedRef.current = false;
      ownRef.current.focus();
    }
  }, [isSelected, userInteractedRef]);

  let handleFocus = useEventCallback(
    wrapEvent(onFocus, () => {
      setFocusedIndex(index);
    })
  );

  let handleBlur = useEventCallback(
    wrapEvent(onFocus, () => {
      setFocusedIndex(-1);
    })
  );

  return (
    <Comp
      // Each element with role `tab` has the property `aria-controls` referring
      // to its associated `tabpanel` element.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#tabpanel
      aria-controls={makeId(tabsId, "panel", index)}
      aria-disabled={disabled}
      // The active tab element has the state `aria-selected` set to `true` and
      // all other tab elements have it set to `false`.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#tabpanel
      aria-selected={isSelected}
      // Each element that serves as a tab has role `tab` and is contained
      // within the element with role `tablist`.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#tabpanel
      role="tab"
      tabIndex={isSelected ? 0 : -1}
      {...props}
      ref={ref}
      data-reach-tab=""
      data-orientation={orientation}
      data-selected={isSelected ? "" : undefined}
      disabled={disabled}
      id={makeId(tabsId, "tab", index)}
      onClick={onSelect}
      onFocus={handleFocus}
      onBlur={handleBlur}
      type={htmlType}
    >
      {children}
    </Comp>
  );
});

/**
 * @see Docs https://reacttraining.com/reach-ui/tabs#tab-props
 */
export type TabProps = {
  /**
   * `Tab` can receive any type of children.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tab-children
   */
  children?: React.ReactNode;
  /**
   * Disables a tab when true. Clicking will not work and keyboard navigation
   * will skip over it.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tab-disabled
   */
  disabled?: boolean;
  index?: number;
};

if (__DEV__) {
  Tab.displayName = "Tab";
  Tab.propTypes = {
    children: PropTypes.node,
    disabled: PropTypes.bool,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * TabPanels
 *
 * The parent component of the panels.
 *
 * @see Docs https://reacttraining.com/reach-ui/tabs#tabpanels
 */
const TabPanelsImpl = forwardRefWithAs<TabPanelsProps, "div">(
  function TabPanels({ children, as: Comp = "div", ...props }, forwardedRef) {
    let ownRef = useRef();
    let ref = useForkedRef(ownRef, forwardedRef);
    let [tabPanels, setTabPanels] = useDescendantsInit<TabPanelDescendant>();

    return (
      <DescendantProvider
        context={TabPanelDescendantsContext}
        items={tabPanels}
        set={setTabPanels}
      >
        <Comp {...props} ref={ref} data-reach-tab-panels="">
          {children}
        </Comp>
      </DescendantProvider>
    );
  }
);

if (__DEV__) {
  TabPanelsImpl.displayName = "TabPanels";
  TabPanelsImpl.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node,
  };
}

const TabPanels = memoWithAs(TabPanelsImpl);

/**
 * @see Docs https://reacttraining.com/reach-ui/tabs#tabpanels-props
 */
export type TabPanelsProps = TabListProps & {};

if (__DEV__) {
  TabPanels.displayName = "TabPanels";
}

export { TabPanels };

////////////////////////////////////////////////////////////////////////////////

/**
 * TabPanel
 *
 * The panel that displays when it's corresponding tab is active.
 *
 * @see Docs https://reacttraining.com/reach-ui/tabs#tabpanel
 */
export const TabPanel = forwardRefWithAs<TabPanelProps, "div">(
  function TabPanel(
    { children, "aria-label": ariaLabel, as: Comp = "div", ...props },
    forwardedRef
  ) {
    let { selectedPanelRef, selectedIndex, id: tabsId } = useContext(
      TabsContext
    );
    let ownRef = useRef<HTMLElement | null>(null);

    let index = useDescendant(
      { element: ownRef.current! },
      TabPanelDescendantsContext
    );
    let isSelected = index === selectedIndex;

    let id = makeId(tabsId, "panel", index);

    let ref = useForkedRef(
      forwardedRef,
      ownRef,
      isSelected ? selectedPanelRef : null
    );

    return (
      <Comp
        // Each element with role `tabpanel` has the property `aria-labelledby`
        // referring to its associated tab element.
        aria-labelledby={makeId(tabsId, "tab", index)}
        hidden={!isSelected}
        // Each element that contains the content panel for a tab has role
        // `tabpanel`.
        // https://www.w3.org/TR/wai-aria-practices-1.2/#tabpanel
        role="tabpanel"
        tabIndex={isSelected ? 0 : -1}
        {...props}
        ref={ref}
        data-reach-tab-panel=""
        id={id}
      >
        {children}
      </Comp>
    );
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/tabs#tabpanel-props
 */
export type TabPanelProps = {
  /**
   * `TabPanel` can receive any type of children.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabpanel-children
   */
  children?: React.ReactNode;
};

if (__DEV__) {
  TabPanel.displayName = "TabPanel";
  TabPanel.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * A hook that exposes data for a given `Tabs` component to its descendants.
 *
 * @see Docs https://reacttraining.com/reach-ui/tabs#usetabscontext
 */
export function useTabsContext(): TabsContextValue {
  let { focusedIndex, id, selectedIndex } = useContext(TabsContext);
  return useMemo(
    () => ({
      focusedIndex,
      id,
      selectedIndex,
    }),
    [focusedIndex, id, selectedIndex]
  );
}

////////////////////////////////////////////////////////////////////////////////
// Types

type TabDescendant = Descendant<HTMLElement> & {
  disabled: boolean;
};

type TabPanelDescendant = Descendant<HTMLElement>;

export type TabsContextValue = {
  focusedIndex: number;
  id: string;
  selectedIndex: number;
};

type InternalTabsContextValue = {
  focusedIndex: number;
  id: string;
  isControlled: boolean;
  isRTL: React.MutableRefObject<boolean>;
  keyboardActivation: TabsKeyboardActivation;
  onFocusPanel: () => void;
  onSelectTab: (index: number) => void;
  onSelectTabWithKeyboard: (index: number) => void;
  orientation: TabsOrientation;
  selectedIndex: number;
  selectedPanelRef: React.MutableRefObject<HTMLElement | null>;
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  userInteractedRef: React.MutableRefObject<boolean>;
};
