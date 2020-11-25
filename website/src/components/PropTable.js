import * as React from "react";
import { Table } from "./Table";
import VisuallyHidden from "@reach/visually-hidden";

/*
type PropDef = {
  name: string;
  type: string | string[];
  isRequired: boolean;
  defaultValue?: string;
}
*/

export function PropTable({ componentName, propDefs = [], ...tableProps }) {
  const componentSlug = componentName.toLowerCase();
  const propDefsSorted = propDefs.sort((a, b) => {
    let aName = a.name.toUpperCase();
    let bName = b.name.toUpperCase();
    return aName < bName ? -1 : aName > bName ? 1 : 0;
  });
  return (
    <Table {...tableProps} aria-label={`Component props for ${componentName}`}>
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Required</th>
          <th>Default</th>
        </tr>
      </thead>
      <tbody>
        {propDefsSorted.map((prop) => {
          const propAnchor = `#${componentSlug}-${prop.name.toLowerCase()}`;
          return (
            <tr key={prop.name}>
              <td>
                <a href={propAnchor}>
                  <code>{prop.name}</code>
                </a>
              </td>
              <td>
                {(Array.isArray(prop.type) ? prop.type : [prop.type]).map(
                  (pt, i, src) => (
                    <React.Fragment key={pt}>
                      <code key={pt}>{pt}</code>
                      {i !== src.length - 1 ? "|" : null}
                    </React.Fragment>
                  )
                )}
              </td>
              <td>{prop.isRequired.toString()}</td>
              <td>
                {prop.defaultValue != null ? (
                  <code>{prop.defaultValue}</code>
                ) : (
                  <VisuallyHidden>No default value</VisuallyHidden>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
