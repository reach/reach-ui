import React from "react";

const Button = props => {
  const { title } = props;
  const disabled = props.disabled || false;

  return (
    <button type="button" disabled={disabled}>
      {title}
    </button>
  );
};

export default Button;
