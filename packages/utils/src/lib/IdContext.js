import React from "react";

// most things that we auto-id aren't server rendered, and are rendered into
// portals anyway, so we can get away with random ids in a default context. If
// people need to server render with auto-ids, they can wrap their app in an
// IdProvider
let genId = () =>
  Math.random()
    .toString(32)
    .substr(2, 6);

let IdContext = React.createContext(genId);

// Apps can wrap their app in this to get the same IDs on the server and the
// client
class Provider extends React.Component {
  id = 0;

  genId = () => {
    return ++this.id;
  };

  render() {
    return (
      <IdContext.Provider value={this.genId}>
        {this.props.children}
      </IdContext.Provider>
    );
  }
}

let { Consumer } = IdContext;

export { Provider, Consumer };
