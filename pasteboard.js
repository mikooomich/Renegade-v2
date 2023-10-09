const fs = require('fs');
const pbDataVersion = 'dev3';

let boardName = "default";
let boardPath; // = `./PbData/default/${boardName}.json`


/**
 * Searches for an element inside a given array
 * 
 * @param array Array to search
 * @param thingyToSearch The element to search for. A full alias
 * @param useRoughSearch Use a case insensivive "contains" match search. Default is false
 * 
 * @return {int} The index of the item in the array, -1 if the item is not found
 */
function aliasSearch(array, thingToSearch, useRoughSearch = false) {
	if (useRoughSearch) {
		let item = array.find((element) => { return element.alias.toLowerCase().includes(thingToSearch) });
		return item ? item.id : -1;
	}

	let item = array.find((element) => { return element.alias == thingToSearch });
	return item ? item.id : -1;
}

/**
 * 
 * 
 * @param array Array to search
 * @param thingyToSearch The element to search for. An integer id
 * 
 * @return {int} The index of the item in the array, -1 if the item is not found
 */
function idSearch(array, thingToSearch) {
	let item = array.find((element) => { return element.id == thingToSearch });
	return item ? item.id : -1;
}

/**
 * Create a new paste object
 */
class Pasteboard {

	/**
	 * Create a pasteboard object
	 * @param {*} recMsgDummyy message object link
	 * @param {*} content 
	 * @param {*} boardAlias name of pasteboard this belongs to
	 */
	constructor(recMsgDummyy, content, boardAlias) {

		this.database = {
			version: pbDataVersion,
			boardName: boardName,
			lastIndex: 0,
			pasteboard: []
		};

		// get info from message <prefix>pb <alias> <content>
		this.recMsgDummy = recMsgDummyy;
		this.alias = this.recMsgDummy.content.replace("\n", " ").split(' ').slice(1)[0]; // take the first word after prefix, regardless of seperated by space or new line
		this.date = new Date();
		this.currentGuild = `${this.recMsgDummy.guild.name} (${this.recMsgDummy.guild.id})`;
		this.pasteAuthor = `${this.recMsgDummy.author.username} (${this.recMsgDummy.author.id})`;
		this.pastecontent = content;

		// setup path
		if (boardAlias != undefined) {
			boardName = boardAlias;
		} // else use default name

		boardPath = `./PbData/${this.recMsgDummy.guild.id}/${boardName}.json`;
	}


	/**
	 * Startup function. This will setup the pastboard for use.
	 */
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
		if (!fs.existsSync(`./PbData/${this.recMsgDummy.guild.id}`)) {
			fs.mkdirSync(`./PbData/${this.recMsgDummy.guild.id}`);
		}

		fs.writeFile(boardPath, JSON.stringify(newDatabase, null, 2), (err) => {
			if (err) {
				console.error(err);
				throw "File write failure (This is very bad)";
			};
			console.log("Pasteboard database has been created successfuly");
		});
	}


	/**
	 * Read the database file
	 * @returns 
	 */
	read() {
		/**
		 * Read data from database
		 */
		try {
			this.database = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));
			return this.database;
		}
		catch (err) {
			return undefined;
		}
	}


	/**
	 * Delete a paste from the pasteboard, writes the new pasteboard file
	 * @param {} searchID 
	 * @returns 
	 */
	evict(searchID = false) {

		let deletedElement;
		let indexOfPaste;

		try {
			this.database = this.read();
		}
		catch (error) {
			console.log("read fail,");
			this.initiation();
			return "First run error, try again";
		}


		try {
			// search for paste
			if (searchID == true) {
				if (this.alias == 0) { // for certain people who try to delete things they shouldn't
					return "Unable to delete paste header";
				}
				indexOfPaste = idSearch(this.database.pasteboard, this.alias);
			}
			else {
				indexOfPaste = aliasSearch(this.database.pasteboard, this.alias);
			}


			if (indexOfPaste <= -1) {
				return 'Paste does not exist';
			}
			else {
				deletedElement = this.database.pasteboard.splice(indexOfPaste, 1);

				fs.writeFile(`${boardPath}`, JSON.stringify(this.database, null, 2), (err) => {
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



	/**
	 * Retrieve a paste from the pasteboard. Returns the paste content
	 * @param {*} searchID true to search by id, else or alias
	 * @returns 
	 */
	paste(searchID = false) {

		try {
			this.database = this.read();
			let indexOfPaste;

			if (searchID == true) {
				indexOfPaste = idSearch(this.database.pasteboard, this.alias);
			}
			else {
				indexOfPaste = aliasSearch(this.database.pasteboard, this.alias);
			}

			return this.database.pasteboard[indexOfPaste].content;
		}

		catch (err) {
			// console.log(err)
			return 'Paste does not exist';
		}
	}




	/**
	 * Add a paste to pasteboard
	 * @returns 
	 */
	copy() {

		try {
			this.database = this.read();

			let pasteEntry = {
				id: this.database.lastIndex + 1,
				alias: this.alias,
				date: this.date,
				currentGuild: this.currentGuild,
				author: this.pasteAuthor,
				content: this.pastecontent
			};

			this.database.lastIndex += 1; // increment index like a tachometer
			let searchArray = aliasSearch(this.database.pasteboard, this.alias);

			if (searchArray <= -1) {
				this.database.pasteboard.push(pasteEntry);
				fs.writeFile(`${boardPath}`, JSON.stringify(this.database, null, 2), (err) => {
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



	/**
	 * Get a list all avalible pastes
	 * @returns 
	 */
	listPastes() {
		let availablePastes = '';

		try {
			this.database = this.read();

			for (const i in this.database.pasteboard) { // list all the aliases
				availablePastes = availablePastes + (`(${this.database.pasteboard[i].id}) ` + this.database.pasteboard[i].alias + "\n");
			}
			return "`" + availablePastes + "`";
		}

		catch (error) {
			this.initiation(); // First-time setup
			return "The pasteboard is empty";
		}
	}


	/**
	 * This function is currently WIP
	 * Retrieves information about a paste from the pasteboard
	 * 
	 * @returns 
	 */
	getInfo() {
		try {

			this.database = this.read();

			let indexOfPaste = aliasSearch(this.database.pasteboard, this.alias);
			// console.log(indexOfPaste)
			if (indexOfPaste <= -1) {
				return 'Paste does not exist';
			}
			else {
				let infoSpam = JSON.stringify(this.database.pasteboard[indexOfPaste]);
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