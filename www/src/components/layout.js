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

let NavLink = React.forwardRef(
  (props, ref) =>
    props.href ? (
      <a ref={ref} className="NavLink" {...props} />
    ) : (
      <Link ref={ref} className="NavLink" {...props} />
    )
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

let Nav = ({ media }) => (
  <Component
    media={media}
    refs={{ navNode: null }}
    initialState={{ isOpen: null }}
    didMount={({ setState, props }) => {
      setState({ isOpen: !props.media.small });
    }}
    didUpdate={({ prevProps, props, setState, state }) => {
      if (prevProps.media.small && !props.media.small) {
        setState({ isOpen: true });
      } else if (
        !prevProps.media.small &&
        props.media.small
      ) {
        setState({ isOpen: false });
      }
    }}
  >
    {({ setState, state, refs }) => (
      <React.Fragment>
        {media &&
          media.small && (
            <React.Fragment>
              <button
                id="hamburger"
                style={{
                  width: 40,
                  height: 40,
                  padding: 8,
                  position: "absolute",
                  left: 10,
                  top: 10,
                  border: "none",
                  font: "inherit",
                  textTransform: "none",
                  fontSize: "80%",
                  borderRadius: "50%",
                  zIndex: 1
                }}
                onFocus={event => {
                  event.stopPropagation();
                }}
                onClick={() => {
                  let nextState = !state.isOpen;
                  setState({ isOpen: nextState }, () => {
                    if (nextState) {
                      refs.navNode.focus();
                    }
                  });
                }}
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
          id="nav"
          style={{
            left:
              state.isOpen == null
                ? undefined
                : state.isOpen
                  ? 0
                  : -250
          }}
          onFocus={() => {
            setState({ isOpen: true });
          }}
          onBlur={() => {
            if (media.small) {
              setState({ isOpen: false });
            }
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              minHeight: "100%"
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{ padding: "30px 50px 20px 20px" }}
              >
                <Logo />
              </div>

              <div style={{ height: 10 }} />

              <NavLink
                href="/"
                ref={node => {
                  refs.navNode = node;
                }}
              >
                Home
              </NavLink>
              <NavLink to="/funding">Funding</NavLink>
              <NavLink href="https://spectrum.chat/reach">
                Spectrum Community ↗
              </NavLink>
              <NavLink href="https://github.com/reach/reach-ui">
                GitHub ↗
              </NavLink>

              <hr />

              <NavLink to="/styling">Styling</NavLink>

              <hr />

              <NavLink to="/alert">Alert</NavLink>
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
              <NavLink to="/window-size">
                WindowSize
              </NavLink>
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
      </React.Fragment>
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
          server={{ small: true }}
          media={{
            small: "(max-width: 800px)"
          }}
        >
          {media => (
            <div id="container">
              <Nav media={media} />
              <SkipNavContent>
                <div id="content">{children}</div>
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
