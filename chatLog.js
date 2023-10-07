const fs = require('fs');
const config = require('./Renegade.json');


function timeStampy() {
	/**
	 * Gets the current time
	 * 
	 * @returns: formatted string
	 */

	var date = new Date();
	var dateStr =
		date.getFullYear() + "-" +
		("00" + (date.getMonth() + 1)).slice(-2) + "-" +
		("00" + date.getDate()).slice(-2) + " " +

		("00" + date.getHours()).slice(-2) + ":" +
		("00" + date.getMinutes()).slice(-2) + ":" +
		("00" + date.getSeconds()).slice(-2);
	// console.log(dateStr);
	return dateStr
}


class BotLogging {
	/**
	 * This handles bot event logging
	 * 
	 * @param {String} level level of logging (DEBUG, WARNING, INFO, ERROR, CRITICAL)
	 * @param {String} stuffToLog content to be logged
	 */

	constructor(level, stuffToLog) {
		if (!fs.existsSync(`./chatLogs`)) {
			fs.mkdirSync(`./chatLogs`);
		}

		if (config.bot.botLogging == 'true') { // on/off swtich

			if (level == undefined) { // undefined lebel creates a break, intended for use when bot boots
				fs.appendFileSync('logs.txt', "\n--------------------------------------------------\n"); // use new lines for formatting reasons
			}
			else {
				fs.appendFileSync('logs.txt', `${timeStampy()} - ${level} - ${stuffToLog}\n`);
			}
		}
	}

}


class ChatLogMe {
	/**
	 * This handles chat (channel) logging
	 * 
	 * @param {*} server name of uild
	 * @param {*} channel channel name
	 * @param {*} dood message author
	 * @param {*} stuffToLog content
	 */
	constructor(server, channel, dood, stuffToLog) {
		this.server = server;
		this.channel = channel;
		this.dood = dood;
		this.stuffToLog = stuffToLog;
	}


	logMe() {
		try {
			fs.appendFileSync(`chatLogs/${this.server}/chatLogs.txt`, `${timeStampy()} - ${this.server} - ${this.channel} - ${this.dood}: ${this.stuffToLog}\n`);
		}
		catch {
			if (!fs.existsSync(`./chatLogs/${this.server}`)) {
				fs.mkdirSync(`./chatLogs/${this.server}`);
			}

			fs.appendFileSync(`chatLogs/${this.server}/chatLogs.txt`, `${timeStampy()} - ${this.server} - ${this.channel} - ${this.dood}: ${this.stuffToLog}\n`);
		}
	}

}

module.exports = { ChatLogMe, BotLogging };