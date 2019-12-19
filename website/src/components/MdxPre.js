import React, {
  Component,
  createContext,
  Fragment,
  useCallback,
  useContext,
  useReducer,
  useLayoutEffect
} from "react";
import Highlight, { Prism } from "prism-react-renderer";
// import oceanicNextTheme from "prism-react-renderer/themes/oceanicNext";
// import CopyButton from "./CopyButton";

/*
 * We need to transpile code extracted from mdx before we try to eval it.
 * babel/standalone is HUGE, buble is smaller and this buble fork is even
 * smaller. We can always switch if we run into issues in the future but this
 * works pretty well AFAICT.
 */
import { transform as bubleTransform } from "@philpl/buble";

const CodeContext = createContext();

export function PreComponent({ children, scope, ...props }) {
  const language = children?.props?.className.replace("language-", "") || null;
  const code = children?.props?.children.trim();

  // TODO: Change this and react-live classnames
  const isDemo = language === "jsx-live";
  return code ? (
    <div className="react-live">
      <CodeProvider
        // theme={oceanicNextTheme}
        theme={{ plain: {}, styles: [] }}
        code={code}
        language={isDemo ? "jsx" : language}
        scope={scope}
      >
        <CodeBlock className="react-live-editor" />
        {isDemo && (
          <Fragment>
            <CodeError className="react-live-error" />
            <CodePreview className="react-live-preview" />
          </Fragment>
        )}
      </CodeProvider>
    </div>
  ) : (
    <pre {...props}>{children}</pre>
  );
}

////////////////////////////////////////////////////////////////////////////////
const ERROR = "ERROR";
const READY = "READY";

const SET_ERROR = "SET_ERROR";
const SET_ELEMENT = "SET_ELEMENT";

function providerReducer(data, action = {}) {
  const { type: actionType, context } = action;
  switch (actionType) {
    case SET_ERROR:
      return {
        state: ERROR,
        context: context.toString()
      };
    case SET_ELEMENT:
      return {
        state: READY,
        context
      };
    default:
      return data;
  }
}

export function CodeProvider({
  children,
  code = "",
  language = "jsx",
  scope,
  theme
}) {
  let [{ state, context }, dispatch] = useReducer(providerReducer, {
    state: null,
    context: null
  });

  const transpile = useCallback(function(code, scope) {
    const input = { code, scope };

    try {
      const element = generateElement(input, handleError);
      dispatch({
        type: SET_ELEMENT,
        context: element
      });
    } catch (error) {
      handleError(error);
    }
  }, []);

  function handleError(error) {
    dispatch({ type: SET_ERROR, context: error });
  }

  useLayoutEffect(() => {
    transpile(code, scope);
  }, [code, scope, transpile]);

  return (
    <CodeContext.Provider
      value={{
        element: state === READY ? context : null,
        error: state === ERROR ? context : null,
        language,
        code,
        theme
      }}
    >
      {children}
    </CodeContext.Provider>
  );
}

function CodeBlock({ style = {}, ...props }) {
  let { code, language, theme } = useContext(CodeContext);

  return (
    <div {...props}>
      {/* <h4
        style={{
          position: "absolute",
          top: 10,
          margin: 0,
          left: "50%",
          transform: "translateX(-50%)",
          textTransform: "uppercase",
          fontSize: "0.85rem",
          letterSpacing: "0.5px"
        }}
      >
        Code Example
      </h4>
      <CopyButton
        string={code}
        style={{
          position: "absolute",
          top: 10,
          right: 10
        }}
      /> */}
      <Highlight Prism={Prism} code={code} theme={theme} language={language}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre
            style={{
              maxWidth: "100%",
              overflowX: "auto",
              margin: 0,
              padding: 0
            }}
          >
            {tokens.map((line, key) => {
              const lineProps = getLineProps({ line, key });
              return (
                <span
                  {...lineProps}
                  style={{ ...(lineProps.style || {}), display: "block" }}
                >
                  {line.map((token, key) => (
                    <span {...getTokenProps({ token, key })} />
                  ))}
                </span>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

function CodeError({ ...props }) {
  const { error } = useContext(CodeContext);
  return (
    error && (
      <div {...props}>
        <pre>{error}</pre>
      </div>
    )
  );
}

function CodePreview({ ...props }) {
  const { element: Element } = useContext(CodeContext);
  return (
    Element && (
      <div {...props}>
        <Element />
      </div>
    )
  );
}

////////////////////////////////////////////////////////////////////////////////

// If we need polyfills for the preview they can go here
const _polyfills = {};

// https://github.com/FormidableLabs/react-live/blob/master/src/utils/transpile
function evalCode(code, scope) {
  const [scopeKeys, scopeValues] = Object.entries(scope).reduce(
    (acc, cur) => [
      [...acc[0], cur[0]],
      [...acc[1], cur[1]]
    ],
    [[], []]
  );
  // eslint-disable-next-line no-new-func
  const res = new Function("_polyfills", "React", ...scopeKeys, code);
  return res(_polyfills, React, ...scopeValues);
}

// https://github.com/FormidableLabs/react-live/blob/master/src/utils/transpile/index.js#L5
function generateElement({ code = "", scope = {} }, errorCallback) {
  // NOTE: Remove trailing semicolon to get an actual expression.
  const codeTrimmed = code.trim().replace(/;$/, "");

  // NOTE: Workaround for classes and arrow functions.
  const transformed = transform(`return (${codeTrimmed})`).trim();
  return errorBoundary(evalCode(transformed, scope), errorCallback);
}

// Keep errors isolated and callback to our provider with the output
function errorBoundary(Element, callback) {
  return class ErrorBoundary extends Component {
    componentDidCatch(error) {
      callback(error);
    }

    render() {
      return typeof Element === "function" ? <Element /> : Element;
    }
  };
}

function transform(input) {
  const { code } = bubleTransform(input, {
    // objectAssign: "_polyfills.assign",
    transforms: {
      dangerousForOf: true,
      dangerousTaggedTemplateString: true
    }
  });
  return code;
}
