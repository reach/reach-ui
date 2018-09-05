import React from "react";
import Alert from "../src/index";
import Component from "../../component-component/src";
import VisuallyHidden from "../../visually-hidden/src";

export let name = "Basic";

export let Example = () => (
  <Component
    initialState={{
      messages: [],
      bestFriendIsOnline: false
    }}
    didMount={({ setState, state }) => {
      setInterval(() => {
        setState(state => ({
          bestFriendIsOnline: !state.bestFriendIsOnline
        }));
      }, 10000);
    }}
  >
    {({ setState, state }) => (
      <div>
        <h1>Cool Social App</h1>
        <button
          onClick={() => {
            setState(
              state => ({
                messages: state.messages.concat([
                  `Message #${state.messages.length + 1}`
                ])
              }),
              () => {
                setTimeout(() => {
                  setState(state => ({
                    messages: state.messages.slice(1)
                  }));
                }, 5000);
              }
            );
          }}
        >
          Add a message
        </button>
        <div>
          {state.messages.map((message, index) => (
            <Alert type="assertive" key={index}>
              {message}
            </Alert>
          ))}

          <div>
            <VisuallyHidden>
              {state.bestFriendIsOnline ? (
                <Alert key="online">Your best friend is online!</Alert>
              ) : (
                <Alert key="offline">Dang, your best friend is offline.</Alert>
              )}
            </VisuallyHidden>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                background: state.bestFriendIsOnline ? "green" : "red",
                borderRadius: "50%"
              }}
            />{" "}
            Best Friend
          </div>
        </div>
      </div>
    )}
  </Component>
);
