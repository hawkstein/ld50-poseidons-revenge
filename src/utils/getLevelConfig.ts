type LevelConfig = {
  title: string;
};

const configs: LevelConfig[] = [
  {
    title: "1. Beginnings",
  },
  {
    title: "2. Still Angry",
  },
  {
    title: "3. Sacrifices",
  },
];

export default function getLevelConfig(level: number) {
  return configs[level - 1];
}
