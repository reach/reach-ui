declare module "@reach/tabs" {
  import * as React from "react";

  export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

  export type TabsProps = {
    children: React.ReactNode;
    as?: string;
    index?: number;
    readOnly?: boolean;
    defaultIndex?: number;
    onChange?: (index: number) => void;
  } & Omit<React.HTMLProps<HTMLDivElement>, "onChange">;

  export type TabContainerProps = {
    children?: React.ReactNode;
    selectedIndex?: number;
    as?: string;
  } & React.HTMLProps<HTMLElement>;

  export type TabPanelProps = {
    children?: React.ReactNode;
    isSelected?: boolean;
    as?: string;
  } & React.HTMLProps<HTMLElement>;

  export type TabProps = {
    disabled?: boolean;
  } & TabPanelProps;

  export const Tabs: React.FunctionComponent<TabsProps>;
  export const TabList: React.FunctionComponent<TabContainerProps>;
  export const TabPanels: React.FunctionComponent<TabContainerProps>;
  export const Tab: React.FunctionComponent<TabProps>;
  export const TabPanel: React.FunctionComponent<TabPanelProps>;
}
