import localforage from "localforage";

type GameData = {
  keys: Map<string, string | string[]>;
  options: Map<string, boolean | number | string>;
  currentLevel: number;
};

const FORAGE_KEY = "ld-50-untitled-game";
const STORE_KEY = "data";
const KEYS_KEY = "keys";
const OPTIONS_KEY = "options";

const BASE_SPAWN_RATE_KEY = "invaderSpawnRate";
const SFX_KEY = "sfx";
const BG_MUSIC_KEY = "bgMusic";
const WARRIOR_RANGE_KEY = "warriorRange";
const INVADER_SPEED_KEY = "invaderSpeed";
const TUTORIAL_MODE_KEY = "tutorialMode";
const PRAYER_RATE_KEY = "prayerRate";

const store: GameData = {
  keys: new Map(),
  options: new Map<string, boolean | number | string>([
    [PRAYER_RATE_KEY, 4000],
    [BASE_SPAWN_RATE_KEY, 1800],
    [TUTORIAL_MODE_KEY, false],
    [WARRIOR_RANGE_KEY, 80],
    [INVADER_SPEED_KEY, 1],
  ]),
  currentLevel: 1,
};

async function saveGameData() {
  localforage.config({
    name: FORAGE_KEY,
    storeName: STORE_KEY,
  });
  await localforage.setItem(KEYS_KEY, store.keys);
  await localforage.setItem(OPTIONS_KEY, store.options);
}

async function loadGameData() {
  localforage.config({
    name: FORAGE_KEY,
    storeName: STORE_KEY,
  });
  store.keys = (await localforage.getItem(KEYS_KEY)) ?? store.keys;
  store.options = (await localforage.getItem(OPTIONS_KEY)) ?? store.options;
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

function getCurrentLevel() {
  return store.currentLevel;
}

function setCurrentLevel(level: number) {
  store.currentLevel = level;
}

export {
  saveGameData,
  loadGameData,
  getStore,
  getKey as getFlag,
  setKey as setFlag,
  getOption,
  setOption,
  getCurrentLevel,
  setCurrentLevel,
  BASE_SPAWN_RATE_KEY,
  SFX_KEY,
  BG_MUSIC_KEY,
  WARRIOR_RANGE_KEY,
  INVADER_SPEED_KEY,
  TUTORIAL_MODE_KEY,
  PRAYER_RATE_KEY,
};
