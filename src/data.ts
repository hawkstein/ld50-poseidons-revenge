import localforage from "localforage";

type GameData = {
  keys: Map<string, string | string[]>;
  options: Map<string, boolean | number | string>;
};

const FORAGE_KEY = "ld-50-untitled-game";
const STORE_KEY = "data";

const store: GameData = {
  keys: new Map(),
  options: new Map(),
};

async function saveGameData() {
  localforage.config({
    name: FORAGE_KEY,
    storeName: STORE_KEY,
  });
  await localforage.setItem("flags", store.keys);
  await localforage.setItem("options", store.options);
}

async function loadGameData() {
  localforage.config({
    name: FORAGE_KEY,
    storeName: STORE_KEY,
  });
  store.keys = (await localforage.getItem("flags")) ?? new Map();
  store.options = (await localforage.getItem("options")) ?? store.options;
}

function getKey(key: string) {
  return store.keys.get(key);
}

function setKey(key: string, value: string | string[]) {
  store.keys.set(key, value);
}

function getOption(key: string) {
  return store.options.get(key);
}

function setOption(key: string, value: boolean | number | string) {
  store.options.set(key, value);
}

function getStore() {
  return store;
}

export {
  saveGameData,
  loadGameData,
  getStore,
  getKey as getFlag,
  setKey as setFlag,
  getOption,
  setOption,
};
