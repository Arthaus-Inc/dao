/*
 *   Deploy Artist Smart Contract
 */

// Imports
const fs = require('fs');

// Standard `ethers` import for chain interaction, `network` for logging, and `run` for verifying contracts
const { ethers, network } = require("hardhat")

// Import Tableland
const { connect } = require("@tableland/sdk")

// Import 'node-fetch' and set globally -- needed for Tableland to work with CommonJS
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args))
globalThis.fetch = fetch

// Optionally, do contract verification (for demo purposes, but this could be as a separate script `verify.js`)
require("@nomiclabs/hardhat-etherscan")

/**
 * Primary script to deploy the NFT, first pushing images to IPFS and saving the CIDs to a metadata object.
 * Then, creating both a 'main' and 'attributes' metadata table to INSERT metadata into for each NFT token.
 */
async function main() {
	// Define the account that will be signing txs for table creates/writes & contract deployment
	const [signer] = await ethers.getSigners()
	console.log(`\nDeploying to network '${network.name}' with account ${signer.address}`)

	// Connect to Tableland
	const tableland = await connect({ signer, chain: "polygon-mumbai" })

    // Load table config
    let rawdata = fs.readFileSync('tables.json');
    let tables = JSON.parse(rawdata);

    // Set the Tableand gateway as the `baseURI` where a `tokenId` will get appended upon `tokenURI` calls
	// Note that `mode=list` will format the metadata per the ERC721 standard
	const tablelandBaseURI = `https://testnet.tableland.network/query?mode=list&s=`

	// Get the contract factory to create an instance of the Artist contact
	const Artist = await ethers.getContractFactory("Artist")

	// Deploy the contract (passing current table config)
	const artist = await Artist.deploy(tablelandBaseURI, 
        tables[network.name]['artists'], 
        tables[network.name]['artist_attributes'],
        tables[network.name]['artworks'], 
        tables[network.name]['editions'], 
        tables[network.name]['patrons'])

	// For contract verification purposes, wait for 5 confirmations before proceeeding
	await artist.deployTransaction.wait(5)

	// Log the deployed address and call the getter on `baseURIString` (for demonstration purposes)
	console.log(`\nArtist contract deployed on ${network.name} at: ${artist.address}`)
	const baseURI = await artist.baseURIString()
	console.log(`Artist is using baseURI: ${baseURI}`)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
