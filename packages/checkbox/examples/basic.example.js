import React from "react";
import { Checkbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

export const name = "Basic";

export function Example() {
  return (
    <div>
      <Checkbox
        value="plain-jane-input"
        label="This is a plain input"
        name="Ok"
      />
      <Checkbox
        as="div"
        label="This is a div"
        value="whatever"
        name="whatever"
      />
      <Checkbox
        checked="mixed"
        readOnly
        value="readonly"
        name="readonly"
        label="Mixed + read only"
      />
    </div>
  );
}
