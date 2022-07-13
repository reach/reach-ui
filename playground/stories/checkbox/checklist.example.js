import * as React from "react";
import { MixedCheckbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

let name = "Checklist";

function Example() {
  const [toppings, setToppings] = React.useState({
    condiments: {
      mayo: true,
      mustard: true,
      ketchup: false,
    },
    veggies: {
      lettuce: true,
      tomato: true,
      sprouts: false,
    },
    meats: {
      turkey: false,
      ham: true,
      pepperoni: false,
    },
  });

  const handleAll = (event) => {
    const { checked, value } = event.target;
    const allTypesChecked = Object.keys(toppings[value]).reduce(
      (state, topping) => ({
        ...state,
        [topping]: checked,
      }),
      {}
    );
    setToppings({
      ...toppings,
      [value]: {
        ...allTypesChecked,
      },
    });
  };

  const getHandler = (type) => (event) => {
    const { checked, value } = event.target;
    setToppings({
      ...toppings,
      [type]: {
        ...toppings[type],
        [value]: checked,
      },
    });
  };

  const allChecked = (type) =>
    Object.values(toppings[type]).every((t) => t)
      ? true
      : Object.values(toppings[type]).some((t) => t)
      ? "mixed"
      : false;

  return (
    <div>
      <h3>Let's build a sandwich</h3>
      <div style={{ display: "flex", flexFlow: "row wrap" }}>
        {Object.keys(toppings).map((type, index, arr) => {
          return (
            <fieldset
              key={type}
              style={{
                margin: 10,
                marginLeft: index === 0 ? 0 : 10,
                marginRight: index === arr.length - 1 ? 0 : 10,
                padding: "1rem 1.5rem 1.5rem",
                width: 400,
                maxWidth: "100%",
              }}
            >
              <label>
                <MixedCheckbox
                  value={type}
                  checked={allChecked(type)}
                  onChange={handleAll}
                />
                <span>All {type}</span>
              </label>
              <fieldset style={{ margin: "1rem 0 0", padding: "1rem 1.5rem" }}>
                <legend>{type}</legend>

                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {Object.entries(toppings[type]).map(([value, state]) => (
                    <li key={value}>
                      <label>
                        <MixedCheckbox
                          name={type}
                          value={value}
                          checked={state}
                          onChange={getHandler(type)}
                        />
                        <span>{value}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}

Example.storyName = name;
export { Example };
