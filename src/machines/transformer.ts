import {
  ETLTransformerMachine,
  ETLTransformerMachineConfig,
  ETLTransformerMachineContext,
  ETLTransformerMachineEvents,
  ETLTransformerMachineOptions,
  ETLTransformerMachineStateSchema
} from "../types";
import { isError } from "./utils";

import { Machine, assign, send } from "xstate";

export function createETLTransformer(
  context: ETLTransformerMachineContext
): ETLTransformerMachine {
  const config = getETLTransformerConfig(context);
  const options = getETLTransformerOptions();
  return Machine<
    ETLTransformerMachineContext,
    ETLTransformerMachineStateSchema,
    ETLTransformerMachineEvents
  >(config, options);
}

function getETLTransformerConfig(
  context: ETLTransformerMachineContext
): ETLTransformerMachineConfig {
  const { id } = context;
  return {
    id: `transformer-${id}`,
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
        on: { START: "transforming" }
      },
      transforming: {
        invoke: {
          id: "charTransform",
          src: "charTransform",
          onDone: { actions: "success" },
          onError: { actions: "fail" }
        }
      },
      done: { type: "final", data: context => context }
    }
  };
}

function getETLTransformerOptions(): ETLTransformerMachineOptions {
  return {
    guards: {
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
      charTransform: ({ data, id }, event) =>
        new Promise((resolve, reject) => {
          const { code, name } = data;
          resolve({
            id,
            name: name.trim(),
            unicode: code.trim(),
            unicode_int: parseInt(code, 16)
          });
        })
    }
  };
}
