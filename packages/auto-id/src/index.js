// https://github.com/thearnica/react-uid/blob/master/src/hooks.ts
import { createContext, useContext, useState } from "react";

export const useId = () => {
  const [{ id }] = useIDState();
  return id;
};

const counter = createSource();
const source = createContext(createSource());
const getId = source => source.value++;

function genId(context) {
  const quartz = context || counter;
  const id = getId(quartz);
  const gen = item => id + quartz.id(item);
  return { id, gen };
}

function useIDState() {
  return useState(genId(useContext(source)));
}

function generateUID() {
  let counter = 1;
  const map = new WeakMap();
  function id(item, index) {
    if (typeof item === "number" || typeof item === "string") {
      return index ? `idx-${index}` : `val-${item}`;
    }

    if (!map.has(item)) {
      map.set(item, counter++);
      return id(item);
    }
    return "id" + map.get(item);
  }

  return id;
}

function createSource() {
  return {
    value: 1,
    id: generateUID()
  };
}
