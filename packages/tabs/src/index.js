import React, { Component, Fragment } from "react";
import { arrayOf, bool, func, number, string } from "prop-types";

class Tabs extends Component {
  constructor(props) {
    super(props);
    const tabIds = [],
      panelIds = [];
    props.children.forEach(child => {
      if (child.type.name === "TabBar") {
        child.props.children.forEach(c => {
          tabIds.push(c.props.id);
        });
      } else if (child.type.name === "TabPanels") {
        child.props.children.forEach(c => {
          panelIds.push(c.props.id);
        });
      }
    });
    this.state = { activeIndex: props.activeIndex, tabIds, panelIds };
  }

  render() {
    const { activeIndex, labels, panelIds, tabIds } = this.state;
    const { activeIndex: startingIndex, ...props } = this.props;
    return (
      <div {...props}>
        {React.Children.map(this.props.children, child => {
          if (child.type.name === "TabBar") {
            return React.cloneElement(child, {
              activeIndex,
              onClick: activeIndex => {
                this.setState({ activeIndex });
              },
              panelIds
            });
          } else if (child.type.name === "TabPanels") {
            return React.cloneElement(child, { activeIndex, labels, tabIds });
          }
        })}
      </div>
    );
  }
}

Tabs.propTypes = {
  activeIndex: number
};

Tabs.defaultProps = {
  activeIndex: 0
};

let TabBar = ({ activeIndex, onClick, panelIds, ...props }) => {
  const maxIndex = React.Children.count(props.children);

  return (
    <ul role="tablist" {...props}>
      {React.Children.map(props.children, (child, index) =>
        React.cloneElement(child, {
          active: index === activeIndex,
          onClick: () => onClick(index),
          onNextTab: index < maxIndex ? () => onClick(index + 1) : () => {},
          onPreviousTab: index > 0 ? () => onClick(index - 1) : () => {},
          panelId: panelIds[index]
        })
      )}
    </ul>
  );
};

TabBar.propTypes = {
  activeIndex: number.isRequired,
  onClick: func.isRequired,
  panelIds: arrayOf(string).isRequired
};

class Tab extends Component {
  constructor() {
    super();
    this.state = {};
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.active && this.props.active) {
      this.tab.focus();
    }
  }

  onKeyDown(e) {
    if (e.keyCode === 37 || e.keyCode === 38) {
      this.props.onPreviousTab();
    } else if (e.keyCode === 39 || e.keyCode === 40) {
      this.props.onNextTab();
    }
  }

  render() {
    const {
      active,
      onClick,
      onKeyDown,
      onNextTab,
      onPreviousTab,
      panelId,
      ...props
    } = this.props;
    return (
      <li role="presentation">
        <a
          {...props}
          aria-controls={panelId}
          aria-selected={active}
          onClick={onClick}
          onKeyDown={this.onKeyDown}
          ref={tab => (this.tab = tab)}
          role="tab"
          tabIndex={active ? 0 : -1}
        >
          {props.children}
        </a>
      </li>
    );
  }
}

Tab.propTypes = {
  id: string.isRequired,
  active: bool.isRequired,
  onKeyDown: func.isRequired,
  onNextTab: func.isRequired,
  onPreviousTab: func.isRequired,
  panelId: string.isRequired
};

let TabPanels = ({ activeIndex, tabIds, ...props }) => {
  if (!props.children[activeIndex].props.id) {
    console.error(
      "Warning: The prop 'id' is marked as required for every TabPanel"
    );
  }

  return (
    <Fragment>
      {React.cloneElement(props.children[activeIndex], {
        "aria-labelledby": tabIds[activeIndex],
        role: "tabpanel"
      })}
    </Fragment>
  );
};

TabPanels.propTypes = {
  activeIndex: number.isRequired,
  tabIds: arrayOf(string).isRequired
};

export { Tabs, TabBar, Tab, TabPanels };
