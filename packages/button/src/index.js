import React from "react";

const Button = props => {
  const { title } = props;
  return <button type="button">{title}</button>;
};

export default Button;
