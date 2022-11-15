/*
 *  Mint a New Patron Token to New Wallet Owner
 */

// Standard `ethers` import for chain interaction, `network` for logging, and `run` for verifying contracts
const { ethers, network } = require("hardhat")

/**
 *  Mint a new Patron token to a target address
 */
async function main() {
    // Define the account that will be signing txs for table creates/writes & contract deployment
	const [signer] = await ethers.getSigners()

    // Get the contract factory to create an instance of the  TwoTablesNFT contract
    const artist = await ethers.getContractAt("Artist", "0xf2D3002B734f7D51F746C2F1A085bF9A81ffcfA7", signer)
    
    // For demonstration purposes, mint a token so that `tokenURI` can be called
	const mintToken = await artist.mint(0)
	const mintTxn = await mintToken.wait()

	// For demonstration purposes, retrieve the event data from the mint to get the minted `tokenId`
	const mintReceipient = mintTxn.events[0].args[1]
	console.log(`\nPatron Token minted: to owner '${mintReceipient}'`)
 }

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
