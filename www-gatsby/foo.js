(() => {
  class App extends React.Component {
    constructor() {
      super();
      this.focusRefs = {
        screen1: React.createRef(),
        screenTwoButton: React.createRef()
      };

      this.state = {
        screen: 1
      };
    }

    render() {
      return this.state.screen === 1 ? (
        <div ref={this.focusRefs.screen1} tabIndex="-1">
          <h4>Screen One</h4>
          <Menu>
            <MenuButton>Actions</MenuButton>
            <MenuItems>
              <MenuItem
                onSelect={() => {
                  setState({ screen: 2 }, () => {
                    this.focusRefs.screenTwoButton.current.focus();
                  });
                }}
              >
                Go to screen 2
              </MenuItem>
              <MenuItem onSelect={() => {}}>
                Do nothing
              </MenuItem>
            </MenuItems>
          </Menu>
          <Menu />
        </div>
      ) : this.state.screen === 2 ? (
        <div>
          <h4>Screen 2</h4>
          <button
            ref={this.focusRefs.screenTwoButton}
            onClick={() => {
              setState({ screen: 1 }, () =>
                this.focusRefs.screen1.current.focus()
              );
            }}
          >
            Back to screen 1
          </button>
        </div>
      ) : null;
    }
  }

  return <App />;
})();
