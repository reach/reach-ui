/**
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

import * as React from "react";

type ResolvedTabsComponent<T> = T extends keyof JSX.IntrinsicElements
  ? T
  : React.ComponentType<T>;

type ResolvedTabsProps<T> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T]
  : T;

type SupportedTabsComponent = object | keyof JSX.IntrinsicElements;

/**
 * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-props
 */
export type TabsProps<T extends SupportedTabsComponent = "div"> = Omit<
  ResolvedTabsProps<T>,
  "onChange"
> & {
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
   * Tabs will render a `div` unless you specify a different element.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-props
   */
  as?: ResolvedTabsComponent<T>;
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

/**
 * Shared props for TabList and TabPanels.
 *
 * @see Docs https://reacttraining.com/reach-ui/tabs#tablist-props
 * @see Docs https://reacttraining.com/reach-ui/tabs#tabpanels-props
 */
export type TabContainerProps = {
  /**
   * `TabList` expects multiple `Tab` elements as children.
   *
   * `TabPanels` expects multiple `TabPanel` elements as children.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tablist-children
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabpanels-children
   */
  children?: React.ReactNode;
  selectedIndex?: number;
  /**
   * Tabs will render a `div` unless you specify a different element.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tablist-as
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabpanels-as
   */
  as?: string;
} & React.HTMLAttributes<HTMLElement>;

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
  isSelected?: boolean;
  /**
   * TabPanel will render a `div` unless you specify a different element.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabpanel-as
   */
  as?: string;
} & React.HTMLAttributes<HTMLElement>;

/**
 * @see Docs https://reacttraining.com/reach-ui/tabs#tab-props
 */
export type TabProps = {
  disabled?: boolean;
} & TabPanelProps;

/**
 * The parent component of the tab interface.
 *
 * @see Docs https://reacttraining.com/reach-ui/tabs#tabs
 */
export const Tabs: React.FunctionComponent<TabsProps>;

/**
 * The parent component of the tabs.
 *
 * @see Docs https://reacttraining.com/reach-ui/tabs#tablist
 */
export const TabList: React.FunctionComponent<TabContainerProps>;

/**
 * The parent component of the panels.
 *
 * @see Docs https://reacttraining.com/reach-ui/tabs#tabpanels
 */
export const TabPanels: React.FunctionComponent<TabContainerProps>;

/**
 * The interactive element that changes the selected panel.
 *
 * @see Docs https://reacttraining.com/reach-ui/tabs#tab
 */
export const Tab: React.FunctionComponent<TabProps>;

/**
 * The panel that displays when it's corresponding tab is active.
 *
 * @see Docs https://reacttraining.com/reach-ui/tabs#tabpanel
 */
export const TabPanel: React.FunctionComponent<TabPanelProps>;
