import React from "react";
import { Location } from "@reach/router";

window.history.scrollRestoration = "manual";

let scrollPositions = {};

class ManageScrollImpl extends React.Component {
  componentDidMount() {
    try {
      // session storage will throw for a few reasons
      // - user settings
      // - in-cognito/private browsing
      // - who knows...
      let storage = JSON.parse(sessionStorage.getItem("scrollPositions"));
      if (storage) {
        scrollPositions = JSON.parse(storage) || {};
        let { key } = this.props.location;
        if (scrollPositions[key]) {
          window.scrollTo(0, scrollPositions[key]);
        }
      }
    } catch (e) {}

    window.addEventListener("scroll", this.listener);
    // handle hash here?
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.listener);
  }

  componentDidUpdate() {
    const { key } = this.props.location;
    if (!scrollPositions[key]) {
      // never seen this location before
      window.scrollTo(0, 0);
    } else {
      // seen it
      window.scrollTo(0, scrollPositions[key]);
    }
  }

  listener = () => {
    scrollPositions[this.props.location.key] = window.scrollY;
    try {
      sessionStorage.setItem(
        "scrollPositions",
        JSON.stringify(scrollPositions)
      );
    } catch (e) {}
  };

  render() {
    return null;
  }
}

export default () => (
  <Location>
    {({ location }) => <ManageScrollImpl location={location} />}
  </Location>
);
