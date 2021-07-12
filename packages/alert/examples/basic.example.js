import * as React from "react";
import { Alert } from "@reach/alert";
import { usePrevious } from "@reach/utils/use-previous";
import { VisuallyHidden } from "@reach/visually-hidden";
import LoremIpsum from "./LoremIpsum.js";

let name = "Basic";

function Example() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { messages, messageCount, bestFriendIsOnline } = state;
  const interval = React.useRef(null);

  React.useEffect(() => {
    interval.current = setInterval(() => {
      dispatch({ type: "TOGGLE_BEST_FRIEND" });
    }, getRandomInt(6000, 10000));
    return () => clearInterval(interval.current);
  }, []);

  useMessageTimeout(messages, () => dispatch({ type: "CLEAR_OLDEST_MESSAGE" }));

  return (
    <div>
      <h1>Cool Social App</h1>
      <button
        onClick={() =>
          dispatch({
            type: "ADD_MESSAGE",
            payload: `${messageCount + 1}. ${lipsum.generate(
              getRandomInt(10, 16)
            )}`,
          })
        }
      >
        Add a message
      </button>
      <div>
        {messages.map((message, index) => (
          <Alert type="assertive" key={index}>
            {message}
          </Alert>
        ))}

        <div>
          <VisuallyHidden>
            {bestFriendIsOnline ? (
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
              background: bestFriendIsOnline ? "green" : "red",
              borderRadius: "50%",
            }}
          />{" "}
          Best Friend {bestFriendIsOnline ? "Online" : "Offline"}
        </div>
      </div>
    </div>
  );
}

Example.storyName = name;
export { Example };

////////////////////////////////////////////////////////////////////////////////

const lipsum = new LoremIpsum();
const initialState = {
  messages: [],
  messageCount: 0,
  bestFriendIsOnline: false,
};

function reducer(state = {}, action) {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messageCount: state.messageCount + 1,
        messages: [...state.messages, action.payload],
      };
    case "CLEAR_OLDEST_MESSAGE":
      return {
        ...state,
        messages: state.messages.slice(1),
      };
    case "TOGGLE_BEST_FRIEND":
      return {
        ...state,
        bestFriendIsOnline: !state.bestFriendIsOnline,
      };
    default:
      return state;
  }
}

function useMessageTimeout(messages, callback, time = 5000) {
  const timeouts = React.useRef([]);
  const lastMessageCount = usePrevious(messages.length);
  React.useEffect(() => {
    if (messages.length && lastMessageCount < messages.length) {
      timeouts.current.push(window.setTimeout(callback, time));
    }
  }, [messages, lastMessageCount, callback, time]);

  React.useEffect(() => {
    const allTimeouts = timeouts.current;
    return () => {
      allTimeouts.forEach(window.clearTimeout);
    };
  }, []);
}

function getRandomInt(min = 1, max = 100) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
