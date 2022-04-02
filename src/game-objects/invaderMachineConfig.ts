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
        },
        after: {
          500: "finished_flooding",
        },
      },
      finished_flooding: {
        on: {
          SWIM_TO_LAND: "swimming",
          KILLED: "dying",
        },
      },
      dying: {
        on: {
          FINISHED_DYING: "dead",
        },
        after: {
          500: "dead",
        },
      },
      dead: {
        type: "final",
      },
    },
  };
  return config;
}
