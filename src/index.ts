import { JobMap } from "./types";
import { createStreams, getReadline, createCharJob } from "./helpers";
import { createJobProcessor } from "./machines";
import { interpret, EventData } from "xstate";

const CHAR_NAMES_FILE = "./data/characters/DerivedName.txt";
let TOTAL_JOBS = 0;
let TOTAL_COMPLETED = 0;
let TOTAL_ERRORS = 0;
let MAX_HEAP = 0;
let MAX_PROCESS = 0;
let TIME_STARTED = Date.now();

main();

async function main() {
  const [instream, outstream] = createStreams(CHAR_NAMES_FILE);
  const readline = getReadline(instream, outstream);
  const jobMap: JobMap = {};

  for await (const line of readline) {
    const etlJob = createCharJob(line);
    const machine = createJobProcessor(etlJob);
    const service = interpret(machine).onDone(reportStats);
    jobMap[etlJob.id] = { ...etlJob, service };
  }

  const jobs = Object.keys(jobMap);
  let i = 0;

  setInterval(() => {
    const key = jobs[i];
    jobMap[key].service.start();
    i++;
  }, 0);
}

function reportStats(e: any) {
  const TIME_NOW = Date.now();
  const TIME_ELAPSED = (TIME_NOW - TIME_STARTED) / 1000;
  const { data } = e;
  if (data.error) {
    TOTAL_ERRORS++;
  } else {
    TOTAL_COMPLETED++;
  }
  TOTAL_JOBS = TOTAL_ERRORS + TOTAL_COMPLETED;

  console.clear();
  console.log(` 
    Total Processed: ${TOTAL_JOBS} 
    Total Errors: ${TOTAL_ERRORS}
    Time Elapsed: ${TIME_ELAPSED.toFixed(2)} seconds
    Jobs Per Second: ${(TOTAL_JOBS / TIME_ELAPSED).toFixed(2)}
  `);
}
