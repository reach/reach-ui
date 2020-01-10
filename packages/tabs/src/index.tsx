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
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState
} from "react";
import PropTypes from "prop-types";
import warning from "warning";
import {
  checkStyles,
  forwardRefWithAs,
  noop,
  wrapEvent,
  useUpdateEffect,
  makeId,
  useForkedRef
} from "@reach/utils";
import { useId } from "@reach/auto-id";

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

  const id = useId(props.id);

  // we only manage focus if the user caused the update vs.
  // a new controlled index coming in
  const _userInteractedRef = useRef(false);

  const _selectedPanelRef = useRef<HTMLElement | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(defaultIndex || 0);

  const clones = React.Children.map(children, child => {
    return cloneValidElement<TabsCloneProps>(child, {
      _selectedIndex: isControlled
        ? (controlledIndex as number)
        : selectedIndex,
      _id: id || "tabs",
      _userInteractedRef,
      _selectedPanelRef,
      _onFocusPanel: () => _selectedPanelRef.current?.focus(),
      _onSelectTab: readOnly
        ? noop
        : (index: number) => {
            _userInteractedRef.current = true;
            onChange && onChange(index);
            if (!isControlled) {
              setSelectedIndex(index);
            }
          }
    });
  });

  useEffect(() => checkStyles("tabs"), []);

  return <Comp data-reach-tabs="" ref={ref} {...props} children={clones} />;
});

type TabsCloneProps = {
  _selectedIndex: number;
  _id: string;
  _userInteractedRef: React.MutableRefObject<boolean>;
  _selectedPanelRef: React.MutableRefObject<HTMLElement | null>;
  _onFocusPanel(): void;
  _onSelectTab(index: number): void;
};

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
  { children, as: Comp = "div", onKeyDown, ...clonedProps },
  ref
) {
  const {
    _selectedIndex: selectedIndex,
    _onSelectTab,
    _userInteractedRef,
    _onFocusPanel,
    _selectedPanelRef,
    _id,
    ...htmlProps
  } = clonedProps as TabsCloneProps;

  const clones = React.Children.map(children, (child, index) => {
    return cloneValidElement<TabListCloneProps>(child, {
      _isSelected: index === selectedIndex,
      _id: makeId(_id, index),
      _userInteractedRef,
      _onSelect: () => _onSelectTab(index)
    });
  });

  const handleKeyDown = wrapEvent(onKeyDown, event => {
    const enabledIndexes: number[] = React.Children.map(
      children,
      (child, index) =>
        isValidElement(child) && child.props.disabled === true
          ? (null as any)
          : index
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
      {...(htmlProps as any)}
    />
  );
});

type TabListCloneProps = Pick<TabsCloneProps, "_id" | "_userInteractedRef"> & {
  _isSelected: boolean;
  _onSelect(): void;
};

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
  { children, as: Comp = "button", ...rest },
  forwardedRef
) {
  const {
    _isSelected: isSelected,
    _userInteractedRef,
    _onSelect,
    _id,
    ...htmlProps
  } = rest as TabListCloneProps;
  const htmlType =
    Comp === "button" && (htmlProps as any).type == null ? "button" : undefined;

  const ownRef = useRef<HTMLElement | null>(null);
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
      {...(htmlProps as any)}
    />
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
    disabled: PropTypes.bool,
    children: PropTypes.node
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
  function TabPanels({ children, as: Comp = "div", ...rest }, forwardedRef) {
    const {
      _selectedIndex: selectedIndex,
      _selectedPanelRef,
      _userInteractedRef,
      _onFocusPanel,
      _onSelectTab,
      _id,
      ...htmlProps
    } = rest as TabsCloneProps;

    const clones = React.Children.map(children, (child, index) => {
      return cloneValidElement<TabPanelsCloneProps>(child, {
        _isSelected: index === selectedIndex,
        _selectedPanelRef,
        _id: makeId(_id, index)
      });
    });

    return (
      <Comp
        data-reach-tab-panels=""
        ref={forwardedRef}
        {...(htmlProps as any)}
        children={clones}
      />
    );
  }
);

type TabPanelsCloneProps = Pick<TabsCloneProps, "_selectedPanelRef"> & {
  _isSelected: boolean;
  _id: string;
};

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
  function TabPanel({ children, as: Comp = "div", ...rest }, forwardedRef) {
    const {
      _isSelected: isSelected,
      _selectedPanelRef,
      _id,
      ...htmlProps
    } = rest as TabPanelsCloneProps;
    const ref = useForkedRef(
      forwardedRef,
      isSelected ? _selectedPanelRef : null
    );

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
        {...(htmlProps as any)}
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

////////////////////////////////////////////////////////////////////////////////

export function cloneValidElement<P>(
  element: React.ReactElement<P> | React.ReactNode,
  props?: Partial<P> & React.Attributes,
  ...children: React.ReactNode[]
): React.ReactElement<P> | React.ReactNode {
  if (!isValidElement(element)) {
    return element;
  }
  return cloneElement(element, props, ...children);
}
