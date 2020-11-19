import * as React from "react";
import { Note } from "./Note";

export function AsPropWarning() {
  return (
    <Note>
      <p>
        <strong>NOTE:</strong> Many semantic elements, such as{" "}
        <code>button</code> elements, have meaning to assistive devices and
        browsers that provide context for the user and, in many cases, provide
        or restrict interactive behaviors. Use caution when overriding our
        defaults and make sure that the element you choose to render provides
        the same experience for all users.
      </p>
    </Note>
  );
}
