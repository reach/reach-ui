import * as React from "react";
import { CustomCheckbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

let name = "CustomCheckbox Group";

let checkSmileys = {
  true: "😃",
  mixed: "😐",
  false: "🙁",
};

function Example() {
  return (
    <CheckboxGroup
      name="feels"
      label="Toggle all my friends"
      legend="How are my friends feeling?"
    >
      <CheckboxLegend>My Friends</CheckboxLegend>
      <FriendCheckbox name="sharon">Sharon</FriendCheckbox>
      <FriendCheckbox name="javier" defaultChecked>
        Javier
      </FriendCheckbox>
      <FriendCheckbox name="mike">Mike</FriendCheckbox>
      <FriendCheckbox name="jessie" defaultChecked>
        Jessie
      </FriendCheckbox>
    </CheckboxGroup>
  );
}

Example.storyName = name;
export { Example };

////////////////////////////////////////////////////////////////////////////////

const GroupContext = React.createContext({});

function CheckboxGroup({ name, label, legend, children }) {
  const [state, dispatch] = React.useReducer(reducer, { boxes: {} });

  return (
    <GroupContext.Provider value={{ groupName: name, state, dispatch }}>
      <fieldset
        style={{
          padding: "1rem 1.5rem 1.5rem",
          width: 400,
          maxWidth: "100%",
          borderRadius: 6,
        }}
      >
        <CheckboxLegend>{legend}</CheckboxLegend>
        <SmileyCheckbox
          id={`box-group-${name}`}
          value={name}
          checked={
            Object.values(state.boxes).every((t) => t)
              ? true
              : Object.values(state.boxes).some((t) => t)
              ? "mixed"
              : false
          }
          onChange={(event) =>
            dispatch({
              type: "CLICK_GROUP_BOX",
              payload: { event },
            })
          }
        >
          {label}
        </SmileyCheckbox>
        <fieldset
          style={{
            margin: "1rem 0 0",
            padding: "1rem 1.5rem",
            borderRadius: 3,
          }}
        >
          {children}
        </fieldset>
      </fieldset>
    </GroupContext.Provider>
  );
}

function SmileyCheckbox({ checked, children, id, ...props }) {
  return (
    <span style={{ display: "flex", alignItems: "center", margin: "0.5rem 0" }}>
      <CustomCheckbox
        id={id}
        style={{
          background:
            checked === true
              ? "springgreen"
              : checked === "mixed"
              ? "goldenrod"
              : "rgba(240, 240, 250, 0.8)",
          border: "2px solid rgba(0, 0, 0, 0.8)",
          borderRadius: "3px",
          height: 26,
          width: 26,
        }}
        checked={checked}
        {...props}
      >
        <span
          aria-hidden
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            height: 16,
            width: 16,
            zIndex: 10,
            position: "absolute",
            lineHeight: 1,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          {checkSmileys[String(checked)]}
        </span>
      </CustomCheckbox>
      <label htmlFor={id}>{children}</label>
    </span>
  );
}

function FriendCheckbox({ name, defaultChecked = false, children, ...props }) {
  const { state, dispatch } = React.useContext(GroupContext);
  const isRegistered = Object.hasOwnProperty.call(state.boxes, name);
  const checked = isRegistered ? state.boxes[name] : defaultChecked;

  React.useLayoutEffect(() => {
    if (!isRegistered) {
      dispatch({
        type: "REGISTER_BOX",
        payload: { name, checked: defaultChecked },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultChecked, isRegistered, name]);

  return (
    <div>
      <SmileyCheckbox
        id={`box-${name}`}
        name={name}
        checked={checked}
        onChange={(event) =>
          dispatch({
            type: "CLICK_BOX",
            payload: { name, event },
          })
        }
        {...props}
      >
        {children}
      </SmileyCheckbox>
    </div>
  );
}

function CheckboxLegend({ children }) {
  return (
    <legend
      style={{
        textTransform: "uppercase",
        fontSize: 12,
        letterSpacing: 1,
        fontWeight: 800,
      }}
    >
      {children}
    </legend>
  );
}

function reducer(state, action = {}) {
  const { type: actionType, payload = {} } = action;
  const { event } = payload;
  let groupChecked;
  switch (actionType) {
    case "REGISTER_BOX":
      return {
        ...state,
        boxes: {
          ...state.boxes,
          [payload.name]: payload.checked || false,
        },
      };
    case "CLICK_BOX":
      return {
        ...state,
        boxes: {
          ...state.boxes,
          [payload.name]: event.target.checked,
        },
      };
    case "CLICK_GROUP_BOX":
      groupChecked = event.target.checked;
      return {
        ...state,
        boxes: {
          ...Object.keys(state.boxes).reduce((prev, cur) => {
            return {
              ...prev,
              [cur]: !!groupChecked,
            };
          }, {}),
        },
      };
    default:
      return state;
  }
}
