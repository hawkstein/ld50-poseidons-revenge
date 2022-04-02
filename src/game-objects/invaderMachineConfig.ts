import { MachineConfig } from "xstate";

type Context = {};

type Event =
  | { type: "SWIM_TO_LAND" }
  | {
      type: "ARRIVED_AT_LAND";
    }
  | {
      type: "KILLED";
    }
  | {
      type: "FINISHED_DYING";
    };

export default function buildConfig(spawnTime: number) {
  const config: MachineConfig<Context, any, Event> = {
    id: "invader",
    initial: "spawning",
    states: {
      spawning: {
        after: {
          [spawnTime]: "swimming",
        },
      },
      swimming: {
        on: {
          ARRIVED_AT_LAND: "flooding",
          KILLED: "dying",
        },
      },
      flooding: {
        on: {
          KILLED: "dying",
          SWIM_TO_LAND: "swimming",
        },
      },
      dying: {
        on: {
          FINISHED_DYING: "dead",
        },
      },
      dead: {
        type: "final",
      },
    },
  };
  return config;
}
