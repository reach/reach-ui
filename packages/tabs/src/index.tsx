/**
 * Welcom to @reach/tabs!
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
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#tabs
 */

import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  Children
} from "react";
import PropTypes from "prop-types";
import warning from "warning";
import {
  checkStyles,
  cloneValidElement,
  createNamedContext,
  DescendantProvider,
  forwardRefWithAs,
  IDescendantContext,
  makeId,
  noop,
  useDescendant,
  useDescendantContext,
  useDescendants,
  useForkedRef,
  useUpdateEffect,
  wrapEvent
} from "@reach/utils";
import { useId } from "@reach/auto-id";

interface ITabsContext {
  selectedIndex: number;
  id: string;
  userInteractedRef: React.MutableRefObject<boolean>;
  selectedPanelRef: React.MutableRefObject<HTMLElement | null>;
  onFocusPanel: () => void;
  onSelectTab: (index: number) => void;
}

const TabsDescendantsContext = createNamedContext(
  "TabsDescendantsContext",
  {} as IDescendantContext<any>
);

const TabPanelDescendantsContext = createNamedContext(
  "TabPanelDescendantsContext",
  {} as IDescendantContext<any>
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
export const Tabs = forwardRefWithAs<"div", TabsProps>(function Tabs(
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

  let id = useId(props.id);

  // we only manage focus if the user caused the update vs.
  // a new controlled index coming in
  let userInteractedRef = useRef(false);

  let selectedPanelRef = useRef<HTMLElement | null>(null);

  let [selectedIndex, setSelectedIndex] = useState(defaultIndex || 0);
  let [tabs, setTabs] = useDescendants();

  const context: ITabsContext = useMemo(() => {
    return {
      selectedIndex: isControlled ? (controlledIndex as number) : selectedIndex,
      id: props.id ?? (id ? makeId("tabs", id) : "tabs"),
      userInteractedRef,
      selectedPanelRef,
      onFocusPanel: () => {
        selectedPanelRef.current?.focus();
      },
      onSelectTab: readOnly
        ? noop
        : (index: number) => {
            userInteractedRef.current = true;
            onChange && onChange(index);
            if (!isControlled) {
              setSelectedIndex(index);
            }
          }
    };
  }, [
    controlledIndex,
    id,
    isControlled,
    onChange,
    props.id,
    readOnly,
    selectedIndex
  ]);

  useEffect(() => checkStyles("tabs"), []);

  return (
    <DescendantProvider
      context={TabsDescendantsContext}
      descendants={tabs}
      setDescendants={setTabs}
    >
      <TabsContext.Provider value={context}>
        <Comp data-reach-tabs="" ref={ref} {...props}>
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
   * Calls back with the tab index whenever the user changes tabs, allowing your
   * app to synchronize with it.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-props
   */
  onChange?: (index: number) => void;
};

Tabs.displayName = "Tabs";
if (__DEV__) {
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
      } else if (props[name] != null && typeof props[name] !== "number") {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${compName}\`. Expected \`number\`, received \`${
            Array.isArray(val) ? "array" : typeof val
          }\`.`
        );
      }
      return null;
    },
    defaultIndex: PropTypes.number
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
export const TabList = forwardRefWithAs<"div", TabListProps>(function TabList(
  { children, as: Comp = "div", onKeyDown, ...props },
  ref
) {
  const {
    // id: tabsId,
    onSelectTab,
    onFocusPanel,
    selectedIndex
  } = useTabsContext();

  const { focusNodes, descendants } = useDescendantContext<HTMLElement>(
    TabsDescendantsContext
  );

  const handleKeyDown = wrapEvent(onKeyDown, event => {
    const { key } = event;

    // Bail if we aren't moving focus
    if (
      !(
        key === "ArrowLeft" ||
        key === "ArrowRight" ||
        key === "ArrowDown" ||
        key === "Home" ||
        key === "End"
      )
    ) {
      return;
    }

    let selectedFocusIndex = focusNodes.findIndex(
      element => element === descendants[selectedIndex].element
    );
    let firstIndex = descendants.findIndex(
      ({ element }) => element === focusNodes[0]
    );
    let lastIndex = descendants.findIndex(
      ({ element }) => element === focusNodes[focusNodes.length - 1]
    );

    switch (key) {
      case "ArrowRight":
        let nextIndex = descendants.findIndex(
          ({ element }) => element === focusNodes[selectedFocusIndex + 1]
        );
        onSelectTab(nextIndex >= 0 ? nextIndex : firstIndex);
        break;
      case "ArrowLeft":
        let prevIndex = descendants.findIndex(
          ({ element }) => element === focusNodes[selectedFocusIndex - 1]
        );
        onSelectTab(prevIndex >= 0 ? prevIndex : lastIndex);
        break;
      case "ArrowDown":
        // don't scroll down
        event.preventDefault();
        onFocusPanel();
        break;
      case "Home":
        onSelectTab(firstIndex);
        break;
      case "End":
        onSelectTab(lastIndex);
        break;
      default:
        return;
    }
  });

  return (
    <Comp
      data-reach-tab-list=""
      ref={ref}
      role="tablist"
      onKeyDown={handleKeyDown}
      {...props}
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
          isSelected: index === selectedIndex
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

TabList.displayName = "TabList";
if (__DEV__) {
  TabList.propTypes = {
    as: PropTypes.elementType,
    children: PropTypes.node
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
export const Tab = forwardRefWithAs<"button", TabProps>(function Tab(
  { children, as: Comp = "button", disabled, ...props },
  forwardedRef
) {
  const {
    id: tabsId,
    onSelectTab,
    selectedIndex,
    userInteractedRef
  } = useTabsContext();
  const ownRef = useRef<HTMLElement | null>(null);
  const ref = useForkedRef(forwardedRef, ownRef);
  const index = useDescendant({
    element: ownRef.current,
    context: TabsDescendantsContext,
    disabled
  });

  const isSelected = index === selectedIndex;
  function onSelect() {
    onSelectTab(index);
  }

  const htmlType =
    Comp === "button" && props.type == null ? "button" : props.type;

  useUpdateEffect(() => {
    if (isSelected && ownRef.current && userInteractedRef.current) {
      userInteractedRef.current = false;
      ownRef.current.focus();
    }
  }, [isSelected]);

  return (
    <Comp
      {...props}
      data-reach-tab=""
      ref={ref}
      aria-controls={makeId("panel", tabsId, index)}
      aria-disabled={Comp !== "button" ? disabled : undefined}
      aria-selected={isSelected}
      data-selected={isSelected ? "" : undefined}
      disabled={disabled}
      id={makeId("tab", tabsId, index)}
      onClick={onSelect}
      role="tab"
      tabIndex={isSelected ? 0 : -1}
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
  disabled?: boolean;
} & TabPanelProps;

Tab.displayName = "Tab";
if (__DEV__) {
  Tab.propTypes = {
    children: PropTypes.node,
    disabled: PropTypes.bool
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
export const TabPanels = forwardRefWithAs<"div", TabPanelsProps>(
  function TabPanels({ children, as: Comp = "div", ...props }, forwardedRef) {
    let [tabPanels, setTabPanels] = useDescendants();
    return (
      <DescendantProvider
        context={TabPanelDescendantsContext}
        descendants={tabPanels}
        setDescendants={setTabPanels}
      >
        <Comp data-reach-tab-panels="" ref={forwardedRef} {...props}>
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

TabPanels.displayName = "TabPanels";
if (__DEV__) {
  TabPanels.propTypes = {
    as: PropTypes.elementType,
    children: PropTypes.node,
    selectedIndex: PropTypes.number
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
export const TabPanel = forwardRefWithAs<"div", TabPanelProps>(
  function TabPanel({ children, as: Comp = "div", ...props }, forwardedRef) {
    const { selectedPanelRef, selectedIndex, id: tabsId } = useTabsContext();
    let ownRef = useRef<HTMLElement | null>(null);

    const index = useDescendant({
      element: ownRef.current,
      context: TabPanelDescendantsContext
    });
    let isSelected = index === selectedIndex;

    let id = makeId("panel", tabsId, index);

    const ref = useForkedRef(
      forwardedRef,
      ownRef,
      isSelected ? selectedPanelRef : null
    );

    return (
      <Comp
        data-reach-tab-panel=""
        ref={ref}
        role="tabpanel"
        tabIndex={-1}
        aria-labelledby={makeId("tab", tabsId, index)}
        hidden={!isSelected}
        id={id}
        children={children}
        {...props}
      />
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

TabPanel.displayName = "TabPanel";
if (__DEV__) {
  TabPanel.propTypes = {
    as: PropTypes.elementType,
    children: PropTypes.node
  };
}
