import React from "react";
import Breadcrumb from "../src/index";
import "../styles.css";

export let name = "Custom Separator";

export function Example() {
  return (
    <Breadcrumb separator="➤">
      <a href="/">Home</a>
      <a href="/components">Parent</a>
      <span>Current Page</span>
    </Breadcrumb>
  );
}
