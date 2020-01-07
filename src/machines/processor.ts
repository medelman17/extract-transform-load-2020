import {
  JobProcessorMachine,
  JobProcessorMachineConfig,
  JobProcessorMachineContext,
  JobProcessorMachineEvents,
  JobProcessorMachineOptions,
  JobProcessorMachineStateSchema
} from "../types";
import { shouldExtract } from "./utils";
import { createETLExtractor } from "./extractor";
import { createETLTransformer } from "./transformer";
import { createETLLoader } from "./loader";

import { Machine, assign, send } from "xstate";

export function createJobProcessor(
  context: JobProcessorMachineContext
): JobProcessorMachine {
  const config = getJobProcessorConfig(context);
  const options = getJobProcessorOptions();
  return Machine<
    JobProcessorMachineContext,
    JobProcessorMachineStateSchema,
    JobProcessorMachineEvents
  >(config, options);
}

function getJobProcessorConfig(
  context: JobProcessorMachineContext
): JobProcessorMachineConfig {
  const { id } = context;
  return {
    id,
    context,
    initial: "idle",
    states: {
      idle: {
        entry: [send({ type: "START" })],
        on: { START: "extracting" }
      },
      extracting: {
        initial: "idle",
        exit: "bootstrapNext",
        invoke: {
          id: "charExtractor",
          src: createETLExtractor,
          onDone: "transforming",
          onError: "failure"
        },
        states: {
          idle: {
            on: {
              "": [
                { target: "active", cond: "shouldExtract" },
                { target: `#${id}.failure` }
              ]
            }
          },
          active: {
            entry: [send({ type: "START" }, { to: "charExtractor" })]
          }
        }
      },
      transforming: {
        entry: [send({ type: "START" }, { to: "charTransformer" })],
        exit: ["bootstrapNext"],
        invoke: {
          id: "charTransformer",
          src: createETLTransformer,
          onDone: {
            target: "loading"
          },
          onError: {
            target: "failure"
          }
        }
      },
      loading: {
        entry: [send({ type: "START" }, { to: "charLoader" })],

        invoke: {
          id: "charLoader",
          src: createETLLoader,
          onDone: {
            target: "success"
          },
          onError: {
            target: "failure"
          }
        }
      },
      failure: { type: "final", data: (c, { data }: any) => ({ error: true }) },
      success: { type: "final", data: (c, { data }: any) => ({ ...data.res }) }
    }
  };
}

function getJobProcessorOptions(): JobProcessorMachineOptions {
  return {
    guards: {
      shouldExtract
    },
    actions: {
      start: send("START"),
      bootstrapNext: assign({
        data: (context, { data }: any) => data?.res || data?.error,
        prev: ({ data }) => data
      })
    },
    delays: {},
    activities: {},
    services: {}
  };
}
