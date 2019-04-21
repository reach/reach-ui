declare module "@reach/tabs" {
  import { ComponentType } from "react";

  export interface BaseTabProps {
    children?: React.ReactNode;
    as?: ComponentType;
  }

  export interface TabsProps
    extends BaseTabProps,
    React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;

    defaultIndex?: number;
    index?: number;
    onChange?(index: number): void;
  }
  export class Tabs extends React.Component<TabsProps> {}

  export type TabListProps = BaseTabProps & React.HTMLAttributes<HTMLDivElement>;
  export class TabList extends React.Component<TabListProps> {}

  export type TabPanelsProps = BaseTabProps & React.HTMLAttributes<HTMLDivElement>;
  export class TabPanels extends React.Component<TabPanelsProps> {}

  export type TabPanelProps = BaseTabProps & React.HTMLAttributes<HTMLDivElement>;
  export class TabPanel extends React.Component<TabPanelProps> {}

  export interface TabProps
    extends BaseTabProps,
    React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
  }
  export class Tab extends React.Component<TabProps> {}
}