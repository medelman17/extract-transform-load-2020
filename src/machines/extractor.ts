import {
  ETLExtractorMachine,
  ETLExtractorMachineConfig,
  ETLExtractorMachineContext,
  ETLExtractorMachineEvents,
  ETLExtractorMachineOptions,
  ETLExtractorMachineStateSchema
} from "../types";
import { shouldExtract, isError } from "./utils";

import { Machine, assign, send } from "xstate";

export function createETLExtractor(
  context: ETLExtractorMachineContext
): ETLExtractorMachine {
  const config = getETLExtractorConfig(context);
  const options = getETLExtractorOptions();
  return Machine<
    ETLExtractorMachineContext,
    ETLExtractorMachineStateSchema,
    ETLExtractorMachineEvents
  >(config, options);
}

function getETLExtractorConfig(
  context: ETLExtractorMachineContext
): ETLExtractorMachineConfig {
  const { id } = context;
  return {
    id: `extractor-${id}`,
    context,
    initial: "idle",

    on: {
      DONE: [
        { target: "done", actions: "handleError", cond: "isError" },
        { target: "done", actions: "handleSuccess" }
      ]
    },
    states: {
      idle: {
        on: { START: "extracting" }
      },
      extracting: {
        invoke: {
          id: "charExtract",
          src: "charExtract",
          onDone: { actions: ["success"] },
          onError: { actions: "fail" }
        }
      },
      done: { type: "final", data: context => context }
    }
  };
}

function getETLExtractorOptions(): ETLExtractorMachineOptions {
  return {
    guards: {
      shouldExtract,
      isError
    },
    actions: {
      start: send("START"),
      handleError: assign({ res: (c, e: any) => e.error }),
      handleSuccess: assign({ res: (c, e) => e.data }),
      success: send((_, { data }: any) => ({
        type: "DONE",
        error: false,
        data
      })),
      fail: send((_, { error }: any) => ({
        type: "DONE",
        error: true,
        data: error
      }))
    },
    delays: {},
    activities: {},
    services: {
      charExtract: ({ data }: any) =>
        new Promise((resolve, reject) => {
          const [code, name] = data.split(";");
          resolve({ code, name });
        })
    }
  };
}
