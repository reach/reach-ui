import * as React from "react";
import { CustomCheckbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";
import "./custom-pseduo.css";

let name = "CustomCheckbox with Pseudo Element Styles";

function Example() {
  const [checked, setChecked] = React.useState(false);
  return (
    <div className="example">
      <label>
        <CustomCheckbox
          value="whatever"
          checked={checked}
          onChange={(event) => {
            setChecked(event.target.checked);
          }}
        />
        All pseudos here
      </label>
      <br />
      <label>
        <CustomCheckbox readOnly checked="mixed" value="something-else" />
        Just a lonely mixed box
      </label>
    </div>
  );
}

Example.storyName = name;
export { Example };
