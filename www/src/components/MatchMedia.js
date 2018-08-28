import React from "react";
import createMediaListener from "./createMediaListener";

export default class MatchMedia extends React.Component {
  media = createMediaListener(this.props.media);

  state = this.media.getState();

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
