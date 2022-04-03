import Phaser from "phaser";

const threats = [
  "Spring forth mighty flood!",
  "Wash away these villains!",
  "Athena cannot save you!",
];

export default function getThreat() {
  return Phaser.Utils.Array.GetRandom(threats);
}
