import Phaser from "phaser";
import { getOption, SFX_KEY } from "data";

const playSound = (
  sound: Phaser.Sound.BaseSound,
  config?: Phaser.Types.Sound.SoundConfig
) => {
  const sfx = getOption(SFX_KEY);
  if (sfx) {
    sound.play(config);
  }
};

export { playSound };
