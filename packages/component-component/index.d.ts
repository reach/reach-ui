import * as React from "react";
declare type ComponentState = any;
export declare type Renderable<Props> =
  | ((props: Props) => React.ReactNode)
  | React.ReactNode
  | React.ReactNodeArray
  | React.Component<Props, any>;
export declare type ComponentProps = {
  initialState?: ComponentState;
  getInitialState?: (props: ComponentProps) => ComponentState;
  refs?: React.Component["refs"];
  getRefs?: (args: Args) => React.Component["refs"];
  didMount?: (args: Args) => void;
  didUpdate?: (args: ArgsWithPrev, snapshot: any) => void;
  willUnmount?: (args: ArgsWithoutMutators) => void;
  getSnapshotBeforeUpdate?: (args: ArgsWithPrev) => null | any;
  didCatch?: (args: Args, error: any, info: any) => void;
  shouldUpdate?: (args: ArgsWithNextWithoutMutators) => boolean;
  render?: Renderable<Args>;
  children?: Renderable<Args>;
  [otherProps: string]: any;
};
interface Args {
  state: any;
  props: ComponentProps;
  setState: React.Component["setState"];
  forceUpdate: React.Component["forceUpdate"];
  refs: React.Component["refs"];
}
interface ArgsWithoutMutators {
  state: ComponentState;
  props: ComponentProps;
  refs: React.Component["refs"];
}
interface ArgsWithPrev extends Args {
  prevProps: ComponentProps;
  prevState: ComponentState;
}
interface ArgsWithNextWithoutMutators {
  state: ComponentState;
  props: ComponentProps;
  nextProps: ComponentProps;
  nextState: ComponentState;
}
export declare class Component extends React.Component<ComponentProps, any> {
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
    props: ComponentProps;
    refs: any;
    setState: (newStateOrReducer: any, callback: () => void) => void;
    forceUpdate: (callback?: (() => void) | undefined) => void;
  };
  componentDidMount(): void;
  shouldComponentUpdate(
    nextProps: ComponentProps,
    nextState: ComponentState
  ): boolean;
  componentWillUnmount(): void;
  componentDidUpdate(
    prevProps: ComponentProps,
    prevState: ComponentState,
    snapshot: any
  ): void;
  getSnapshotBeforeUpdate(
    prevProps: ComponentProps,
    prevState: ComponentState
  ): any;
  componentDidCatch(error: any, info: any): void;
  render(): any;
}
export default Component;
