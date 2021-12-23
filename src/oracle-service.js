import { getTeamIdByName,getScoreByTeamAndDate } from "./basketball-requests.js";
import { Provider, stark } from "starknet";
import { ORACLE_CONTRACT_ADDRESS, LOCALHOST_URL, STARKNET_GOERLI_ALPHA_URL } from "./constants.js";

const provider = new Provider({baseUrl: STARKNET_GOERLI_ALPHA_URL,  feederGatewayUrl: 'feeder_gateway', gatewayUrl: 'gateway'});

export async function checkForRequest(){
    
    console.log("Looking for requests...")

    const queueSize = await provider.callContract({
        contract_address: ORACLE_CONTRACT_ADDRESS,
        entry_point_selector: stark.getSelectorFromName("get_queue_size")
    });

    const size = parseInt(queueSize.result,16);

    console.log("QUEUE SIZE: " + size);

    if(size > 0) {

       console.log("Request found: ");

        const consume_tx = await provider.addTransaction({
            type: "INVOKE_FUNCTION",
            contract_address: ORACLE_CONTRACT_ADDRESS,
            entry_point_selector: stark.getSelectorFromName("consume_next_request"),
            calldata:[]
        });

        await provider.waitForTx(consume_tx.transaction_hash);

        const requestData = {
            caller_address: consume_tx.result[0],
            game: consume_tx.result[1],
            team: consume_tx.result[2], 
            date: consume_tx.result[3]
        };

        await processRequest(requestData);
    }

}

async function processRequest(requestData) {
    const teamName = Buffer.from(BigInt(requestData.team).toString(16), 'hex').toString();
    const teamId = await getTeamIdByName(teamName);
    const date = parseInt(requestData.date,16).toString().replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
    const season = getSeason(date);


    const response = await getScoreByTeamAndDate(teamId,date,season);



    const homeTeamBigInt = BigInt("0x" + response.homeTeam.split("").map(c => c.toString().charCodeAt(0).toString(16)).join(""));
    const awayTeamBigInt = BigInt("0x" + response.awayTeam.split("").map(c => c.toString().charCodeAt(0).toString(16)).join(""));

    const calldata = [
        BigInt(requestData.caller_address).toString(),  // Client address
        "6",                                            // Array Param Length
        BigInt(requestData.game).toString(),            // Array Param Element #1 - Game Type
        homeTeamBigInt.toString(),                      // Array Param Element #2 - Team 1
        response.homeTeamScore.toString(),                 // Array Param Element #3 - Team 1 Score
        awayTeamBigInt.toString(),                      // Array Param Element #4 - Team 2
        response.awayTeamScore.toString(),                 // Array Param Element #5 - Team 2 Score
        BigInt(requestData.date).toString()             // Array Param Element #6 - Match Date
    ]

    console.log("Callback for client " + requestData.caller_address + " :");
    console.log(calldata);

    const callbackTx = await provider.addTransaction({
        type: "INVOKE_FUNCTION",
        contract_address: ORACLE_CONTRACT_ADDRESS,
        entry_point_selector: stark.getSelectorFromName("callback_client"),
        calldata:calldata
    });

}


function getSeason(date){
    const year = date.toString().replace(/(\d{4})-(\d{2})-(\d{2})/g, '$1');
    const month = date.toString().replace(/(\d{4})-(\d{2})-(\d{2})/g, '$2');

    const season = month > 6 ? year + "-" + (parseInt(year)+1).toString() : (parseInt(year)-1).toString() + "-" + year;
    return season;
}
