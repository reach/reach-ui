import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import Link from "gatsby-link";

import "../../../packages/dialog/styles.css";
import "../../../packages/skip-nav/styles.css";
import "../../../packages/menu-button/styles.css";

import "./normalize.css";
import "./skeleton.css";
import "./syntax.css";
import "./app.css";

import Logo from "./Logo";
import MatchMedia from "./MatchMedia";
import Component from "../../../packages/component-component";
import VisuallyHidden from "../../../packages/visually-hidden";

import {
  SkipNavLink,
  SkipNavContent
} from "../../../packages/skip-nav";

let NavLink = props =>
  props.href ? (
    <a className="NavLink" {...props} />
  ) : (
    <Link className="NavLink" {...props} />
  );

let Bar = () => (
  <div
    style={{
      height: 3,
      background: "white",
      margin: "3px 0"
    }}
  />
);

let Nav = ({ small }) => (
  <Component
    refs={{ navNode: null }}
    initialState={{ isOpen: false }}
  >
    {({ setState, state, refs }) => (
      <div
        id="nav"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          overflow: "auto",
          width: 250,
          paddingTop: small ? 50 : 0,
          background: "hsl(211, 81%, 36%)",
          left: state.isOpen ? 0 : small ? -250 : 0,
          transition: "left 200ms ease",
          zIndex: 1
        }}
        onFocus={() => {
          setState({ isOpen: true });
        }}
        onBlur={() => {
          setState({ isOpen: false });
        }}
      >
        {small && (
          <React.Fragment>
            <button
              id="hamburger"
              style={{
                width: 40,
                height: 40,
                padding: 8,
                position: "fixed",
                left: 10,
                top: 10,
                border: "none",
                font: "inherit",
                textTransform: "none",
                fontSize: "80%",
                borderRadius: "50%",
                boxShadow:
                  "0 2px 10px hsla(0, 0%, 0%, 0.25)"
              }}
              onFocus={event => {
                event.stopPropagation();
              }}
              onClick={() =>
                setState(
                  state => ({
                    isOpen: !state.isOpen
                  }),
                  () => {
                    if (state.isOpen) {
                      refs.navNode.focus();
                    }
                  }
                )
              }
            >
              <div aria-hidden="true">
                <Bar />
                <Bar />
                <Bar />
              </div>
              <VisuallyHidden>Toggle Nav</VisuallyHidden>
            </button>
          </React.Fragment>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            minHeight: "100%"
          }}
        >
          <div
            style={{ flex: 1 }}
            ref={node => (refs.navNode = node)}
          >
            <div style={{ padding: "30px 50px 20px 20px" }}>
              <Logo />
            </div>

            <div style={{ height: 10 }} />

            <NavLink to="/">Home</NavLink>
            <NavLink to="/funding">Funding</NavLink>
            <NavLink href="https://spectrum.chag">
              Spectrum Community ↗
            </NavLink>
            <NavLink href="https://github.com/reach/reach-ui">
              Github ↗
            </NavLink>

            <hr />

            <NavLink to="/styling">Styling</NavLink>

            <hr />

            <NavLink to="/dialog">Dialog (Modal)</NavLink>
            <NavLink to="/menu-button">
              MenuButton (Dropdown)
            </NavLink>
            <NavLink to="/skip-nav">SkipNav</NavLink>
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
    )}
  </Component>
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
        <SkipNavLink style={{ zIndex: 2 }} />
        <MatchMedia
          server={{ small: false }}
          media={{
            small: "(max-width: 800px)"
          }}
        >
          {media => (
            <div id="container">
              <Nav small={media.small} />
              <SkipNavContent>
                <div
                  id="content"
                  style={{
                    marginLeft: media.small ? 0 : 250,
                    padding: media.small
                      ? "60px 20px"
                      : "20px 80px 80px 80px",
                    maxWidth: 800
                  }}
                >
                  {children}
                </div>
              </SkipNavContent>
            </div>
          )}
        </MatchMedia>
      </>
    );
  }
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
