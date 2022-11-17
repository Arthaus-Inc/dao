/*
 *   Create and Deploy Arthaus Easel Tables
 */


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


	/*
	 *   (1) Define Easel Table Structure
	 */

	// Core Token  - Artists
	// Artists token table - used for primary lookup and token counter assignment
	const artistsPrefix = "easel_artists"
	const artistsSchema = `id int primary key, external_id text, name text, description text, image text, profile text, portfolio text, gallery text`

	// Easel Table - Artist Attributes
	const attributesPrefix = "easel_artist_attributes"
	const attributesSchema = `artist_id int not null, trait_type text not null, value text`

	// Easel Table - Artwork
	const artworksPrefix = "easel_artworks"
	const artworksSchema = `id int primary key, artist_id int not null, external_id text, name text, url text`

	// Easel Table - Edition
	const editionsPrefix = "easel_editions"
	const editionsSchema = `id int not null, artwork_id int not null, patron_id int not null, external_id text, number int not null, total int not null, artifact_source text not null, artifact_id text not null, url text`

	//  Easel Table - Patron
	const patronsPrefix = "easel_patrons"
	const patronsSchema = `id int primary key, external_id text, name text, url text`
	

	/*
	 *   (2) Create Core Token Table - Artists
	 */


	// [a] Create main artist table
	const { name: artistsName, txnHash: artistsTxnHash } = await tableland.create(artistsSchema, { 
		prefix: artistsPrefix 
	})

	// Wait for the main table to be "officially" created (i.e., tx is included in a block)
	// If you do not, you could be later be inserting into a non-existent table
	let receipt = tableland.receipt(artistsTxnHash)
	if (receipt) {
		console.log(`Table '${artistsName}' has been created at tx '${artistsTxnHash}'`)
	} else {
		throw new Error(`Create table error: could not get '${artistsName}' transaction receipt: ${artistsTxnHash}`)
	}

	// [b] Create (artist) attributes table
	const { name: attributesName, txnHash: attributesTxnHash } = await tableland.create(attributesSchema, {
		prefix: attributesPrefix,
	})

	// Wait for the attributes table to be "officially" created
	// If you do not, you could be later be inserting into a non-existent table
	receipt = tableland.receipt(attributesTxnHash)
	if (receipt) {
		console.log(`Table '${attributesName}' has been created at tx '${attributesTxnHash}'`)
	} else {
		throw new Error(`Create table error: could not get '${attributesName}' transaction receipt: ${attributesTxnHash}`)
	}

	// [c] Create artworks table
	const { name: artworksName, txnHash: artworksTxHash } = await tableland.create(artworksSchema, {
		prefix: artworksPrefix,
	})

	// Wait for the attributes table to be "officially" created
	// If you do not, you could be later be inserting into a non-existent table
	receipt = tableland.receipt(artworksTxHash)
	if (receipt) {
		console.log(`Table '${artworksName}' has been created at tx '${artworksTxHash}'`)
	} else {
		throw new Error(`Create table error: could not get '${artworksName}' transaction receipt: ${artworksTxHash}`)
	}

	// [d] Create editions table
	const { name: editionsName, txnHash: editionsTxHash } = await tableland.create(editionsSchema, {
		prefix: editionsPrefix,
	})

	// Wait for the attributes table to be "officially" created
	// If you do not, you could be later be inserting into a non-existent table
	receipt = tableland.receipt(editionsTxHash)
	if (receipt) {
		console.log(`Table '${editionsName}' has been created at tx '${editionsTxHash}'`)
	} else {
		throw new Error(`Create table error: could not get '${editionsName}' transaction receipt: ${editionsTxHash}`)
	}

	// [e] Create patrons table
	const { name: patronsName, txnHash: patronsTxHash } = await tableland.create(patronsSchema, {
		prefix: patronsPrefix,
	})

	// Wait for the attributes table to be "officially" created
	// If you do not, you could be later be inserting into a non-existent table
	receipt = tableland.receipt(patronsTxHash)
	if (receipt) {
		console.log(`Table '${patronsName}' has been created at tx '${patronsTxHash}'`)
	} else {
		throw new Error(`Create table error: could not get '${patronsName}' transaction receipt: ${patronsTxHash}`)
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
