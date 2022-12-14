// The `prepareMetadata` script is required for IPFS image uploading
// and preparing the metadata as JS objects.
const prepareMetadata = require("./metadataProcessing")
const dotenv = require("dotenv")
dotenv.config()

/**
 * Prepare metadata for Tableland as SQL insert statements but in two tables ('main' and 'attributes').
 * @param {string} mainTable The name of the main metadata table in Tableland (id int, name text, description text, image text).
 * @param {string} attributesTable The name of the attributes table in Tableland (id int, trait_type text, value text).
 * @param {string} artistsTable The name of the artists table in Tableland (id int, external_id int, name text, url text).
 * @param {string} artworksTable The name of the artworks table in Tableland (id int, external_id int, name text, url text).
 * @param {string} editionsTable The name of the editions table in Tableland (id int, external_id int, number int, total int, artwork_id int, artifact_source text, artifact_id text, ).
 * @param {string} patronsTable The name of the patrons table in Tableland (id int, external_id int, name text, url text).
 * @returns {{main: string, attributes: string[]}} SQL statements for metadata table writes.
 */
 async function prepareSqlForEaselTables(artistsTable, attributesTable, artworksTable, editionsTable, patronsTable) {
	// Prepare the metadata (handles all of the IPFS-related actions & JSON parsing).
	const metadata = await prepareMetadata()
	console.log(metadata);

	// An array to hold interpolated SQL INSERT statements, using the metadata object's values.
	const sqlInsertStatements = []
	for await (let obj of metadata) {
		// Destructure the metadata values from the passed object
		const { id, name, description, image, attributes, art } = obj

		/*
		 *   (1) Core Token  - Artists
		 */

		// INSERT statement for a 'main' table that includes some shared data across any NFT
		// Schema: id int, name text, description text, image text
		let artistsTableStatement = `INSERT INTO ${artistsTable} (id, name, description, image, external_id, profile, portfolio, gallery) VALUES (${id}, '${name}', '${description}', '${image}', '${art.artist.external_id}', '${art.artist.profile}', '${art.artist.portfolio}', '${art.artist.gallery}');`

		/*
		 *   (2) NFT Metadata - Attributes
		 */

		// Iterate through the attributes and create an INSERT statment for each value, pushed to `attributesTableStatements`
		const attributesTableStatements = []
		for await (let attribute of attributes) {
			// Get the attirbutes trait_type & value;
			const { trait_type, value } = attribute

			// INSERT statement for a separate 'attributes' table that holds attribute data, keyed by the NFT tokenId
			// Schema: id int, trait_type text, value text
			const attributesStatement = `INSERT INTO ${attributesTable} (artist_id, trait_type, value) VALUES (${id}, '${trait_type}', '${value}');`
			attributesTableStatements.push(attributesStatement)
		}

		/*
		 *   (3) Easel Table - Artwork
		 */

		// INSERT statement for a 'artwork' table
		// Schema: id int, artist_id int, external_id text, name text, url text
		let artworksTableStatement = `INSERT INTO ${artworksTable} (id, artist_id, external_id, name, url) VALUES (${art.artwork.id}, '${art.artwork.artist_id}', '${art.artwork.external_id}', '${art.artwork.name}', '${art.artwork.url}');`

		/*
		 *   (4) Easel Table - Edition
		 */

		// INSERT statement for a 'edition' table
		// Schema: id int, artist_id int, external_id text, name text, url text
		let editionsTableStatement = `INSERT INTO ${editionsTable} (id, artwork_id, patron_id, external_id, number, total, artifact_source, artifact_id, url) VALUES (${art.edition.id}, ${art.edition.artwork_id}, ${art.edition.patron_id}, '${art.edition.external_id}', ${art.edition.number}, ${art.edition.total}, '${art.edition.artifact_source}', '${art.edition.artifact_id}', '${art.edition.url}');`

		/*
		 *   (5) Easel Table - Patron
		 */

		// INSERT statement for a 'patron' table
		// Schema: id int, artist_id int, external_id text, name text, url text
		let patronsTableStatement = `INSERT INTO ${patronsTable} (id, external_id, name, url) VALUES (${art.patron.id}, '${art.patron.external_id}', '${art.patron.name}', '${art.patron.url}');`



		// Prepare the statements as a single 'statement' object
		const statement = {
			artists: artistsTableStatement,
			attributes: attributesTableStatements,
			artworks: artworksTableStatement,
			editions: editionsTableStatement,
			patrons: patronsTableStatement
		}
		
		// Note the need above to stringify the attributes
		sqlInsertStatements.push(statement)
	}

	// Return the final prepared array of SQL INSERT statements
	return sqlInsertStatements
}

module.exports = { prepareSqlForEaselTables }
