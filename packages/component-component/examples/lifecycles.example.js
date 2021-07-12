import * as React from "react";
import Component from "@reach/component-component";

let name = "Lifecycles and Refs";

function Example() {
  const [position, setPosition] = React.useState(900);
  return (
    <div>
      <p>
        <label>
          Change Scroll Position: {position}
          <br />
          <input
            type="range"
            min="0"
            max="1800"
            value={position}
            style={{ width: "100%" }}
            onChange={(event) => setPosition(event.target.value)}
          />
        </label>
      </p>
      <Component
        refs={{ node: null }}
        didMount={({ refs }) => {
          refs.node.scrollTop = parseInt(position, 10);
        }}
        didUpdate={({ refs }) => {
          refs.node.scrollTop = parseInt(position, 10);
        }}
      >
        {({ refs }) => (
          <div
            ref={(node) => (refs.node = node)}
            style={{ height: 200, overflow: "auto" }}
            onScroll={(event) => {
              setPosition(event.target.scrollTop);
            }}
          >
            <div
              style={{
                height: 2000,
                backgroundImage: `
                    linear-gradient(217deg, rgba(255,0,0,.8), rgba(255,0,0,0) 70.71%),
                    linear-gradient(127deg, rgba(0,255,0,.8), rgba(0,255,0,0) 70.71%),
                    linear-gradient(336deg, rgba(0,0,255,.8), rgba(0,0,255,0) 70.71%)
                  `,
              }}
            />
          </div>
        )}
      </Component>
    </div>
  );
}

Example.storyName = name;
export { Example };
