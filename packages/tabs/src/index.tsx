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
 * @see Docs     https://reach.tech/tabs
 * @see Source   https://github.com/reach/reach-ui/tree/main/packages/tabs
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#tabpanel
 */

import * as React from "react";
import PropTypes from "prop-types";
import {
  createDescendantContext,
  DescendantProvider,
  useDescendant,
  useDescendantKeyDown,
  useDescendantsInit,
  useDescendants,
} from "@reach/descendants";
import { getComputedStyle } from "@reach/utils/computed-styles";
import { cloneValidElement } from "@reach/utils/clone-valid-element";
import { useControlledState } from "@reach/utils/use-controlled-state";
import { useStatefulRefValue } from "@reach/utils/use-stateful-ref-value";
import { useIsomorphicLayoutEffect as useLayoutEffect } from "@reach/utils/use-isomorphic-layout-effect";
import { createNamedContext } from "@reach/utils/context";
import { isBoolean, isNumber, isFunction } from "@reach/utils/type-check";
import { makeId } from "@reach/utils/make-id";
import { noop } from "@reach/utils/noop";
import {
  useCheckStyles,
  useControlledSwitchWarning,
} from "@reach/utils/dev-utils";
import { useComposedRefs } from "@reach/utils/compose-refs";
import { useUpdateEffect } from "@reach/utils/use-update-effect";
import { composeEventHandlers } from "@reach/utils/compose-event-handlers";
import { useId } from "@reach/auto-id";

import type { Descendant } from "@reach/descendants";
import type * as Polymorphic from "@reach/utils/polymorphic";

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

enum TabsKeyboardActivation {
  Auto = "auto",
  Manual = "manual",
}

enum TabsOrientation {
  Horizontal = "horizontal",
  Vertical = "vertical",
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Tabs
 *
 * The parent component of the tab interface.
 *
 * @see Docs https://reach.tech/tabs#tabs
 */
const Tabs = React.forwardRef(
  (
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
  ) => {
    let isControlled = React.useRef(controlledIndex != null);
    useControlledSwitchWarning(controlledIndex, "index", "Tabs");

    let _id = useId(props.id);
    let id = props.id ?? makeId("tabs", _id);

    // We only manage focus if the user caused the update vs. a new controlled
    // index coming in.
    let userInteractedRef = React.useRef(false);

    let selectedPanelRef = React.useRef<HTMLElement | null>(null);

    let isRTL = React.useRef(false);

    let [selectedIndex, setSelectedIndex] = useControlledState(
      controlledIndex,
      defaultIndex ?? 0
    );

    let [focusedIndex, setFocusedIndex] = React.useState(-1);

    let [tabs, setTabs] = useDescendantsInit<TabDescendant>();

    let context: InternalTabsContextValue = React.useMemo(() => {
      return {
        focusedIndex,
        id,
        isControlled: isControlled.current,
        isRTL,
        keyboardActivation,
        onFocusPanel() {
          if (
            selectedPanelRef.current &&
            isFunction(selectedPanelRef.current.focus)
          ) {
            selectedPanelRef.current.focus();
          }
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
                  let tabElement = tabs[index]?.element;
                  if (tabElement && isFunction(tabElement.focus)) {
                    tabElement.focus();
                  }
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

    useCheckStyles("tabs");

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
  }
) as Polymorphic.ForwardRefComponent<"div", TabsProps>;

/**
 * @see Docs https://reach.tech/tabs#tabs-props
 */
interface TabsProps {
  /**
   * Tabs expects `<TabList>` and `<TabPanels>` as children. The order doesn't
   * matter, you can have tabs on the top or the bottom. In fact, you could have
   * tabs on both the bottom and the top at the same time. You can have random
   * elements inside as well.
   *
   * You can also pass a render function to access data relevant to nested
   * components.
   *
   * @see Docs https://reach.tech/tabs#tabs-children
   */
  children: React.ReactNode | ((props: TabsContextValue) => React.ReactNode);
  /**
   * Like form inputs, a tab's state can be controlled by the owner. Make sure
   * to include an `onChange` as well, or else the tabs will not be interactive.
   *
   * @see Docs https://reach.tech/tabs#tabs-index
   */
  index?: number;
  /**
   * Describes the activation mode when navigating a tablist with a keyboard.
   * When set to `"auto"`, a tab panel is activated automatically when a tab is
   * highlighted using arrow keys. When set to `"manual"`, the user must
   * activate the tab panel with either the `Spacebar` or `Enter` keys. Defaults
   * to `"auto"`.
   *
   * @see Docs https://reach.tech/tabs#tabs-keyboardactivation
   */
  keyboardActivation?: TabsKeyboardActivation;
  /**
   * @see Docs https://reach.tech/tabs#tabs-readonly
   */
  readOnly?: boolean;
  /**
   * Starts the tabs at a specific index.
   *
   * @see Docs https://reach.tech/tabs#tabs-defaultindex
   */
  defaultIndex?: number;
  /**
   * Allows you to switch the orientation of the tabs relative to their tab
   * panels. This value can either be `"horizontal"`
   * (`TabsOrientation.Horizontal`) or `"vertical"`
   * (`TabsOrientation.Vertical`). Defaults to `"horizontal"`.
   *
   * @see Docs https://reach.tech/tabs#tabs-orientation
   * @see MDN  https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties
   */
  orientation?: TabsOrientation;
  /**
   * Calls back with the tab index whenever the user changes tabs, allowing your
   * app to synchronize with it.
   *
   * @see Docs https://reach.tech/tabs#tabs-onchange
   */
  onChange?: (index: number) => void;
}

if (__DEV__) {
  Tabs.displayName = "Tabs";
  Tabs.propTypes = {
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
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
 * @see Docs https://reach.tech/tabs#tablist
 */
const TabListImpl = React.forwardRef(
  ({ children, as: Comp = "div", onKeyDown, ...props }, forwardedRef) => {
    let {
      focusedIndex,
      isControlled,
      isRTL,
      keyboardActivation,
      onSelectTabWithKeyboard,
      orientation,
      selectedIndex,
      setSelectedIndex,
    } = React.useContext(TabsContext);
    let tabs = useDescendants(TabsDescendantsContext);

    let ownRef = React.useRef<HTMLElement | null>(null);
    let ref = useComposedRefs(forwardedRef, ownRef);

    React.useEffect(() => {
      if (
        ownRef.current &&
        ((ownRef.current.ownerDocument &&
          ownRef.current.ownerDocument.dir === "rtl") ||
          getComputedStyle(ownRef.current, "direction") === "rtl")
      ) {
        isRTL.current = true;
      }
    }, [isRTL]);

    let handleKeyDown = composeEventHandlers(
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
    );

    useLayoutEffect(() => {
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
        {React.Children.map(children, (child, index) => {
          // TODO: Remove in 1.0
          return cloneValidElement(child, {
            isSelected: index === selectedIndex,
          });
        })}
      </Comp>
    );
  }
) as Polymorphic.ForwardRefComponent<"div", TabListProps>;

if (__DEV__) {
  TabListImpl.displayName = "TabList";
  TabListImpl.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node,
  };
}

const TabList = React.memo(TabListImpl) as Polymorphic.MemoComponent<
  "div",
  TabListProps
>;

/**
 * @see Docs https://reach.tech/tabs#tablist-props
 */
interface TabListProps {
  /**
   * `TabList` expects multiple `Tab` elements as children.
   *
   * `TabPanels` expects multiple `TabPanel` elements as children.
   *
   * @see Docs https://reach.tech/tabs#tablist-children
   */
  children?: React.ReactNode;
}

if (__DEV__) {
  TabList.displayName = "TabList";
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Tab
 *
 * The interactive element that changes the selected panel.
 *
 * @see Docs https://reach.tech/tabs#tab
 */
const Tab = React.forwardRef(
  (
    {
      // TODO: Remove in 1.0
      // @ts-ignore
      isSelected: _,

      children,
      as: Comp = "button",
      index: indexProp,
      disabled,
      onBlur,
      onFocus,
      ...props
    },
    forwardedRef
  ) => {
    let {
      id: tabsId,
      onSelectTab,
      orientation,
      selectedIndex,
      userInteractedRef,
      setFocusedIndex,
    } = React.useContext(TabsContext);
    let ownRef = React.useRef<HTMLElement | null>(null);

    let [element, handleRefSet] = useStatefulRefValue<HTMLElement | null>(
      ownRef,
      null
    );
    let ref = useComposedRefs(forwardedRef, handleRefSet);
    let descendant = React.useMemo(() => {
      return {
        element,
        disabled: !!disabled,
      };
    }, [disabled, element]);
    let index = useDescendant(descendant, TabsDescendantsContext, indexProp);

    let htmlType =
      Comp === "button" && props.type == null ? "button" : props.type;

    let isSelected = index === selectedIndex;

    function onSelect() {
      onSelectTab(index);
    }

    useUpdateEffect(() => {
      if (isSelected && ownRef.current && userInteractedRef.current) {
        userInteractedRef.current = false;
        if (isFunction(ownRef.current.focus)) {
          ownRef.current.focus();
        }
      }
    }, [isSelected, userInteractedRef]);

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
        onFocus={composeEventHandlers(onFocus, () => {
          setFocusedIndex(index);
        })}
        onBlur={composeEventHandlers(onBlur, () => {
          setFocusedIndex(-1);
        })}
        type={htmlType}
      >
        {children}
      </Comp>
    );
  }
) as Polymorphic.ForwardRefComponent<"button", TabProps>;

/**
 * @see Docs https://reach.tech/tabs#tab-props
 */
interface TabProps {
  /**
   * `Tab` can receive any type of children.
   *
   * @see Docs https://reach.tech/tabs#tab-children
   */
  children?: React.ReactNode;
  /**
   * Disables a tab when true. Clicking will not work and keyboard navigation
   * will skip over it.
   *
   * @see Docs https://reach.tech/tabs#tab-disabled
   */
  disabled?: boolean;
  index?: number;
}

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
 * @see Docs https://reach.tech/tabs#tabpanels
 */
const TabPanelsImpl = React.forwardRef(
  ({ children, as: Comp = "div", ...props }, forwardedRef) => {
    let ownRef = React.useRef();
    let ref = useComposedRefs(ownRef, forwardedRef);
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
) as Polymorphic.ForwardRefComponent<"div", TabPanelsProps>;

if (__DEV__) {
  TabPanelsImpl.displayName = "TabPanels";
  TabPanelsImpl.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node,
  };
}

const TabPanels = React.memo(TabPanelsImpl) as Polymorphic.MemoComponent<
  "div",
  TabPanelsProps
>;

/**
 * @see Docs https://reach.tech/tabs#tabpanels-props
 */
interface TabPanelsProps extends TabListProps {}

if (__DEV__) {
  TabPanels.displayName = "TabPanels";
}

////////////////////////////////////////////////////////////////////////////////

/**
 * TabPanel
 *
 * The panel that displays when it's corresponding tab is active.
 *
 * @see Docs https://reach.tech/tabs#tabpanel
 */
const TabPanel = React.forwardRef(
  (
    {
      children,
      "aria-label": ariaLabel,
      as: Comp = "div",
      index: indexProp,
      ...props
    },
    forwardedRef
  ) => {
    let {
      selectedPanelRef,
      selectedIndex,
      id: tabsId,
    } = React.useContext(TabsContext);
    let ownRef = React.useRef<HTMLElement | null>(null);

    let [element, handleRefSet] = useStatefulRefValue<HTMLElement | null>(
      ownRef,
      null
    );

    let descendant = React.useMemo(() => ({ element }), [element]);
    let index = useDescendant(
      descendant,
      TabPanelDescendantsContext,
      indexProp
    );

    let id = makeId(tabsId, "panel", index);

    // Because useDescendant will always return -1 on the first render,
    // `isSelected` will briefly be false for all tabs. We set a tab panel's
    // hidden attribute based `isSelected` being false, meaning that all tabs
    // are initially hidden. This makes it impossible for consumers to do
    // certain things, like focus an element inside the active tab panel when
    // the page loads. So what we can do is track that a panel is "ready" to be
    // hidden once effects are run (descendants work their magic in
    // useLayoutEffect, so we can set our ref in useEffecct to run later). We
    // can use a ref instead of state because we're always geting a re-render
    // anyway thanks to descendants. This is a little more coupled to the
    // implementation details of descendants than I'd like, but we'll add a test
    // to (hopefully) catch any regressions.
    let isSelected = index === selectedIndex;
    let readyToHide = React.useRef(false);
    let hidden = readyToHide.current ? !isSelected : false;
    React.useEffect(() => {
      readyToHide.current = true;
    }, []);

    let ref = useComposedRefs(
      forwardedRef,
      handleRefSet,
      isSelected ? selectedPanelRef : null
    );

    return (
      <Comp
        // Each element with role `tabpanel` has the property `aria-labelledby`
        // referring to its associated tab element.
        aria-labelledby={makeId(tabsId, "tab", index)}
        hidden={hidden}
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
) as Polymorphic.ForwardRefComponent<"div", TabPanelProps>;

/**
 * @see Docs https://reach.tech/tabs#tabpanel-props
 */
interface TabPanelProps {
  /**
   * `TabPanel` can receive any type of children.
   *
   * @see Docs https://reach.tech/tabs#tabpanel-children
   */
  children?: React.ReactNode;
  /**
   * If an explicit index is passed to a `Tab` component, the same index value
   * should be passed to its corresponding `TabPanel`.
   *
   * @see Docs https://reach.tech/tabs#tabpanel-index
   */
  index?: number;
}

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
 * @see Docs https://reach.tech/tabs#usetabscontext
 */
function useTabsContext(): TabsContextValue {
  let { focusedIndex, id, selectedIndex } = React.useContext(TabsContext);
  return React.useMemo(
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

interface TabsContextValue {
  focusedIndex: number;
  id: string;
  selectedIndex: number;
}

interface InternalTabsContextValue {
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
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export type {
  TabListProps,
  TabPanelProps,
  TabPanelsProps,
  TabProps,
  TabsContextValue,
  TabsProps,
};
export {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TabsKeyboardActivation,
  TabsOrientation,
  useTabsContext,
};

function boolOrBoolString(value: any): value is "true" | true {
  return value === "true" ? true : isBoolean(value) ? value : false;
}
