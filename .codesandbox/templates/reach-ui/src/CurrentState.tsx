import * as React from "react";

export const CurrentState = (props: any) => (
  <div className="CurrentState">
    <h3>Current State</h3>
    <pre
      style={{
        fontSize: ".65rem",
        padding: ".5rem",
      }}
    >
      <strong>props</strong> = {JSON.stringify(props, null, 2)}
    </pre>
  </div>
);

export default CurrentState;
