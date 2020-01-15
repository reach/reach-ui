import React, {
  forwardRef,
  Fragment,
  useEffect,
  useRef,
  useState
} from "react";
import PropTypes from "prop-types";
import Link from "gatsby-link";
import VisuallyHidden from "@reach/visually-hidden";
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav";
import Logo from "./Logo";
import { useMatchMedia } from "./MatchMedia";
import SEO from "./SEO";

import "@reach/dialog/styles.css";
import "@reach/skip-nav/styles.css";
import "@reach/menu-button/styles.css";
import "@reach/tabs/styles.css";
import "@reach/tooltip/styles.css";
import "@reach/combobox/styles.css";
import "../styles/app.scss";

const NavLink = forwardRef(function NavLink({ children, ...props }, ref) {
  return (
    <li style={{ margin: 0, padding: 0 }}>
      {props.href ? (
        <a
          ref={ref}
          className="NavLink"
          target="_blank"
          rel="noopener"
          {...props}
        >
          {children} <span aria-hidden>↗</span>
        </a>
      ) : (
        <Link ref={ref} className="NavLink" {...props}>
          {children}
        </Link>
      )}
    </li>
  );
});

function NavList({ children }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>{children}</ul>
  );
}

function Bar() {
  return (
    <div
      style={{
        height: 3,
        background: "white",
        margin: "3px 0"
      }}
    />
  );
}

function HamburgerButton({ style = {}, children, ...props }) {
  return (
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
        zIndex: 1,
        ...style
      }}
      {...props}
    >
      <div aria-hidden="true">
        <Bar />
        <Bar />
        <Bar />
      </div>
      <VisuallyHidden>{children}</VisuallyHidden>
    </button>
  );
}

function NavTag(props) {
  return (
    <span
      style={{
        fontSize: 13,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        padding: `0 0.25em`,
        marginLeft: "0.5em",
        display: "inlineBlock",
        background: `rgba(255,255,255,0.15)`,
        borderRadius: 3
      }}
      {...props}
    />
  );
}

// eslint-disable-next-line no-unused-vars
function BetaTag() {
  return (
    <NavTag>
      <VisuallyHidden>Currently in </VisuallyHidden>Beta
    </NavTag>
  );
}

function Footer({ style = {}, ...props }) {
  return (
    <footer
      style={{
        marginTop: 100,
        color: "hsla(0, 100%, 100%, 0.75)",
        textAlign: "center",
        fontSize: "80%",
        padding: 5,
        ...style
      }}
      {...props}
    >
      &copy; {new Date().getFullYear()} React Training
    </footer>
  );
}

function Header({ children, style = {}, ...props }) {
  return (
    <header style={{ flex: 1, ...style }} {...props}>
      <div style={{ padding: "30px 50px 20px 20px" }}>
        <Logo />
      </div>

      <div style={{ height: 10 }} aria-hidden />

      {children}
    </header>
  );
}

function Nav({ media }) {
  const [isOpen, setIsOpen] = useState(null);
  const navNode = useRef(null);
  useEffect(() => void setIsOpen(!media.small), [media]);

  return (
    <Fragment>
      {media && media.small && (
        <HamburgerButton
          onFocus={event => event.stopPropagation()}
          onClick={() => {
            setIsOpen(isOpen => {
              let nextState = !isOpen;
              if (nextState && navNode.current) {
                navNode.current.focus();
              }
              return nextState;
            });
          }}
        >
          Toggle Nav
        </HamburgerButton>
      )}
      <div
        id="nav"
        style={{
          left: isOpen == null ? undefined : isOpen ? 0 : -250
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => media.small && setIsOpen(false)}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            minHeight: "100%"
          }}
        >
          <Header>
            <nav>
              <NavList>
                <NavLink to="/" ref={navNode}>
                  Home
                </NavLink>
                <NavLink to="/funding">Funding</NavLink>
                <NavLink href="https://spectrum.chat/reach">
                  Spectrum Community
                </NavLink>
                <NavLink href="https://github.com/reach/reach-ui">
                  GitHub
                </NavLink>
              </NavList>

              <hr aria-hidden />

              <NavList>
                <NavLink to="/animation">Animation</NavLink>
                <NavLink to="/styling">Styling</NavLink>
              </NavList>

              <hr aria-hidden />

              <NavList>
                <NavLink to="/alert">Alert</NavLink>
                <NavLink to="/alert-dialog">Alert Dialog</NavLink>
                <NavLink to="/combobox">Combobox</NavLink>
                <NavLink to="/dialog">Dialog (Modal)</NavLink>
                <NavLink to="/menu-button">Menu Button</NavLink>
                <NavLink to="/portal">Portal</NavLink>
                <NavLink to="/skip-nav">Skip Nav</NavLink>
                <NavLink to="/slider">Slider</NavLink>
                <NavLink to="/tabs">Tabs</NavLink>
                <NavLink to="/tooltip">Tooltip</NavLink>
                <NavLink to="/visually-hidden">Visually Hidden</NavLink>
              </NavList>

              <hr aria-hidden />

              <NavList>
                <NavLink to="/auto-id">Auto ID</NavLink>
                <NavLink to="/component-component">
                  Component<span aria-hidden>²</span>
                  <VisuallyHidden> Component</VisuallyHidden>
                </NavLink>
                <NavLink to="/rect">Rect</NavLink>
                <NavLink to="/window-size">Window Size</NavLink>
              </NavList>
            </nav>
          </Header>
          <Footer />
        </div>
      </div>
    </Fragment>
  );
}

function Layout({ children }) {
  let media = useMatchMedia({ small: "(max-width: 800px)" });

  return (
    <Fragment>
      <SEO />
      <SkipNavLink style={{ zIndex: 2 }} />

      <div id="container">
        <Nav media={media} />
        <SkipNavContent>
          <div id="content">{children}</div>
        </SkipNavContent>
      </div>
    </Fragment>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
