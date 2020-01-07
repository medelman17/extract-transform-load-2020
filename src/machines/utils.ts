import { JobProcessorMachineContext } from "../types";

export const shouldExtract = ({ data }: JobProcessorMachineContext) => {
  return data[0] !== "#" && data.includes(";");
};

export const isError = (_: any, event: any) => event.error === true;
