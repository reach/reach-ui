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

declare const Tabs: React.FunctionComponent<TabsProps>;

declare const TabList: React.FunctionComponent<TabContainerProps>;

declare const TabPanels: React.FunctionComponent<TabContainerProps>;

declare const Tab: React.FunctionComponent<TabProps>;

declare const TabPanel: React.FunctionComponent<TabPanelProps>;
