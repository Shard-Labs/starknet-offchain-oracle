# starknet-offchain-oracle
A POC offchain oracle for starknet that performs sports related queries

## Implementation

This is a simple node.js server that periodically checks the on-chain oracle for pending requests. When it finds a new request, it will query an API based on the request's parameters. 


This POC implements a simple querying service for getting the result of basketball matches.


Right now requests are limited to querying the results of a Basketball match.

### Calldata

The request received from the on-chain Oracle contains:

```
requestData = {

  The client's contract address,

  The type of game that is going to be queried, represented by an int. In this case it only accepts 0 for Basketball,

  One of the team's name in Hex, 

  The date that the match took place in, in Hex. 

};
```

The server then queries an external API for getting the results of the match, and finally calls the callback function in the on-chain Oracle with the following parameters:

```
const calldata = [
        The client's contract address,
        The size of the array with the match result information, which for Cairo purposes is defined by the next elements in this list,                                            
        The game type,            
        Home team's name converted to Hex and then to BigInt,
        Home team's score,
        Away team's name converted to Hex and then to BigInt,
        Away team's score,
        Match date
]
```

# Reference

The api used for match results is https://api-sports.io/documentation/basketball/v1

