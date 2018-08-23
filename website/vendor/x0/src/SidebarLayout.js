import React from "react";
import PropTypes from "prop-types";
import { Link as RouterLink } from "@reach/router";
import styled from "styled-components";
import {
  Provider as RebassProvider,
  Flex,
  Box,
  Fixed,
  Container,
  Text,
  Close,
  Toolbar,
  Divider,
  Heading,
  NavLink,
  BlockLink,
  Button,
  ButtonTransparent
} from "rebass";
import { borderColor, themeGet } from "styled-system";

// const RouterNavLink = RouterLink
const RouterNavLink = ({
  activeClassName = "active",
  activeStyle,
  style,
  className,
  exact,
  ...props
}) => (
  <RouterLink
    getProps={({ isCurrent, isPartiallyCurrent }) => {
      const isActive = exact ? isCurrent : isPartiallyCurrent;
      if (isActive) {
        return {
          className: [className, activeClassName].join(" "),
          style: { ...style, ...activeStyle }
        };
      } else {
        return { className, style };
      }
    }}
    {...props}
  />
);

const breakpoint = `@media screen and (min-width: 48em)`;

export const Root = styled(Flex)([], {
  minHeight: "100vh"
});

export const Sidebar = styled("div")(
  [],
  {
    width: "256px",
    height: "100vh",
    flex: "none",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    transition: "transform .2s ease-out",
    backgroundColor: "hsl(211, 81%, 36%)",
    color: "white",
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0
  },
  props => ({
    transform: props.open ? "translateX(0)" : "translateX(-100%)",
    [breakpoint]: {
      transform: "none"
    }
  }),
  borderColor
);

export const Overlay = styled("div")([], {
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
});

export const MobileOnly = styled.div([], {
  [breakpoint]: {
    display: "none"
  }
});

export const MenuIcon = ({ size = 24, ...props }) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentcolor"
  >
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);

export const Main = props => (
  <Box {...props} is="main" flex="1 1 auto" w={1} pl={[null, null, 256]} />
);

export const MaxWidth = props => (
  <Container {...props} maxWidth={768} px={4} pt={4} pb={6} />
);

export const Content = styled(Box)([], {
  minHeight: "calc(100vh - 208px)"
});

export const UL = styled("ul")([], {
  listStyle: "none",
  margin: 0,
  paddingLeft: 0,
  paddingBottom: "48px"
});

export const LI = styled("li")([], {});

const depthPad = ({ to = "" }) =>
  (1 +
    to
      .split("/")
      .filter(s => s.length)
      .slice(1).length) *
  16;

const Link = styled(props => (
  <NavLink
    {...props}
    is={RouterNavLink}
    w={1}
    pl={depthPad(props) - 4 + "px"}
  />
))([], props => ({
  borderLeft: "4px solid",
  borderColor: "transparent",
  transition: "color 200ms ease",
  "&:focus,&:active": {
    background: "hsla(211, 81%, 36%, 0.1)"
  },
  "&:hover": {
    color: "hsla(0, 100%, 100%, 0.5)"
  },
  "&.active": {
    background: "hsla(211, 100%, 100%, 0.2)",
    color: "white"
  },
  fontWeight: "200",
  fontSize: "100%"
}));

Link.defaultProps = {
  to: ""
};

const unhyphenate = str => str.replace(/(\w)(-)(\w)/g, "$1 $3");
const upperFirst = str => str.charAt(0).toUpperCase() + str.slice(1);
const format = str => upperFirst(unhyphenate(str));

const NavBar = ({ title, logo, focus, update }) => (
  <Toolbar color="inherit" bg="transparent" borderColor="transparent">
    {logo}
    <Heading px={2} fontSize={1}>
      {title}
    </Heading>
    <Box mx="auto" />
  </Toolbar>
);

export const Nav = ({ routes = [], ...props }) => (
  <React.Fragment>
    <NavBar {...props} />
    <UL>
      {routes.map(route => (
        <LI key={route.key}>
          {/^https?:\/\//.test(route.path) ? (
            <NavLink pl={3} href={route.path}>
              {route.name}
            </NavLink>
          ) : (
            <Link to={route.path} exact>
              {route.props.sidebarName || format(route.name)}
            </Link>
          )}
        </LI>
      ))}
    </UL>
  </React.Fragment>
);

export const Pagination = ({ previous, next }) => (
  <Flex py={4} flexWrap="wrap">
    {previous && (
      <BlockLink py={2} is={RouterLink} to={previous.path}>
        <Text mb={1}>Previous:</Text>
        <Text fontSize={3} fontWeight="bold">
          {format(previous.name)}
        </Text>
      </BlockLink>
    )}
    <Box mx="auto" />
    {next && (
      <BlockLink py={2} is={RouterLink} to={next.path}>
        <Text mb={1}>Next:</Text>
        <Text fontSize={3} fontWeight="bold">
          {format(next.name)}
        </Text>
      </BlockLink>
    )}
  </Flex>
);

const MobileNav = ({ title, logo, update }) => (
  <MobileOnly>
    <div style={{ position: "fixed", top: 0, left: 0, right: 0 }}>
      <Toolbar px={0} color="inherit" bg="#fff">
        <ButtonTransparent
          px={2}
          borderRadius={0}
          m={0}
          mr="auto"
          title="Toggle Menu"
          onClick={e => update(toggle("menu"))}
        >
          {logo || <MenuIcon />}
        </ButtonTransparent>
        <Heading fontSize={1}>Reach UI</Heading>
        <Box width={48} ml="auto" />
      </Toolbar>
      <Divider my={0} />
    </div>
  </MobileOnly>
);

const toggle = key => state => ({ [key]: !state[key] });
const close = state => ({ menu: false });

export default class Layout extends React.Component {
  static propTypes = {
    routes: PropTypes.array.isRequired
  };

  state = {
    menu: false,
    update: fn => this.setState(fn)
  };

  render() {
    const { routes = [], children, route, title = "x0", logo } = this.props;
    const { menu, update } = this.state;

    const opts = route ? route.props : {};
    if (opts.layout === false) return children;
    const Wrapper = opts.fullWidth ? React.Fragment : MaxWidth;

    const index = routes.findIndex(r => r.path === route.path);
    const pagination = {
      previous: routes[index - 1],
      next: routes[index + 1]
    };

    return (
      <React.Fragment>
        <MobileNav title={title} logo={logo} update={update} />

        <Root>
          {menu && <Overlay onClick={e => update(close)} />}
          <Sidebar open={menu} onClick={e => update(close)}>
            <Nav title={title} logo={logo} routes={routes} update={update} />
          </Sidebar>
          <Main tabIndex={menu ? -1 : undefined}>
            <Wrapper>
              <Content>{children}</Content>
              {!opts.hidePagination && <Pagination {...pagination} />}
            </Wrapper>
          </Main>
        </Root>
      </React.Fragment>
    );
  }
}
