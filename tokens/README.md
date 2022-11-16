# Arthaus - Token Contracts
> ....

## Available Scripts

Compile the NFT smart contract

```console
npx hardhat compile
```

Run hardhat tests, including validating the `tokenURI` works as expected

```console
npx hardhat test
```

## Deploy (Dev)

Setup Easel on-chain metadata (via Tableland)

```console
npx hardhat run scripts/deployTables.js --network polygon-mumbai
```

Deploy to Easel contracts to Polygon Mumbai.

```console
npx hardhat run scripts/deployTables.js --network polygon-mumbai
```