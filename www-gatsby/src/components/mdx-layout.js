import "../../../packages/menu-button/styles.css";
import "./normalize.css";
import "./skeleton.css";
import "./syntax.css";
import "./app.css";

import React from "react";
import {
  LiveProvider,
  LiveEditor,
  LiveError,
  LivePreview
} from "react-live";
import { MDXProvider } from "@mdx-js/tag";
import Layout from "./layout";

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
import VisuallyHidden from "../../../packages/visually-hidden/src";

const PreComponent = ({ className, ...props }) =>
  props.children.props.props &&
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
        MenuLink,
        VisuallyHidden
      }}
    >
      <LiveEditor tabIndex="-1" />
      <LiveError />
      <LivePreview />
    </LiveProvider>
  ) : (
    <pre {...props} className="WHAT_THE_CRAP" />
  );

const Table = props => (
  <table className="u-full-width" {...props} />
);

let firstLoad = true;

export default class MyPageLayout extends React.Component {
  componentDidMount() {
    if (firstLoad) {
      firstLoad = false;
    } else {
      this.node.focus();
    }
  }

  render() {
    return (
      <Layout>
        <MDXProvider
          components={{ pre: PreComponent, table: Table }}
        >
          <main
            ref={n => (this.node = n)}
            tabIndex="-1"
            style={{ outline: "none" }}
            role="group"
          >
            {this.props.children}
          </main>
        </MDXProvider>
      </Layout>
    );
  }
}
