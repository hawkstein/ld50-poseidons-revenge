import Phaser from "phaser";
import config from "./config";
import Preload from "@scenes/Preload";
import Game from "@scenes/Game";
// import HUD from "@scenes/HUD";
// import LevelComplete from "@scenes/LevelComplete";
import GameEnd from "@scenes/End";
import Start from "@scenes/Start";
import Options from "@scenes/Options";
import Credits from "@scenes/Credits";

new Phaser.Game(
  Object.assign(config, {
    scene: [Preload, Start, Options, Game, GameEnd, Credits], // HUD, LevelComplete,
  })
);
