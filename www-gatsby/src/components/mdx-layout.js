import React from "react";
import {
  LiveProvider,
  LiveEditor,
  LiveError,
  LivePreview
} from "react-live";
import { MDXProvider } from "@mdx-js/tag";
import GatsbyLink from "gatsby-link";
import Component from "../../../packages/component-component/src";
import Rect from "../../../packages/rect/src";
import WindowSize from "../../../packages/window-size/src";
import Portal from "../../../packages/portal/src";
import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuLink
} from "../../../packages/menu-button/src";

const PreComponent = props =>
  props.children.props.props.className ===
  "language-.jsx" ? (
    <LiveProvider
      mountStylesheet={false}
      code={props.children.props.children}
      scope={{
        GatsbyLink,
        Component,
        Rect,
        WindowSize,
        Portal,
        Menu,
        MenuList,
        MenuButton,
        MenuItem,
        MenuLink
      }}
    >
      <LiveEditor tabIndex="-1" />
      <LiveError />
      <LivePreview />
    </LiveProvider>
  ) : (
    <pre {...props} />
  );

const Table = props => (
  <table className="u-full-width" {...props} />
);

export default class MyPageLayout extends React.Component {
  render() {
    return (
      <div
        style={{
          padding: 20,
          maxWidth: 800,
          margin: "auto"
        }}
      >
        <MDXProvider
          components={{ pre: PreComponent, table: Table }}
        >
          <div>{this.props.children}</div>
        </MDXProvider>
      </div>
    );
  }
}
