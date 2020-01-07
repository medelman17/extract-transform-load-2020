import {
  PhotonMachine,
  PhotonMachineConfig,
  PhotonMachineStateSchema,
  PhotonMachineContext,
  PhotonMachineEvents,
  PhotonMachineOptions
} from "../types";
import { Machine, assign, send } from "xstate";
import { Photon } from "@prisma/photon";
const uuid = require("uuid/v4");
const photon = new Photon();

export function createETLLoader(context: PhotonMachineContext): PhotonMachine {
  const config = getPhotonMachineConfig(context, uuid());
  const options = getPhotonMachineOptions(context);
  return Machine<
    PhotonMachineContext,
    PhotonMachineStateSchema,
    PhotonMachineEvents
  >(config, options);
}

function getPhotonMachineConfig(
  context: PhotonMachineContext,
  id: string
): PhotonMachineConfig {
  return {
    id,
    initial: "idle",
    context,
    states: {
      idle: {
        entry: send("TRY", { delay: "backoff" }),
        on: {
          TRY: { target: "pending" }
        }
      },
      pending: {
        invoke: {
          id: "photon",
          src: "photon",
          onDone: {
            target: "done",
            actions: ["resolve"]
          },
          onError: {
            target: "failure"
          }
        }
      },
      failure: {
        on: {
          "": [
            { target: "idle", cond: "canRetry", actions: "increment" },
            { target: "done" }
          ]
        }
      },
      done: {
        type: "final",
        data: (context, event) => {
          //   console.log("in load", context, event);
          return {
            meta: { ...context },
            res: event.data
          };
        }
      }
    }
  };
}

function getPhotonMachineOptions(
  context: PhotonMachineContext
): PhotonMachineOptions {
  return {
    guards: {
      canRetry: ({ retries }) => retries < 5
    },
    actions: {
      resolve: assign({
        res: (_, event: any) => event.result
      }),
      increment: assign({
        retries: ({ retries }) => retries + 1
      })
    },
    activities: {},
    services: {
      photon: ({ data }, _) => photon.characters.create({ data })
    },
    delays: {
      backoff: ({ retries }) => retries * 200
    }
  };
}
