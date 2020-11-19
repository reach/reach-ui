/*
type PropDef = {
  name: string;
  type: string | string[];
  isRequired: boolean;
  defaultValue?: string;
}
*/

// NOTE: We should eventually be able to generate this from TS doc blocks I want
// to make sure we have a good idea of what data we need before I spend too much
// time on it.

export const listboxDefs = {
  Listbox: {
    name: "Listbox",
    propDefs: [
      {
        name: "arrow",
        type: ["boolean", "node"],
        isRequired: false,
        defaultValue: `"▼"`,
      },
      {
        name: "button",
        type: ["node", "func"],
        isRequired: false,
      },
      {
        name: "children",
        type: ["node", "func"],
        isRequired: true,
      },
      {
        name: "defaultValue",
        type: ["string"],
        isRequired: false,
      },
      {
        name: "disabled",
        type: ["boolean"],
        isRequired: false,
        defaultValue: `false`,
      },
      {
        name: "form",
        type: ["string"],
        isRequired: false,
      },
      {
        name: "name",
        type: ["string"],
        isRequired: false,
      },
      {
        name: "onChange",
        type: ["func"],
        isRequired: false,
      },
      {
        name: "portal",
        type: ["boolean"],
        isRequired: false,
        defaultValue: `true`,
      },
      {
        name: "required",
        type: ["boolean"],
        isRequired: false,
        defaultValue: `false`,
      },
      {
        name: "value",
        type: ["string"],
        isRequired: false,
      },
    ],
  },
  ListboxInput: {
    name: "ListboxInput",
    propDefs: [
      {
        name: "children",
        type: ["node", "func"],
        isRequired: true,
      },
      {
        name: "defaultValue",
        type: ["string"],
        isRequired: false,
      },
      {
        name: "disabled",
        type: ["boolean"],
        isRequired: false,
        defaultValue: `false`,
      },
      {
        name: "required",
        type: ["boolean"],
        isRequired: false,
        defaultValue: `false`,
      },
      {
        name: "form",
        type: ["string"],
        isRequired: false,
      },
      {
        name: "name",
        type: ["string"],
        isRequired: false,
      },
      {
        name: "value",
        type: ["string"],
        isRequired: false,
      },
      {
        name: "onChange",
        type: ["func"],
        isRequired: false,
      },
    ],
  },
  ListboxButton: {
    name: "ListboxButton",
    propDefs: [
      {
        name: "arrow",
        type: ["node", "boolean"],
        isRequired: false,
        defaultValue: `false`,
      },
      {
        name: "children",
        type: ["node", "func"],
        isRequired: true,
      },
    ],
  },
  ListboxArrow: {
    name: "ListboxArrow",
    propDefs: [
      {
        name: "children",
        type: ["node", "func"],
        isRequired: true,
      },
    ],
  },
  ListboxList: {
    name: "ListboxList",
    propDefs: [],
  },
  ListboxPopover: {
    name: "ListboxPopover",
    propDefs: [
      {
        name: "children",
        type: ["node"],
        isRequired: true,
      },
      {
        name: "portal",
        type: ["boolean"],
        isRequired: false,
        defaultValue: `true`,
      },
      {
        name: "position",
        type: ["func"],
        isRequired: false,
      },
    ],
  },
  ListboxOption: {
    name: "ListboxOption",
    propDefs: [
      {
        name: "disabled",
        type: ["boolean"],
        isRequired: false,
        defaultValue: `false`,
      },
      {
        name: "label",
        type: ["string"],
        isRequired: false,
      },
      {
        name: "value",
        type: ["string"],
        isRequired: true,
      },
    ],
  },
  ListboxGroup: {
    name: "ListboxGroup",
    propDefs: [
      {
        name: "label",
        type: ["string"],
        isRequired: false,
      },
    ],
  },
  ListboxGroupLabel: {
    name: "ListboxGroupLabel",
    propDefs: [],
  },
};
