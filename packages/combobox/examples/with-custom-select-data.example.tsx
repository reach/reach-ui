import * as React from "react";
import {
  Combobox as ReachCombobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption as ReachComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import { useCityMatch } from "./utils";
import "@reach/combobox/styles.css";

import type {
  ComboboxProps as ReachComboboxProps,
  ComboboxOptionProps as ReachComboboxOptionProps,
} from "@reach/combobox";

let name = "With Custom onSelect Data (TS)";

function Example() {
  let [term, setTerm] = React.useState("");
  let results = useCityMatch(term);

  const handleChange = (event: any) => {
    setTerm(event.target.value);
  };

  return (
    <div>
      <h2>Clientside Search</h2>
      <Combobox
        aria-label="choose a city"
        onSelect={(_, data) =>
          alert(
            `${data.city} is located in the state of ${data.state} ${data.comment}`
          )
        }
      >
        <ComboboxInput
          name="awesome"
          onChange={handleChange}
          style={inputStyle}
        />
        {results && (
          <ComboboxPopover style={popupStyle}>
            <p>
              <button>Hi</button>
            </p>
            <ComboboxList>
              {results.slice(0, 10).map((result, index) => (
                <ComboboxOption
                  key={index}
                  value={`${result.city}, ${result.state}`}
                  selectData={{
                    city: result.city,
                    state: result.state,
                    comment: "and it's beautiful!",
                  }}
                />
              ))}
            </ComboboxList>
          </ComboboxPopover>
        )}
      </Combobox>
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Combobox" };

////////////////////////////////////////////////////////////////////////////////

const ComboboxContext = React.createContext<ComboboxContextValue>({} as any);

function Combobox({ onSelect: onSelectProp, ...props }: ComboboxProps) {
  const {
    addOptionData,
    getOptionData,
    removeOptionData,
  } = useOptionDataFactory();

  const onSelectRef = React.useRef(onSelectProp);
  React.useEffect(() => {
    onSelectRef.current = onSelectProp;
  });

  const onSelect = React.useCallback(
    function onSelect(value: string) {
      onSelectRef.current?.(value, getOptionData(value));
    },
    [getOptionData]
  );

  const context: ComboboxContextValue = React.useMemo(
    () => ({
      addOptionData,
      getOptionData,
      removeOptionData,
      onSelect,
    }),
    [onSelect, addOptionData, getOptionData, removeOptionData]
  );

  return (
    <ComboboxContext.Provider value={context}>
      <ReachCombobox {...props} as="div" onSelect={onSelect} />
    </ComboboxContext.Provider>
  );
}

function ComboboxOption({ selectData, ...props }: ComboboxOptionProps) {
  const { addOptionData, removeOptionData } = React.useContext(ComboboxContext);
  React.useEffect(() => {
    addOptionData(props.value, selectData);
    return () => removeOptionData(props.value);
  }, [props.value, selectData, addOptionData, removeOptionData]);

  return <ReachComboboxOption {...props} as="li" />;
}

interface ComboboxDOMProps
  extends Omit<
    React.ComponentPropsWithoutRef<"div">,
    keyof ReachComboboxProps
  > {}

interface ComboboxOptionDOMProps
  extends Omit<
    React.ComponentPropsWithoutRef<"li">,
    keyof ReachComboboxOptionProps
  > {}

interface ComboboxProps extends ReachComboboxProps, ComboboxDOMProps {
  onSelect?(value: string, data?: any): void;
}

interface ComboboxOptionProps
  extends ReachComboboxOptionProps,
    ComboboxOptionDOMProps {
  /**
   * Custom data that will be passed to the `onSelect` of the `Combobox` as a
   * second argument.
   */
  selectData?: any;
}

const inputStyle = {
  width: 400,
  fontSize: "100%",
  padding: "0.33rem",
};

const popupStyle = {
  boxShadow: "0px 2px 6px hsla(0, 0%, 0%, 0.15)",
  border: "none",
};

/**
 * Uses a ref object which stores the index as a key and custom data as value
 * for each ComboboxOption. Hides the ref so that we can only mutate it through
 * the returned functions. 🙈
 */
function useOptionDataFactory(): {
  addOptionData: AddOptionData;
  getOptionData: GetOptionData;
  removeOptionData: RemoveOptionData;
} {
  const optionData = React.useRef<OptionData>({});

  const addOptionData = React.useCallback<AddOptionData>(
    (value: string, data: any) => (optionData.current[value] = data),
    []
  );

  const getOptionData = React.useCallback<GetOptionData>(
    (value: string) => optionData.current[value],
    []
  );

  const removeOptionData = React.useCallback<RemoveOptionData>(
    (value: string) => delete optionData.current[value],
    []
  );

  return {
    addOptionData,
    getOptionData,
    removeOptionData,
  };
}

type OptionData = Record<string, any>;

type AddOptionData = (value: string, data: any) => void;

type GetOptionData = (value: string) => any | undefined;

type RemoveOptionData = (value: string) => void;

interface ComboboxContextValue {
  onSelect(value: string, data?: any): any;
  getOptionData: GetOptionData;
  addOptionData: AddOptionData;
  removeOptionData: RemoveOptionData;
}
