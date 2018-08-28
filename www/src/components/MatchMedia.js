import React from "react";
import createMediaListener from "./createMediaListener";

let canUseDOM = typeof window !== "undefined";

export default class MatchMedia extends React.Component {
  media = canUseDOM
    ? createMediaListener(this.props.media)
    : null;

  state = canUseDOM
    ? this.media.getState()
    : this.props.server;

  componentDidMount() {
    this.media.listen(state => {
      this.setState(state);
    });
  }

  componentWillUnmount() {
    this.media.dispose();
  }

  render() {
    return this.props.children(this.state);
  }
}
