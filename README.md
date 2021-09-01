# DAO Subgraph

Collection of Subgraphs to support the usage of the BarnBridge type of DAOs like the EnterDAO one

## Running Local Graph Node

Open the `docker-compose.yml` file and edit the `ethereum` node url you want to use. 

## Development

There are `npm scripts` for all of the stages of subgraph development.

1. Generating the Code: `npm run codegen`
2. Building the subgraph: `npm run build`
3. Creating the subgraph at the local graph node: `npm run create-local`
4. Deploying the subgraph on the local graph node: `npm run deploy-local`