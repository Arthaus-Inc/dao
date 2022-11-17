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

    // Load data - if available
    if(tables[network.name] && tables[network.name]['artists'] !== "") {
        // // Prepare the SQL INSERT statements, which pass the table names to help prepare the statements
        const sqlInsertStatements = await prepareSqlForEaselTables(
            tables[network.name]['artists'], 
            tables[network.name]['artist_attributes'],
            tables[network.name]['artworks'], 
            tables[network.name]['editions'], 
            tables[network.name]['patrons'])
        console.log(sqlInsertStatements)

        // Insert metadata into all Easel tables prior to Smart Contract deployment
        console.log(`\nWriting metadata to tables...`)
        for await (let statement of sqlInsertStatements) {
            const { artists, attributes, artworks, editions, patrons } = statement

            /*
             *   (1) Insert Artists (Main Token)
             */
            let { hash: artistWriteTx } = await tableland.write(artists)
            let receipt = tableland.receipt(artistWriteTx)
            if (receipt) {
                console.log(`${tables[network.name]['artists']} table: ${artists}`)
            } else {
                throw new Error(`Write table error: could not get '${tables[network.name]['artists']}' transaction receipt: ${artistWriteTx}`)
            }

            // /*
            //  *   (2) Insert Artist Attributes
            //  */
            // for await (let attribute of attributes) {
            //     let { hash: attrWriteTx } = await tableland.write(attribute)
            //     receipt = tableland.receipt(attrWriteTx)
            //     if (receipt) {
            //         console.log(`${tables[network.name]['artist_attributes']} table: ${attribute}`)
            //     } else {
            //         throw new Error(`Write table error: could not get '${tables[network.name]['artist_attributes']}' transaction receipt: ${attrWriteTx}`)
            //     }
            // }

            // /*
            //  *   (3) Insert Artworks
            //  */
            // let { hash: artworkWriteTx } = await tableland.write(artworks)
            // receipt = tableland.receipt(artworkWriteTx)
            // if (receipt) {
            //     console.log(`${tables[network.name]['artworks']} table: ${artworks}`)
            // } else {
            //     throw new Error(`Write table error: could not get '${tables[network.name]['artworks']}' transaction receipt: ${artworkWriteTx}`)
            // }

            // /*
            //  *   (4) Insert Editions
            //  */
            // let { hash: editionsWriteTx } = await tableland.write(editions)
            // receipt = tableland.receipt(editionsWriteTx)
            // if (receipt) {
            //     console.log(`${tables[network.name]['editions']} table: ${editions}`)
            // } else {
            //     throw new Error(`Write table error: could not get '${tables[network.name]['editions']}' transaction receipt: ${editionsWriteTx}`)
            // }

            /*
             *   (5) Insert Patrons
             */
            // let { hash: patronsWriteTx } = await tableland.write(patrons)
            // receipt = tableland.receipt(patronsWriteTx)
            // if (receipt) {
            //     console.log(`${tables[network.name]['patrons']} table: ${patrons}`)
            // } else {
            //     throw new Error(`Write table error: could not get '${tables[network.name]['patrons']}' transaction receipt: ${patronsWriteTx}`)
            // }
        }
    }

}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
