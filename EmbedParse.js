const { EmbedBuilder } = require('discord.js');

class EmbedParse {
	/**
	 * Wrapper for embed builder
	 * @param {*} recMsgDummy Message object link
	 * @param {*} title 
	 * @param {*} description 
	 * @param {*} colour 
	 * @param {*} fieldsToSlapOn array of filed objects [{name: "<name>", value: "<value>"}]
	 * @param {*} useFooter 
	 * @returns 
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