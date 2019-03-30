declare module "@reach/component-component" {
  type Args<P, S> = {
    props: P;
    state: S;
    setState<K extends keyof S>(
      state:
        | ((prevState: Readonly<S>, props: P) => Pick<S, K> | S | null)
        | (Pick<S, K> | S | null),
      callback?: () => void
    ): void;
    forceUpdate(callBack?: () => void): void;
  };

  type Refs = { [key: string]: React.RefObject<HTMLElement> };

  type StateProps<P, S> = Pick<Args<P, S>, "state" | "props">;

  export type ComponentProps<P, S> = {
    initialState?: S;
    getInitialState?(): S;
    refs?: Refs;
    getRefs?(): Refs;
    didMount?(args: Args<P, S> & Refs): void;
    didUpdate?(args: Args<P, S> & Refs & { prevProps: P; prevState: S }): void;
    willUnmount?(args: StateProps<P, S> & Refs): void;
    getSnapshotBeforeUpdate?(
      args: StateProps<P, S> & Refs & { prevProps: P; prevState: S }
    ): any;
    shouldUpdate?(
      args: StateProps<P, S> & { nextProps: P; nextState: S }
    ): boolean;
    children?(
      args: Args<P, S> & Refs
    ): Args<P, S> & Refs | React.ReactNode | null;
    render?(args: Args<P, S>): void;
  };

  class Component<
    P extends ComponentProps<P, S>,
    S = any
  > extends React.Component<ComponentProps<P, S>, {}> {}

  export default Component;
}
