# DAO Subgraph

Collection of Subgraphs to support the usage of the BarnBridge type of DAOs like the EnterDAO one

## Running Local Graph Node

Open the `docker-compose.yml` file and edit the `ethereum` node url you want to use. 

## Development

There are `npm scripts` for all of the stages of subgraph development.

1. Building the subgraph (code generation + creating the subgraph): `yarn build`
2. Deploying the mainnet subgraph on the local graph node: `yarn deploy:local`
3. Deploying the mainnet subgraph on the public graph node: `yarn deploy:mainnet`

## Supported APIs

- [X] Overview Info - Limited support. `totalVEntr` and `kernelUsers` are not yet implemented fully
- [X] Get All Proposals
- [X] Get Proposal by ID - Limited support. Some time based events cannot be deduced from the Subgraph.
- [ ] Get all Votes for a given Proposal ID
- [ ] Get all Events for a given Proposal ID
- [ ] Get all Voters
- [ ] Get all Abrogation Proposals
- [ ] Get Abrogation Proposal by ID
- [ ] Get Abrogation Proposal Votes by ID