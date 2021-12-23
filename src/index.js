import { checkForRequest } from './oracle-service.js';
import { LOOP_TIME } from './constants.js';

async function CheckRequests(){
  await new Promise(res=>setTimeout(res,LOOP_TIME));
  await checkForRequest();
  process.nextTick(CheckRequests);
}

CheckRequests();
