import { checkForRequest } from './oracle-service.js';


async function CheckRequests(){
  await new Promise(res=>setTimeout(res,1000));
  await checkForRequest();
  process.nextTick(CheckRequests);
}

CheckRequests();
