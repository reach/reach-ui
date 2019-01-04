import React from "react";
import Rect from "../src/index";

export let name = "Pin element to another";

export class Example extends React.Component {
  state = { pin: true };

  render() {
    return (
      <div>
        <p>
          <button onClick={() => this.setState(state => ({ pin: !state.pin }))}>
            {this.state.pin ? "Stop Pinning" : "Start Pinning"}
          </button>
        </p>
        <Rect observe={this.state.pin}>
          {({ ref, rect }) => (
            <div>
              <textarea defaultValue="resize this" />
              <span
                ref={ref}
                contentEditable
                dangerouslySetInnerHTML={{
                  __html: "Observing my rect, I'm also editable"
                }}
                style={{
                  display: "inline-block",
                  padding: 10,
                  margin: 10,
                  border: "solid 1px",
                  background: "#f0f0f0"
                }}
              />{" "}
              {rect && (
                <div
                  style={{
                    padding: 10,
                    color: "white",
                    opacity: this.state.pin ? 1 : 0.25,
                    background: "red",
                    borderRadius: "50%",
                    position: "absolute",

                    // here we use the rect information
                    // to pin the div to the span
                    left: rect.left + rect.width + "px",
                    top: rect.top + "px"
                  }}
                >
                  Pinned
                </div>
              )}
            </div>
          )}
        </Rect>
      </div>
    );
  }
}
