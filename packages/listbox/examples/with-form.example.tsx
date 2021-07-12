import * as React from "react";
import { Listbox, ListboxOption } from "@reach/listbox";
import { action } from "@storybook/addon-actions";
import { Taco } from "./common";

// TODO: Need to check out moving focus on iOS in a form
// https://twitter.com/HipsterSmoothie/status/1237522273902313472

let name = "With a Form (TS)";

function Example() {
  let [formData, setFormData] = React.useState({});
  let formRef = React.useRef(null);
  return (
    <div>
      When focused on a form input or our custom listbox inside of a form, you
      should be able to press <kbd>Enter</kbd> to submit the form and see its
      serialized data below.
      <hr />
      <form
        ref={formRef}
        onSubmit={(event) => {
          event.preventDefault();
          let data = formToJSON(formRef.current);
          setFormData(data);
        }}
      >
        <div>
          <label>
            First Name
            <input type="text" name="first_name" />
          </label>
        </div>
        <div>
          <label>
            Last Name
            <input type="text" name="last_name" />
          </label>
        </div>
        <div>
          <span id="taco-label">Choose a taco</span>
          <Listbox
            aria-labelledby="taco-label"
            defaultValue="none"
            onChange={action("value changed")}
            name="taco"
          >
            <ListboxOption value="none" disabled>
              --
            </ListboxOption>
            <ListboxOption value="asada">
              Carne Asada <Taco />
            </ListboxOption>
            <ListboxOption value="pollo">
              Pollo <Taco />
            </ListboxOption>
            <ListboxOption value="pastor">
              Pastor <Taco />
            </ListboxOption>
            <ListboxOption value="lengua">
              Lengua <Taco />
            </ListboxOption>
          </Listbox>
        </div>
        <div>
          <button>Submit</button>
        </div>
      </form>
      <hr />
      <h3>Submission</h3>
      <pre>{JSON.stringify(formData)}</pre>
    </div>
  );
}

Example.storyName = name;
export { Example };

function formToJSON(form: any) {
  let field;
  let output: any = {};
  if (typeof form == "object" && form.nodeName === "FORM") {
    let len = form.elements.length;
    for (let i = 0; i < len; i++) {
      field = form.elements[i];
      if (
        field.name &&
        !field.disabled &&
        field.type !== "file" &&
        field.type !== "reset" &&
        field.type !== "submit" &&
        field.type !== "button"
      ) {
        if (field.type === "select-multiple") {
          for (let j = form.elements[i].options.length - 1; j >= 0; j--) {
            if (field.options[j].selected && field.options[j].value) {
              output[String(field.name)] = field.options[j].value;
            }
          }
        } else if (
          ((field.type !== "checkbox" && field.type !== "radio") ||
            field.checked) &&
          field.value
        ) {
          output[String(field.name)] = field.value;
        }
      }
    }
  }
  return output;
}
