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
 * @see Docs     https://reacttraining.com/reach-ui/tabs
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/tabs
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#tabpanel
 */

import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  Children,
} from "react";
import PropTypes from "prop-types";
import warning from "warning";
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
  useForkedRef,
  useIsomorphicLayoutEffect,
  useUpdateEffect,
  wrapEvent,
} from "@reach/utils";
import { useId } from "@reach/auto-id";

interface ITabsContext {
  id: string;
  isControlled: boolean;
  orientation?: "vertical" | "horizontal";
  listBeforePanels: boolean;
  onFocusPanel: () => void;
  onSelectTab: (index: number) => void;
  selectedIndex: number;
  selectedPanelRef: React.MutableRefObject<HTMLElement | null>;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  userInteractedRef: React.MutableRefObject<boolean>;
}

const TabsDescendantsContext = createDescendantContext<
  HTMLElement,
  TabDescendantProps
>("TabsDescendantsContext");

const TabPanelDescendantsContext = createDescendantContext<HTMLElement>(
  "TabPanelDescendantsContext"
);
const TabsContext = createNamedContext("TabsContext", {} as ITabsContext);
const useTabsContext = () => useContext(TabsContext);

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
    orientation = "horizontal",
    index: controlledIndex = undefined,
    onChange,
    readOnly = false,
    ...props
  },
  ref
) {
  let isControlled = useRef(controlledIndex != null);
  useEffect(() => {
    if (__DEV__) {
      warning(
        !(isControlled.current && controlledIndex == null),
        "Tabs is changing from controlled to uncontrolled. Tabs should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled Tabs for the lifetime of the component. Check the `index` prop being passed in."
      );
      warning(
        !(!isControlled.current && controlledIndex != null),
        "Tabs is changing from uncontrolled to controlled. Tabs should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled Tabs for the lifetime of the component. Check the `index` prop being passed in."
      );
    }
  }, [controlledIndex]);

  let _id = useId(props.id);
  let id = props.id ?? makeId("tabs", _id);

  const childrenArray = React.Children.toArray(children);
  const indexOfTabPanels = childrenArray.findIndex(
    child => React.isValidElement(child) && child.type === TabPanels
  );
  const indexOfTabList = childrenArray.findIndex(
    child => React.isValidElement(child) && child.type === TabList
  );
  const listBeforePanels =
    indexOfTabList > -1 &&
    indexOfTabPanels > -1 &&
    indexOfTabList < indexOfTabPanels;

  /*
   * We only manage focus if the user caused the update vs. a new controlled
   * index coming in.
   */
  let userInteractedRef = useRef(false);

  let selectedPanelRef = useRef<HTMLElement | null>(null);
  let [selectedIndex, setSelectedIndex] = useState(defaultIndex || 0);
  let [tabs, setTabs] = useDescendants<HTMLElement, TabDescendantProps>();

  const context: ITabsContext = useMemo(() => {
    return {
      isControlled: isControlled.current,
      selectedIndex: isControlled.current
        ? (controlledIndex as number)
        : selectedIndex,
      orientation,
      listBeforePanels,
      id,
      userInteractedRef,
      selectedPanelRef,
      setSelectedIndex: isControlled.current ? noop : setSelectedIndex,
      onFocusPanel: () => {
        selectedPanelRef.current?.focus();
      },
      onSelectTab: readOnly
        ? noop
        : (index: number) => {
            userInteractedRef.current = true;
            onChange && onChange(index);
            if (!isControlled.current) {
              setSelectedIndex(index);
            }
          },
    };
  }, [
    controlledIndex,
    orientation,
    listBeforePanels,
    id,
    onChange,
    readOnly,
    selectedIndex,
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
          id={props.id}
          data-reach-tabs-orientation={orientation}
        >
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
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-props
   */
  children: React.ReactNode;
  /**
   * Like form inputs, a tab's state can be controlled by the owner. Make sure
   * to include an `onChange` as well, or else the tabs will not be interactive.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-props
   */
  index?: number;
  /**
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-props
   */
  readOnly?: boolean;
  /**
   * Starts the tabs at a specific index.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-props
   */
  defaultIndex?: number;
  /**
   * Allows you to switch between horizontally-oriented and vertically-oriented
   * tabs. Defaults to `horizontal`.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-props
   */
  orientation?: "vertical" | "horizontal";
  /**
   * Calls back with the tab index whenever the user changes tabs, allowing your
   * app to synchronize with it.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-props
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
export const TabList = forwardRefWithAs<TabListProps, "div">(function TabList(
  { children, as: Comp = "div", onKeyDown, ...props },
  forwardedRef
) {
  const {
    isControlled,
    onSelectTab,
    onFocusPanel,
    setSelectedIndex,
    selectedIndex,
    orientation,
    listBeforePanels,
  } = useTabsContext();

  let { descendants } = useContext(TabsDescendantsContext);
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

  let handleKeyDown = wrapEvent(
    function(event: React.KeyboardEvent) {
      let keyToMatch;

      if (orientation === "vertical") {
        if (isRTL.current) {
          keyToMatch = listBeforePanels ? "ArrowLeft" : "ArrowRight";
        } else {
          keyToMatch = listBeforePanels ? "ArrowRight" : "ArrowLeft";
        }
      } else {
        keyToMatch = listBeforePanels ? "ArrowDown" : "ArrowUp";
      }

      if (event.key === keyToMatch) {
        event.preventDefault();
        onFocusPanel();
      }
    },
    useDescendantKeyDown(TabsDescendantsContext, {
      currentIndex: selectedIndex,
      orientation,
      rotate: true,
      callback: onSelectTab,
      filter: tab => !tab.disabled,
      rtl: isRTL.current,
    })
  );

  useIsomorphicLayoutEffect(() => {
    /*
     * In the event an uncontrolled component's selected index is disabled,
     * (this should only happen if the first tab is disabled and no default
     * index is set), we need to override the selection to the next selectable
     * index value.
     */
    if (
      !isControlled &&
      boolOrBoolString(descendants[selectedIndex]?.disabled)
    ) {
      let next = descendants.find(tab => !tab.disabled);
      if (next) {
        setSelectedIndex(next.index);
      }
    }
  }, [descendants, isControlled, selectedIndex, setSelectedIndex]);

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
      aria-orientation={orientation}
      ref={ref}
      onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
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
  TabList.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node,
  };
}

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
  { children, isSelected: _, as: Comp = "button", disabled, ...props },
  forwardedRef
) {
  const {
    id: tabsId,
    onSelectTab,
    selectedIndex,
    userInteractedRef,
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
export const TabPanels = forwardRefWithAs<TabPanelsProps, "div">(
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

/**
 * @see Docs https://reacttraining.com/reach-ui/tabs#tabpanels-props
 */
export type TabPanelsProps = TabListProps & {};

if (__DEV__) {
  TabPanels.displayName = "TabPanels";
  TabPanels.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node,
  };
}

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
