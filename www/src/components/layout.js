import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { StaticQuery, graphql } from "gatsby";
import Link from "gatsby-link";

import Header from "./header";
import "../../../packages/menu-button/styles.css";
import "./normalize.css";
import "./skeleton.css";
import "./syntax.css";
import "./app.css";

import Logo from "./Logo";

let NavTitle = props => (
  <div className="NavTitle" {...props} />
);

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
        <NavLink to="/styling">Styling</NavLink>
        <NavLink to="/funding">Funding</NavLink>

        <hr />

        <NavLink to="/menu-button">Dropdown Menu Button</NavLink>
        <NavLink to="/visually-hidden">
          VisuallyHidden
        </NavLink>

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
          color: "hsla(0, 100%, 100%, 0.5)",
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
    let { children, data, meta, title } = this.props;
    return (
      <>
        <Helmet
          title="Reach UI"
          meta={
            meta || [
              {
                name: "description",
                content:
                  "The accessible foundation of your React apps and design systems."
              }
            ]
          }
        >
          <html lang="en" />
        </Helmet>
        <div id="container">
          <Nav />
          <div id="content">{children}</div>
        </div>
      </>
    );
  }
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
