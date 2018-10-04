import React from "react";
import Component from "../src/index";

export let name = "Kitchen Sink Todo List";

export let Example = () => (
  <Component
    getRefs={() => ({
      input: null
    })}
    getInitialState={() => ({
      todos: JSON.parse(
        localStorage.getItem("todos") || '["quit making weird components"]'
      )
    })}
  >
    {({ state, setState, refs }) => (
      <React.Fragment>
        <Component
          didUpdate={() =>
            localStorage.setItem("todos", JSON.stringify(state.todos))
          }
        />
        <Component
          didMount={() => (document.title = state.todos.length + " Todos")}
          didUpdate={() => (document.title = state.todos.length + " Todos")}
        />
        <div style={{ fontFamily: "sans-serif" }}>
          <h1>Todo List</h1>
          <form
            onSubmit={event => {
              event.preventDefault();
              let node = refs.input;
              setState({ todos: state.todos.concat([node.value]) });
              node.value = "";
            }}
          >
            <input ref={n => (refs.input = n)} />
          </form>
          <ul>
            {state.todos.map((todo, index) => (
              <Component
                key={index}
                initialState={{ hue: Math.random() * 360 }}
                todo={todo}
                shouldUpdate={({ nextProps, nextState, props, state }) => {
                  return (
                    nextProps.todo !== props.todo || nextState.hue !== state.hue
                  );
                }}
              >
                {({ setState, state }) => (
                  <li style={{ color: `hsl(${state.hue}, 50%, 50%)` }}>
                    {todo}{" "}
                    <button
                      onClick={() => {
                        setState({ hue: Math.random() * 360 });
                      }}
                    >
                      Change Color
                    </button>
                  </li>
                )}
              </Component>
            ))}
          </ul>
          <p>
            <button onClick={() => setState({ todos: [] })}>
              Clear all todos
            </button>
          </p>
        </div>
      </React.Fragment>
    )}
  </Component>
);
