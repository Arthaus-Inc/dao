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

Deploy the smart contract locally, running the following in different shells. The `deploy.js` script uploads local files to IPFS and sets the CID to the NFT contract's `baseURI`.

Deploy to live testnets like Polygon Mumbai

```console
npx hardhat run scripts/deploy.js --network polygon-mumbai
```

And Optionally, instead of verifying the contract in `deployTwoTables.js`, you can do:

```console
npx hardhat run scripts/verifyTwoTables.js --network polygon-mumbai
```
