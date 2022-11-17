// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @dev Implementation of Arthaus Artist Patron token.
 */
contract Artist is ERC1155 {
    // A URI used to reference off-chain metadata.
    // This will use the Tableland gateway and query: https://testnet.tableland.network/query?mode=list&s=
    // See the `query?mode=list&s=` appended -- a SQL query `s` and mode to format to ERC721 standard
    string public baseURIString;

    /// The name of the artists table in Tableland (core token representation)
    // Schema: id int primary key, external_id text, name text, description text, image text, profile text, portfolio text, gallery text
    string public artistsTable;

    /// The name of the (artist) attributes table in Tableland
    // Schema: artist_id int not null, trait_type text not null, value text
    string public attributesTable;

    /// The name of the artworks table in Tableland
    // Schema: id int primary key, artist_id int not null, external_id text, name text, url text
    string public artworksTable;

    /// The name of the editions table in Tableland
    // Schema: id int not null, artwork_id int not null, patron_id int not null, external_id text, number int not null, total int not null, artifact_source text not null, artifact_id text not null, url text
    string public editionsTable;

    /// The name of the patrons table in Tableland
    // Schema: id int primary key, external_id text, name text, url text
    string public patronsTable;

    /// A token counter, to track Artist tokenIds
    uint256 private _tokenIdCounter;

    /**
     * @dev Initialize Artist Contract
     * baseURI - Set the contract's base URI to the Tableland gateway
     * _mainTable - The name of the 'main' table for NFT metadata
     * _attributesTable - The corresponding 'attributes' table
     */
    constructor(
        string memory baseURI,
        string memory _artistsTable,
        string memory _attributesTable
    ) ERC1155("") {
        // Initialize with token counter at zero
        _tokenIdCounter = 0;

        // Set the baseURI to the Tableland gateway
        baseURIString = baseURI;

        // Set the table names
        artistsTable = _artistsTable;
        attributesTable = _attributesTable;
    }

    /**
     *  @dev Must override the default implementation, which simply appends a `tokenId` to _baseURI.
     *  artistId - The id of Arthaus artist
     */
    function uri(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        // Set base URI
        string memory baseURI = baseURIString;

        if (bytes(baseURI).length == 0) {
            return "";
        }

        /**
         *   A SQL query to JOIN two tables to compose the metadata accross a 'main' and 'attributes' table
         *
         *   SELECT json_object(
         *       'id', id,
         *       'name', name,
         *       'description', description,
         *       'image', image,
         *       'attributes', json_group_array(
         *           json_object(
         *               'trait_type',trait_type,
         *               'value', value
         *           )
         *       )
         *   )
         *   FROM {mainTable} JOIN {attributesTable}
         *       ON {mainTable}.id = {attributesTable}.main_id
         *   WHERE id = <main_id>
         *   GROUP BY id
         */
        string memory query = string(
            abi.encodePacked(
                "SELECT%20json_object%28%27id%27%2Cid%2C%27name%27%2Cname%2C%27description%27%2Cdescription%2C%27image%27%2Cimage%2C%27attributes%27%2Cjson_group_array%28json_object%28%27trait_type%27%2Ctrait_type%2C%27value%27%2Cvalue%29%29%29%20FROM%20",
                artistsTable,
                "%20JOIN%20",
                attributesTable,
                "%20ON%20",
                artistsTable,
                "%2Eid%20%3D%20",
                attributesTable,
                "%2Emain_id%20WHERE%20id%3D"
            )
        );
        // Return the baseURI with a query string, which looks up the token id in a row.
        // `&mode=list` formats into the proper JSON object expected by metadata standards.
        return
            string(
                abi.encodePacked(
                    baseURI,
                    query,
                    Strings.toString(tokenId),
                    "%20group%20by%20id"
                )
            );
    }

    /**
     * @dev Returns the contract OpenSea metadata specifiation.
     */

    function contractURI() public view returns (string memory) {
        return "https://storage.googleapis.com/arthaus-cdn/easel/contracts/artist/0.1.0/Artist.json";
    }

    /**
     * @dev Mint an Artist Patron token - using artist ID as token ID reference. Mints to the sender.
     */
    function mint(uint256 tokenId) public {
        // Mint a new Patron token
        _mint(msg.sender, tokenId, 1, "");
    }
}
