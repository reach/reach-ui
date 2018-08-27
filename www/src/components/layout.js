import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import Link from "gatsby-link";

import "../../../packages/skip-nav/styles.css";
import "../../../packages/menu-button/styles.css";
import "./normalize.css";
import "./skeleton.css";
import "./syntax.css";
import "./app.css";

import Logo from "./Logo";
import {
  SkipNavLink,
  SkipNavContent
} from "../../../packages/skip-nav";

let NavLink = props => (
  <Link className="NavLink" {...props} />
);

let Nav = () => (
  <div id="nav">
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: "100%"
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ padding: "30px 50px 20px 20px" }}>
          <Logo />
        </div>

        <div style={{ height: 10 }} />

        <NavLink to="/">Home</NavLink>
        <NavLink to="/funding">Funding</NavLink>

        <hr />

        <NavLink to="/styling">Styling</NavLink>
        <NavLink to="/animation">Animation</NavLink>

        <hr />

        <NavLink to="/dialog">Dialog (Modal)</NavLink>
        <NavLink to="/menu-button">
          MenuButton (Dropdown)
        </NavLink>
        <NavLink to="/visually-hidden">
          VisuallyHidden
        </NavLink>
        <NavLink to="/skip-nav">SkipNav</NavLink>

        <hr />

        <NavLink to="/component-component">
          Component²
        </NavLink>
        <NavLink to="/rect">Rect</NavLink>
        <NavLink to="/window-size">WindowSize</NavLink>
      </div>
      <footer
        style={{
          marginTop: 100,
          color: "hsla(0, 100%, 100%, 0.75)",
          textAlign: "center",
          fontSize: "80%",
          padding: 5
        }}
      >
        &copy; 2018 Reach
      </footer>
    </div>
  </div>
);

class Layout extends React.Component {
  render() {
    let { children } = this.props;
    return (
      <>
        <Helmet
          title="Reach UI"
          meta={[
            {
              name: "description",
              content:
                "The accessible foundation of your React apps and design systems."
            }
          ]}
        >
          <html lang="en" />
        </Helmet>
        <SkipNavLink />
        <div id="container">
          <Nav />
          <SkipNavContent>
            <div id="content">{children}</div>
          </SkipNavContent>
        </div>
      </>
    );
  }
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
