import localforage from "localforage";

type GameData = {
  keys: Map<string, string | string[]>;
  options: Map<string, boolean | number | string>;
};

const FORAGE_KEY = "ld-50-untitled-game";
const STORE_KEY = "data";

const BASE_SPAWN_RATE_KEY = "invaderSpawnRate";
const SFX_KEY = "sfx";
const BG_MUSIC_KEY = "bgMusic";

const store: GameData = {
  keys: new Map(),
  options: new Map<string, boolean | number | string>([
    ["prayerRate", 5000],
    [BASE_SPAWN_RATE_KEY, 2000],
    ["tutorialMode", true],
  ]),
};

async function saveGameData() {
  localforage.config({
    name: FORAGE_KEY,
    storeName: STORE_KEY,
  });
  await localforage.setItem("keys", store.keys);
  await localforage.setItem("options", store.options);
}

async function loadGameData() {
  localforage.config({
    name: FORAGE_KEY,
    storeName: STORE_KEY,
  });
  store.keys = (await localforage.getItem("keys")) ?? store.keys;
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
  BASE_SPAWN_RATE_KEY,
  SFX_KEY,
  BG_MUSIC_KEY,
};
