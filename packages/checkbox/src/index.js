import React from "react";
import PropTypes from "prop-types";

class Checkbox extends React.Component {
  state = {
    checked: this.props.checked
  };

  handleChange = e => {
    const { onChange } = this.props;
    this.setState(
      prevState => ({
        checked: !prevState.checked
      }),
      () => {
        onChange(e, {
          ...this.props,
          checked: this.state.checked
        });
      }
    );
  };

  render() {
    const { checked } = this.state;
    const { label, disabled } = this.props;
    return (
      <label>
        <input
          type="checkbox"
          disabled={disabled}
          checked={checked}
          onChange={this.handleChange}
        />
        <span>{label}</span>
      </label>
    );
  }
}

Checkbox.defaultProps = {
  checked: false,
  disabled: false
};

Checkbox.propTypes = {
  checked: PropTypes.bool,

  disabled: PropTypes.bool,

  label: PropTypes.string.isRequired
};

export default Checkbox;
