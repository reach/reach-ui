import * as React from "react";
import PropTypes from "prop-types";

function cleanProps(props: any): any {
  let {
    initialState,
    getInitialState,
    refs,
    getRefs,
    didMount,
    didUpdate,
    willUnmount,
    getSnapshotBeforeUpdate,
    shouldUpdate,
    render,
    ...rest
  } = props;
  return rest;
}

class Component<
  State extends object = {},
  Refs extends object = {}
> extends React.Component<ComponentProps<State, Refs>, State> {
  static defaultProps = {
    getInitialState: () => {},
    getRefs: () => ({}),
  };

  state =
    this.props.initialState ||
    (this.props.getInitialState || (() => ({} as State)))(this.props);
  _refs: Refs =
    this.props.refs ||
    (this.props.getRefs || (() => ({} as Refs)))(this.getArgs());
  _setState: React.Component<ComponentProps<State, Refs>, State>["setState"] = (
    ...args
  ) => this.setState(...args);
  _forceUpdate: React.Component<
    ComponentProps<State, Refs>,
    State
  >["forceUpdate"] = (...args) => this.forceUpdate(...args);

  getArgs() {
    const {
      state,
      props,
      _setState: setState,
      _forceUpdate: forceUpdate,
      _refs: refs,
    } = this;
    return {
      state,
      props: cleanProps(props),
      refs,
      setState,
      forceUpdate,
    };
  }

  componentDidMount() {
    if (this.props.didMount) this.props.didMount(this.getArgs());
  }

  shouldComponentUpdate(
    nextProps: ComponentProps<State, Refs>,
    nextState: State
  ) {
    if (this.props.shouldUpdate)
      return this.props.shouldUpdate({
        props: this.props,
        state: this.state,
        nextProps: cleanProps(nextProps),
        nextState,
      });
    else return true;
  }

  componentWillUnmount() {
    if (this.props.willUnmount)
      this.props.willUnmount({
        state: this.state,
        props: cleanProps(this.props),
        refs: this._refs,
      });
  }

  componentDidUpdate(
    prevProps: ComponentProps<State, Refs>,
    prevState: State,
    snapshot: any
  ) {
    if (this.props.didUpdate)
      this.props.didUpdate(
        Object.assign(this.getArgs(), {
          prevProps: cleanProps(prevProps),
          prevState,
        }),
        snapshot
      );
  }

  getSnapshotBeforeUpdate(
    prevProps: ComponentProps<State, Refs>,
    prevState: State
  ) {
    if (this.props.getSnapshotBeforeUpdate) {
      return this.props.getSnapshotBeforeUpdate(
        Object.assign(this.getArgs(), {
          prevProps: cleanProps(prevProps),
          prevState,
        })
      );
    } else {
      return null;
    }
  }

  render() {
    const { children, render } = this.props;
    return render
      ? render(this.getArgs())
      : typeof children === "function"
      ? children(this.getArgs())
      : children || null;
  }
}

if (__DEV__) {
  // @ts-ignore
  Component.displayName = "ComponentComponent";
  // @ts-ignore
  Component.propTypes = {
    initialState: PropTypes.object,
    getInitialState: PropTypes.func,
    refs: PropTypes.object,
    getRefs: PropTypes.func,
    didMount: PropTypes.func,
    didUpdate: PropTypes.func,
    willUnmount: PropTypes.func,
    getSnapshotBeforeUpdate: PropTypes.func,
    shouldUpdate: PropTypes.func,
    render: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  };
}

export { Component };
export default Component;

interface ComponentProps<State extends object = {}, Refs extends object = {}> {
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
