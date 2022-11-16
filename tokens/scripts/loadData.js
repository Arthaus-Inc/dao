/*
 *   Load Sample Data into Tables
 */

// Imports
const fs = require('fs');

// Standard `ethers` import for chain interaction, `network` for logging, and `run` for verifying contracts
const { ethers, network } = require("hardhat")

// The script required to upload metadata to IPFS
const { prepareSqlForEaselTables } = require("./prepareSql")

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

	// // Prepare the SQL INSERT statements, which pass the table names to help prepare the statements
	const sqlInsertStatements = await prepareSqlForEaselTables(artistsPrefix, attributesPrefix, artworksPrefix, editionsPrefix, patronsPrefix)
	console.log(sqlInsertStatements)

	// // Insert metadata into both the 'main' and 'attributes' tables, before smart contract deployment
	// console.log(`\nWriting metadata to tables...`)
	// for await (let statement of sqlInsertStatements) {
	// 	const { main, attributes } = statement
	// 	// Call `write` with both INSERT statements; optionally, log it to show some SQL queries
	// 	// Use `receipt` to make sure everything worked as expected
	// 	let { hash: mainWriteTx } = await tableland.write(main)
	// 	receipt = tableland.receipt(mainWriteTx)
	// 	if (receipt) {
	// 		console.log(`${mainName} table: ${main}`)
	// 	} else {
	// 		throw new Error(`Write table error: could not get '${mainName}' transaction receipt: ${mainWriteTx}`)
	// 	}
	// 	// Recall that `attributes` is an array of SQL statements for each `trait_type` and `value` for a `tokenId`
	// 	for await (let attribute of attributes) {
	// 		let { hash: attrWriteTx } = await tableland.write(attribute)
	// 		receipt = tableland.receipt(attrWriteTx)
	// 		if (receipt) {
	// 			console.log(`${attributesName} table: ${attribute}`)
	// 		} else {
	// 			throw new Error(`Write table error: could not get '${attributesName}' transaction receipt: ${attrWriteTx}`)
	// 		}
	// 	}
	// }

	
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
