import React, { useRef, useState } from "react";
import { RadioGroup, Radio } from "@reach/radio";
import "./example-styles.css";

let name = "With a Form (TS)";

function Example() {
  let [formData, setFormData] = useState({});
  let formRef = useRef(null);
  return (
    <div>
      When focused on a form input or our custom radio buttons, you should be
      able to press <kbd>Enter</kbd> to submit the form and see its serialized
      data below.
      <hr />
      <form
        ref={formRef}
        onSubmit={event => {
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
          <span id="time-preference">Preferred time</span>
          <RadioGroup aria-labelledby="time-preference" name="time-preference">
            <Radio value="morning">Morning</Radio>
            <Radio value="afternoon">Afternoon</Radio>
            <Radio value="evening">Evening</Radio>
          </RadioGroup>
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

/*

*/

Example.story = { name };
export const Comp = Example;
export default { title: "Radio" };

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
