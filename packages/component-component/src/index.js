import React from "react";
import PropTypes from "prop-types";

let cleanProps = props => {
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
};

class Component extends React.Component {
  static defaultProps = {
    getInitialState: () => {},
    getRefs: () => ({})
  };

  state = this.props.initialState || this.props.getInitialState(this.props);
  _refs = this.props.refs || this.props.getRefs(this.getArgs());
  _setState = (...args) => this.setState(...args);
  _forceUpdate = (...args) => this.forceUpdate(...args);

  getArgs() {
    const {
      state,
      props,
      _setState: setState,
      _forceUpdate: forceUpdate,
      _refs: refs
    } = this;
    return {
      state,
      props: cleanProps(props),
      refs,
      setState,
      forceUpdate
    };
  }

  componentDidMount() {
    if (this.props.didMount) this.props.didMount(this.getArgs());
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.shouldUpdate)
      return this.props.shouldUpdate({
        props: this.props,
        state: this.state,
        nextProps: cleanProps(nextProps),
        nextState
      });
    else return true;
  }

  componentWillUnmount() {
    if (this.props.willUnmount)
      this.props.willUnmount({
        state: this.state,
        props: cleanProps(this.props),
        refs: this._refs
      });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.didUpdate)
      this.props.didUpdate(
        Object.assign(this.getArgs(), {
          prevProps: cleanProps(prevProps),
          prevState
        }),
        snapshot
      );
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    if (this.props.getSnapshotBeforeUpdate) {
      return this.props.getSnapshotBeforeUpdate(
        Object.assign(this.getArgs(), {
          prevProps: cleanProps(prevProps),
          prevState
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
  Component.displayName = "ComponentComponent";
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
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node])
  };
}

export default Component;
