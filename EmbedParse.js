const { EmbedBuilder } = require('discord.js');

class EmbedParse {
	/**
	 * A poor, non dynamic method of parsing of a rich embed
	 * 
	 * @param {*} recMsgDummy Message object
	 * @param {*} title message heading
	 * @param {*} description message content
	 * @param {*} colour colour of side bar
	 * @param {*} field1Name field heading
	 * @param {*} field1 field body
	 * @param {*} field2Name 
	 * @param {*} field2 
	 * @param {*} field3Name 
	 * @param {*} field3 
	 * @param {*} field4Name 
	 * @param {*} field4 
	 * @param {*} field5Name 
	 * @param {*} field5 
	 * @param {*} field6Name 
	 * @param {*} field6 
	 * @returns a rich embed
	 */

	constructor(recMsgDummy, title, description, colour, fieldsToSlapOn, useFooter) {
		let parseEmbed = new EmbedBuilder()
		parseEmbed.setTimestamp();

		if (title != undefined) { parseEmbed.setTitle(title) }
		if (description != undefined) { parseEmbed.setDescription(description) }
		if (fieldsToSlapOn != undefined) { parseEmbed.addFields(fieldsToSlapOn) }
		if (colour != undefined) { parseEmbed.setColor(colour) }
		// if (title != undefined) {parseEmbed.setTitle(title)}
		if (useFooter == true) {
			parseEmbed.setFooter({ text: recMsgDummy.member.user.username, iconURL: recMsgDummy.member.user.avatarURL({ format: 'png', dynamic: true }) });
		}


		if (title == undefined && description == undefined && fieldsToSlapOn == undefined) {
			parseEmbed.setDescription("Hmmm... the developer didn't use embeds properly...");
		}


		return parseEmbed;
	}


}

module.exports = EmbedParse;