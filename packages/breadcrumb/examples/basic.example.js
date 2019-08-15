import React from "react";
import Breadcrumb from "../src/index";
import "../styles.css";

export let name = "Basic";

export function Example() {
  return (
    <Breadcrumb>
      <a href="/">Home</a>
      <a href="/components">Parent</a>
      <span>Current Page</span>
    </Breadcrumb>
  );
}
