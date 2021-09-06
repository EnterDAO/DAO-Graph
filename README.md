# DAO Subgraph

Collection of Subgraphs to support the usage of the BarnBridge type of DAOs like the EnterDAO one

## Running Local Graph Node

Open the `docker-compose.yml` file and edit the `ethereum` node url you want to use. 

## Development

There are `yarn scripts` for all the stages of subgraph development.

1. Building the subgraph (code generation + creating the subgraph): `yarn build`
2. Deploying the mainnet subgraph on the local graph node: `yarn deploy:local`
3. Deploying the mainnet subgraph on the public graph node: `yarn deploy:mainnet`

## Supported APIs

- [ ] Overview Info - Limited support. `kernelUsers` may have bugs. `holders` not supported yet.
- [X] Get All Proposals
- [X] Get Proposal by ID
- [X] Get all Votes for a given Proposal ID
- [X] Get all Events for a given Proposal ID
- [X] Get all Voters - Limited support. `votingPower` is not yet implemented!
- [X] Get all Abrogation Proposals
- [X] Get Abrogation Proposal by ID
- [X] Get Abrogation Proposal Votes by ID