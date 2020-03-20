declare module "@reach/component-component" {
  import React from "react";
  interface ComponentProps<
    State extends object = {},
    Refs extends object = {}
  > {
    [key: string]: any;
    initialState?: State;
    getInitialState?: (props: ComponentProps<State>) => State;
    refs?: Refs;
    getRefs?: (...args: any[]) => Refs;
    didMount?: (...args: any[]) => void;
    didUpdate?: (...args: any[]) => void;
    willUnmount?: (...args: any[]) => void;
    getSnapshotBeforeUpdate?: (...args: any[]) => any;
    shouldUpdate?: (args: {
      props: ComponentProps<State>;
      state: State;
      nextProps: ComponentProps<State>;
      nextState: State;
    }) => boolean;
    render?: (...args: any[]) => React.ReactElement | null;
    children?:
      | ((...args: any[]) => React.ReactElement | null)
      | React.ReactNode
      | React.ReactElement
      | Element
      | null;
  }
  class Component<
    State extends object = {},
    Refs extends object = {}
  > extends React.Component<ComponentProps<State, Refs>, State> {}
  export default Component;
}
