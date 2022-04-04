type LevelConfig = {
  title: string;
  invaderSpawnRateAdjust: number;
  invaderSpeed: number;
  springSpawnRate: number;
};

const configs: LevelConfig[] = [
  {
    title: "1. Beginnings",
    invaderSpawnRateAdjust: 0,
    invaderSpeed: 0,
    springSpawnRate: 0,
  },
  {
    title: "2. Still Angry",
    invaderSpawnRateAdjust: 200,
    invaderSpeed: 0,
    springSpawnRate: 200,
  },
  {
    title: "3. Sacrifices",
    invaderSpawnRateAdjust: 500,
    invaderSpeed: 0,
    springSpawnRate: 400,
  },
  {
    title: "4. Super beasts",
    invaderSpawnRateAdjust: 600,
    invaderSpeed: 1,
    springSpawnRate: 600,
  },
  {
    title: "5. The end",
    invaderSpawnRateAdjust: 900,
    invaderSpeed: 2,
    springSpawnRate: 700,
  },
];

export default function getLevelConfig(level: number) {
  return configs[level - 1];
}
