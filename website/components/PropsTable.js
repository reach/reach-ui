import React from "react";
import PropTypes from "prop-types";

let findType = type => {
  return Object.keys(PropTypes).find(key => {
    return PropTypes[key] === type;
  });
};

export default ({ of }) => (
  <table>
    {Object.keys(of.propTypes).map(key => (
      <tr>
        <td>{key}</td>
        <td>{findType(of.propTypes[key])}</td>
      </tr>
    ))}
  </table>
);
