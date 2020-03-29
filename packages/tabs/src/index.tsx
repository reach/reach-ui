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
 * TODO: Consider manual tab activation
 * https://www.w3.org/TR/wai-aria-practices-1.2/examples/tabs/tabs-2/tabs.html
 *
 *
 * TODO: Consider `orientation` prop to account for keyboard behavior
 *       - horizontal-top
 *       - horizontal-bottm
 *       - vertical-left
 *       - vertical-right
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
  DescendantProvider,
  useDescendant,
  useDescendantKeyDown,
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
  makeId,
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

const TabsDescendantsContext = createDescendantContext<
  HTMLElement,
  TabDescendantProps
>("TabsDescendantsContext");

const TabPanelDescendantsContext = createDescendantContext<HTMLElement>(
  "TabPanelDescendantsContext"
);
const TabsContext = createNamedContext("TabsContext", {} as TabsContextValue);
const useTabsContext = () => useContext(TabsContext);

export enum KeyboardActivation {
  Auto = "auto",
  Manual = "manual",
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
    index: controlledIndex = undefined,
    keyboardActivation = KeyboardActivation.Auto,
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

  /*
   * We only manage focus if the user caused the update vs. a new controlled
   * index coming in.
   */
  let userInteractedRef = useRef(false);

  let selectedPanelRef = useRef<HTMLElement | null>(null);

  let [selectedIndex, setSelectedIndex] = useControlledState(
    controlledIndex,
    defaultIndex ?? 0
  );

  let [focusedIndex, setFocusedIndex] = useState(-1);
  let [tabs, setTabs] = useDescendants<HTMLElement, TabDescendantProps>();

  let context: TabsContextValue = useMemo(() => {
    return {
      focusedIndex,
      id,
      isControlled: isControlled.current,
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
              case KeyboardActivation.Manual:
                tabs[index].element?.focus();
                return;
              case KeyboardActivation.Auto:
              default:
                onChange && onChange(index);
                setSelectedIndex(index);
                return;
            }
          },
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
        <Comp {...props} ref={ref} data-reach-tabs="" id={props.id}>
          {children}
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
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-children
   */
  children: React.ReactNode;
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
  keyboardActivation?: KeyboardActivation;
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
      } else if (props[name] != null && !isNumber(props[name])) {
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
    keyboardActivation,
    onFocusPanel,
    onSelectTabWithKeyboard,
    selectedIndex,
    setSelectedIndex,
  } = useTabsContext();

  let { descendants: tabs } = useContext(TabsDescendantsContext);
  let ownRef = useRef<HTMLElement | null>(null);
  let ref = useForkedRef(forwardedRef, ownRef);
  let isRTL = useRef(false);

  useEffect(() => {
    if (
      ownRef.current &&
      ((ownRef.current.ownerDocument &&
        ownRef.current.ownerDocument.dir === "rtl") ||
        getElementComputedStyle(ownRef.current, "direction") === "rtl")
    ) {
      isRTL.current = true;
    }
  }, []);

  let handleKeyDown = useEventCallback(
    wrapEvent(
      function(event: React.KeyboardEvent) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          onFocusPanel();
        }
      },
      useDescendantKeyDown(TabsDescendantsContext, {
        currentIndex:
          keyboardActivation === KeyboardActivation.Manual
            ? focusedIndex
            : selectedIndex,
        orientation: "horizontal",
        rotate: true,
        callback: onSelectTabWithKeyboard,
        filter: tab => !tab.disabled,
        rtl: isRTL.current,
      })
    )
  );

  useIsomorphicLayoutEffect(() => {
    /*
     * In the event an uncontrolled component's selected index is disabled,
     * (this should only happen if the first tab is disabled and no default
     * index is set), we need to override the selection to the next selectable
     * index value.
     */
    if (!isControlled && boolOrBoolString(tabs[selectedIndex]?.disabled)) {
      let next = tabs.find(tab => !tab.disabled);
      if (next) {
        setSelectedIndex(next.index);
      }
    }
  }, [tabs, isControlled, selectedIndex, setSelectedIndex]);

  return (
    <Comp
      // If the `tablist` element is vertically oriented, it has the property
      // `aria-orientation` set to `"vertical"`. The default value of
      // `aria-orientation` for a tablist element is `"horizontal"`.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#tabpanel
      // aria-orientation={vertical ? "vertical" : undefined}

      // The element that serves as the container for the set of tabs has role
      // `tablist`
      // https://www.w3.org/TR/wai-aria-practices-1.2/#tabpanel
      role="tablist"
      {...props}
      data-reach-tab-list=""
      ref={ref}
      onKeyDown={handleKeyDown}
    >
      {Children.map(children, (child, index) => {
        /*
         * TODO: Since refactoring to use context rather than depending on
         * parent/child relationships, we need to update our recommendations for
         * animations that break when we don't forward the `isSelected` prop
         * to our tabs. We will remove this in 1.0 and update our docs
         * accordingly.
         */
        return cloneValidElement(child, {
          isSelected: index === selectedIndex,
        });
      })}
    </Comp>
  );
});

const TabList = memo(TabListImpl);

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
  TabListImpl.displayName = "TabList";
  TabListImpl.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node,
  };
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
    selectedIndex,
    userInteractedRef,
    setFocusedIndex,
  } = useTabsContext();
  const ownRef = useRef<HTMLElement | null>(null);
  const ref = useForkedRef(forwardedRef, ownRef);
  const index = useDescendant({
    element: ownRef.current!,
    context: TabsDescendantsContext,
    disabled: !!disabled,
  });

  const isSelected = index === selectedIndex;

  function onSelect() {
    onSelectTab(index);
  }

  useUpdateEffect(() => {
    if (isSelected && ownRef.current && userInteractedRef.current) {
      userInteractedRef.current = false;
      ownRef.current.focus();
    }
  }, [isSelected]);

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
      data-selected={isSelected ? "" : undefined}
      disabled={disabled}
      id={makeId(tabsId, "tab", index)}
      onClick={onSelect}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
    </Comp>
  );
});

/**
 * @see Docs https://reacttraining.com/reach-ui/tabs#tab-props
 */
export type TabProps = {
  disabled?: boolean;
} & TabPanelProps;

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
    let [tabPanels, setTabPanels] = useDescendants<HTMLElement>();
    return (
      <DescendantProvider
        context={TabPanelDescendantsContext}
        items={tabPanels}
        set={setTabPanels}
      >
        <Comp {...props} ref={forwardedRef} data-reach-tab-panels="">
          {children}
        </Comp>
      </DescendantProvider>
    );
  }
);

const TabPanels = memo(TabPanelsImpl);

/**
 * @see Docs https://reacttraining.com/reach-ui/tabs#tabpanels-props
 */
export type TabPanelsProps = TabListProps & {};

if (__DEV__) {
  TabPanels.displayName = "TabPanels";
  TabPanelsImpl.displayName = "TabPanels";
  TabPanelsImpl.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node,
  };
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
    let { selectedPanelRef, selectedIndex, id: tabsId } = useTabsContext();
    let ownRef = useRef<HTMLElement | null>(null);

    let index = useDescendant({
      element: ownRef.current!,
      context: TabPanelDescendantsContext,
    });
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
// Types

type TabDescendantProps = {
  disabled: boolean;
};

interface TabsContextValue {
  id: string;
  isControlled: boolean;
  keyboardActivation: KeyboardActivation;
  onFocusPanel: () => void;
  onSelectTabWithKeyboard: (index: number) => void;
  onSelectTab: (index: number) => void;
  focusedIndex: number;
  selectedIndex: number;
  selectedPanelRef: React.MutableRefObject<HTMLElement | null>;
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  userInteractedRef: React.MutableRefObject<boolean>;
}
