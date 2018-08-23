import React, { Fragment } from "react";
import { SidebarLayout, ScopeProvider } from "../vendor/x0/components";
import Rect from "../../packages/rect";
import Component from "../../packages/component-component";
import Logo from "../components/Logo";
import ManageScroll from "../components/ManageScroll";

let Title = () => (
  <div style={{ padding: "20px 0px" }}>
    <Logo />
  </div>
);

export default props => (
  <Fragment>
    <ManageScroll />
    <ScopeProvider scope={{ Rect, Component }}>
      <SidebarLayout title={<Title />} {...props} />
    </ScopeProvider>
  </Fragment>
);
