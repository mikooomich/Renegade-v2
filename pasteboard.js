const fs = require('fs');
const pbDataVersion = 'dev3';

var boardName = "default";
var boardPath; // = `./PbData/default/${boardName}.json`

let recMsgDummy;
let alias;
let date;
let currentGuild;
let pasteAuthor;
let pastecontent;
let database = {
	version: pbDataVersion,
	boardName: boardName,
	lastIndex: 0,
	pasteboard: []
};




function aliasSearch(array, thingToSearch) {
	/**
	 * Searches for a thing inside a given array with the extremely inefficient linear search method
	 * 
	 * @param array An array
	 * @param thingyToSearch The number to search for
	 * 
	 * @return {int} The index of the item in the array
	 * @return {int} -1 if the item is not found
	 */

	for (const i in array) {
		if (array[i].alias == thingToSearch) {
			return parseInt(i);
		}
	}
	return -1;
}

function idSearch(array, thingToSearch) {
	/**
	 * Searches for a thing inside a given array with the extremely inefficient linear search method
	 * 
	 * @param array An array
	 * @param thingyToSearch The number to search for
	 * 
	 * @return {int} The index of the item in the array
	 * @return {int} -1 if the item is not found
	 */

	for (const i in array) {
		if (array[i].id == thingToSearch) {
			return parseInt(i);
		}
	}
	return -1;
}

class Pasteboard {


	constructor(recMsgDummyy, content, boardAlias) {
		// get info from message <prefix>pb <alias> <content>
		recMsgDummy = recMsgDummyy;
		alias = recMsgDummy.content.replace("\n", " ").split(' ').slice(1)[0]; // take the first word after prefix, regardless of seperated by space or new line
		date = new Date();
		currentGuild = `${recMsgDummy.guild.name} (${recMsgDummy.guild.id})`;
		pasteAuthor = `${recMsgDummy.author.username} (${recMsgDummy.author.id})`;
		pastecontent = content;

		// setup path
		if (boardAlias != undefined) {
			boardName = boardAlias;
		} // else use default name

		boardPath = `./PbData/${recMsgDummy.guild.id}/${boardName}.json`;
	}



	initiation() {
		/**
		 * First-time setup for the pasteboard database file
		 */
		let newDatabase = {
			version: pbDataVersion,
			boardName: boardName,
			lastIndex: 0,
			pasteboard: [{ id: 0, alias: "***Available Pastes***" }] // initiate with id of zero so we can increment id
		};

		if (!fs.existsSync(`./PbData`)) {
			fs.mkdirSync(`./PbData`);
		}
		if (!fs.existsSync(`./PbData/${recMsgDummy.guild.id}`)) {
			fs.mkdirSync(`./PbData/${recMsgDummy.guild.id}`);
		}

		fs.writeFile(boardPath, JSON.stringify(newDatabase, null, 2), (err) => {
			if (err) {
				console.error(err);
				throw "File write failure (This is very bad)";
			};
			console.log("Pasteboard database has been created successfuly");
		});
	}



	read() {
		/**
		 * Read data from database
		 */
		try {
			database = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));
			return database;
		}
		catch (err) {
			return undefined;
		}
	}



	evict(searchID = false) {
		/**
		 * Deletes a paste from the pasteboard
		 * Delete the entry, modify database, then write back to file
		 */

		let deletedElement;
		let indexOfPaste;

		try {
			database = this.read();
		}
		catch (error) {
			console.log("read fail,");
			this.initiation();
			return "First run error, try again";
		}


		try {
			// search for paste
			if (searchID == true) {
				if (alias == 0) { // for certain people who try to delete things they shouldn't
					return "Unable to delete paste header";
				}
				indexOfPaste = idSearch(database.pasteboard, alias);
			}
			else {
				indexOfPaste = aliasSearch(database.pasteboard, alias);
			}


			if (indexOfPaste <= -1) {
				return 'Paste does not exist';
			}
			else {
				deletedElement = database.pasteboard.splice(indexOfPaste, 1);

				fs.writeFile(`${boardPath}`, JSON.stringify(database, null, 2), (err) => {
					if (err) {
						console.error(err);
						throw "File write failure";
					};
				});

				return `Successfully deleted from pasteboard: ${deletedElement[0].alias}\n\n ${deletedElement[0].content}`;
			}
		}

		catch (err) {
			console.log("Delete failed:\n " + err);
			return "Delete failed:\n " + err;
		}
	}




	paste(searchID = false) {
		/**
		 * Retrieve paste from clipboard
		 * Default to paste by alias
		 */

		try {
			database = this.read();
			let indexOfPaste;

			if (searchID == true) {
				indexOfPaste = idSearch(database.pasteboard, alias);
			}
			else {
				indexOfPaste = aliasSearch(database.pasteboard, alias);
			}

			return database.pasteboard[indexOfPaste].content;
		}

		catch (err) {
			// console.log(err)
			return 'Paste does not exist';
		}
	}





	copy() {
		/**
		 * Add a paste to pasteboard
		 */

		try {
			database = this.read();

			let pasteEntry = {
				id: database.lastIndex + 1,
				alias: alias,
				date: date,
				currentGuild: currentGuild,
				author: pasteAuthor,
				content: pastecontent
			};

			database.lastIndex += 1; // increment index like a tachometer
			let searchArray = aliasSearch(database.pasteboard, alias);

			if (searchArray <= -1) {
				database.pasteboard.push(pasteEntry);
				fs.writeFile(`${boardPath}`, JSON.stringify(database, null, 2), (err) => {
					if (err) {
						console.error(err);
						throw "File write failure";
					};
				});
				return 'Added to pasteboard';
			}
			else {
				return 'Paste already exists';
			}
		}

		catch (err) { // assume write failure means file does not exist
			// console.log(err)
			this.initiation(); // run first-time setup
			return 'New pasteboard setup complete, please add your paste again';
		}
	}




	listPastes() {
		/**
		 * list all avalible pastes
		 */

		let availablePastes = '';

		try {
			database = this.read();

			for (const i in database.pasteboard) { // list all the aliases
				availablePastes = availablePastes + (`(${database.pasteboard[i].id}) ` + database.pasteboard[i].alias + "\n");
			}
			return "`" + availablePastes + "`";
		}

		catch (error) {
			this.initiation(); // First-time setup
			return "The pasteboard is empty";
		}
	}


	getInfo() {
		/**
		 This function is currently WIP
				retrieves information about a paste from the pasteboard
		*/

		try {

			database = this.read();

			let indexOfPaste = aliasSearch(database.pasteboard, alias);
			// console.log(indexOfPaste)
			if (indexOfPaste <= -1) {
				return 'Paste does not exist';
			}
			else {
				let infoSpam = JSON.stringify(database.pasteboard[indexOfPaste]);
				return "`This function is currently WIP`\n" + infoSpam.replaceAll(',', '\n').replaceAll("{", '').replaceAll('"', '').replaceAll('}', '');
			}
		}

		catch (err) {
			console.log(err)
			return "PB Info command failure";
		}
	}


}


module.exports = Pasteboard;