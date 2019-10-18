import React from "react";
import { Checkbox, CheckboxGroup } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

export const name = "Checklist";

export function Example() {
  const [toppings, setToppings] = React.useState({
    condiments: {
      mayo: true,
      mustard: true,
      ketchup: false
    },
    veggies: {
      lettuce: true,
      tomato: true,
      sprouts: false
    },
    meats: {
      turkey: true,
      ham: true,
      pepperoni: false
    }
  });

  const handleAll = event => {
    const { checked, value } = event.target;
    const allTypesChecked = Object.keys(
      toppings[Object.keys(toppings).find(key => key === value)]
    ).reduce(
      (state, topping) => ({
        ...state,
        [topping]: checked
      }),
      {}
    );
    setToppings({
      ...toppings,
      [value]: {
        ...allTypesChecked
      }
    });
  };

  const getHandler = type => event => {
    const { checked, value } = event.target;
    setToppings({
      ...toppings,
      [type]: {
        ...toppings[type],
        [value]: checked
      }
    });
  };

  const allChecked = type =>
    Object.values(toppings[type]).every(t => t)
      ? true
      : Object.values(toppings[type]).some(t => t)
      ? "mixed"
      : false;

  return (
    <div>
      <h3>Let's build a sandwich</h3>
      {Object.keys(toppings).map(type => {
        return (
          <fieldset key={type} style={{ marginBottom: 20 }}>
            <Checkbox
              as="div"
              value={type}
              label={`All ${type}`}
              checked={allChecked(type)}
              onChange={handleAll}
            />
            <CheckboxGroup
              name={type}
              checkedStates={toppings[type]}
              onChange={getHandler(type)}
            >
              {({ checkedStates }) => (
                <ul>
                  {Object.entries(checkedStates).map(([value, state]) => (
                    <li key={value}>
                      <Checkbox value={value} label={value} checked={state} />
                    </li>
                  ))}
                </ul>
              )}
            </CheckboxGroup>
          </fieldset>
        );
      })}
    </div>
  );
}
