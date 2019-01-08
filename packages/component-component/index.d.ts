import * as React from "react";

export declare type Renderable<Props> =
  | ((props: Props) => React.ReactNode)
  | React.ReactNode
  | React.ReactNodeArray
  | React.Component<Props, any>;

declare type ComponentState<T> = T;

export declare type ComponentProps<T> = {
  initialState?: T;
  getInitialState?: (props: ComponentProps<T>) => ComponentState<T>;
  refs?: React.Component["refs"];
  getRefs?: (args: Args<T>) => React.Component["refs"];
  didMount?: (args: Args<T>) => void;
  didUpdate?: (args: ArgsWithPrev<T>, snapshot: any) => void;
  willUnmount?: (args: ArgsWithoutMutators<T>) => void;
  getSnapshotBeforeUpdate?: (args: ArgsWithPrev<T>) => null | any;
  didCatch?: (args: Args<T>, error: any, info: any) => void;
  shouldUpdate?: (args: ArgsWithNextWithoutMutators<T>) => boolean;
  render?: Renderable<Args<T>>;
  children?: Renderable<Args<T>>;
  [otherProps: string]: any;
};
interface Args<T> {
  state: ComponentState<T>;
  props: ComponentProps<T>;
  setState: React.Component<ComponentProps<T>, ComponentState<T>>["setState"];
  forceUpdate: React.Component["forceUpdate"];
  refs: React.Component["refs"];
}
interface ArgsWithoutMutators<T> {
  state: ComponentState<T>;
  props: ComponentProps<T>;
  refs: React.Component["refs"];
}
interface ArgsWithPrev<T> extends Args<T> {
  prevProps: ComponentProps<T>;
  prevState: ComponentState<T>;
}
interface ArgsWithNextWithoutMutators<T> {
  state: ComponentState<T>;
  props: ComponentProps<T>;
  nextProps: ComponentProps<T>;
  nextState: ComponentState<T>;
}
export declare class Component<T> extends React.Component<
  ComponentProps<T>,
  any
> {
  static defaultProps: {
    getInitialState: () => void;
    getRefs: () => {};
  };
  state: any;
  _refs: any;
  _setState: (newStateOrReducer: any, callback: () => void) => void;
  _forceUpdate: (callback?: (() => void) | undefined) => void;
  getArgs(): {
    state: any;
    props: ComponentProps<T>;
    refs: any;
    setState: (newStateOrReducer: any, callback: () => void) => void;
    forceUpdate: (callback?: (() => void) | undefined) => void;
  };
  componentDidMount(): void;
  shouldComponentUpdate(
    nextProps: ComponentProps<T>,
    nextState: ComponentState<T>
  ): boolean;
  componentWillUnmount(): void;
  componentDidUpdate(
    prevProps: ComponentProps<T>,
    prevState: ComponentState<T>,
    snapshot: any
  ): void;
  getSnapshotBeforeUpdate(
    prevProps: ComponentProps<T>,
    prevState: ComponentState<T>
  ): any;
  componentDidCatch(error: any, info: any): void;
  render(): any;
}
export default Component;
