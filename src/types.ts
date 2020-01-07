import {
  MachineOptions,
  MachineConfig,
  StateMachine,
  Interpreter
} from "xstate";

export type ETLJob = {
  data: string;
  id: string;
  service: Interpreter<
    JobProcessorMachineContext,
    JobProcessorMachineStateSchema,
    JobProcessorMachineEvents
  >;
};
export type JobMap = { [index: string]: ETLJob };

import { CharacterCreateInput, CharacterSelect } from "@prisma/photon";

export interface JobProcessorMachineContext {
  id: string;
  data: any;
  prev?: any;
}

export interface JobProcessorMachineStateSchema {
  states: {
    idle: {};
    extracting: {
      states: {
        idle: {};
        active: {};
      };
    };
    transforming: {};
    loading: {};
    failure: {};
    success: {};
  };
}

export type JobProcessorMachineEvents = { type: "START" };

export type JobProcessorMachineOptions = MachineOptions<
  JobProcessorMachineContext,
  JobProcessorMachineEvents
>;

export type JobProcessorMachineConfig = MachineConfig<
  JobProcessorMachineContext,
  JobProcessorMachineStateSchema,
  JobProcessorMachineEvents
>;

export type JobProcessorMachine = StateMachine<
  JobProcessorMachineContext,
  JobProcessorMachineStateSchema,
  JobProcessorMachineEvents
>;

export interface ETLExtractorMachineContext {
  id: string;
  data: any;
  res?: any;
}

export interface ETLTransformerMachineStateSchema {
  states: {
    idle: {};
    transforming: {};
    done: {};
  };
}
export interface ETLTransformerMachineContext {
  id: string;
  data: any;
  res?: any;
}

export type ETLTransformerMachineEvents =
  | { type: "START"; data: any }
  | { type: "DONE"; data?: any; error?: any };

export type ETLTransformerMachineOptions = MachineOptions<
  ETLTransformerMachineContext,
  ETLTransformerMachineEvents
>;

export type ETLTransformerMachineConfig = MachineConfig<
  ETLTransformerMachineContext,
  ETLTransformerMachineStateSchema,
  ETLTransformerMachineEvents
>;

export type ETLTransformerMachine = StateMachine<
  ETLTransformerMachineContext,
  ETLTransformerMachineStateSchema,
  ETLTransformerMachineEvents
>;

export interface ETLExtractorMachineStateSchema {
  states: {
    idle: {};
    extracting: {
      states: {
        idle: {};
        active: {};
      };
    };
    done: {};
  };
}

export type ETLExtractorMachineEvents =
  | { type: "START"; data: any }
  | { type: "DONE"; data?: any; error?: any };

export type ETLExtractorMachineOptions = MachineOptions<
  ETLExtractorMachineContext,
  ETLExtractorMachineEvents
>;

export type ETLExtractorMachineConfig = MachineConfig<
  ETLExtractorMachineContext,
  ETLExtractorMachineStateSchema,
  ETLExtractorMachineEvents
>;

export type ETLExtractorMachine = StateMachine<
  ETLExtractorMachineContext,
  ETLExtractorMachineStateSchema,
  ETLExtractorMachineEvents
>;

export interface PhotonMachineStateSchema {
  states: {
    idle: {};
    pending: {};
    failure: {};
    done: {};
  };
}

export interface PhotonMachineContext {
  retries: number;
  data: CharacterCreateInput;
  res: CharacterSelect;
}

export type PhotonMachineEvents =
  | { type: "TRY"; data?: any }
  | { type: "RETRY"; data?: any };

export type PhotonMachineOptions = MachineOptions<
  PhotonMachineContext,
  PhotonMachineEvents
>;

export type PhotonMachineConfig = MachineConfig<
  PhotonMachineContext,
  PhotonMachineStateSchema,
  PhotonMachineEvents
>;

export type PhotonMachine = StateMachine<
  PhotonMachineContext,
  PhotonMachineStateSchema,
  PhotonMachineEvents
>;
