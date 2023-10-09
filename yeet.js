// Welcome to my jank code
const version = "0.0.1 (1)";
const whatTheJsonVersionShouldBeForThisVersonOfTheBot = "0.0.1 (1)";

// modules, libraries, etc
const { Client, GatewayIntentBits, Partials, PermissionsBitField, ActivityType } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');

const client = new Client({
	intents: [GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], partials: [Partials.Channel]
});
const config = require('./Renegade.json');
const res = require('./resource.json');
const prefix = config.bot.prefix;
const osu = require('node-os-utils');
const os = require('os');


// Bot Modules
const { ChatLogMe, BotLogging } = require('./chatLog');
const Pasteboard = require('./pasteboard.js');
const MusicPlayer = require('./MusicPlayer');
const EmbedParse = require('./EmbedParse');
let musicPlayer = new MusicPlayer();
// const econ = require('./econ.js')


// rate limiter
const antiSpam = new Set();
// const antiSpamEcon = new Set();
// const sloTFdownStalk = new Set();
// const sloTFdownSpam = new Set();
// const sloTFdownDab = new Set();
// const sloTFdownDaily = new Set();

// Other variables
const bytesToMB = 1 / 1048576;
let playerBoundMessage; // for music player, a copy of recmsg. currently used for embed parsing and state of the player being alive
const Starttime = Date.now(); // start timestamp of the bot

function sleep(ms) {
	/** 
	* Pause execution for a defined amount of time
	* 
	* @param {int} ms milliseconds to pause for
	*/
	return new Promise(resolve => setTimeout(resolve, ms));
}

function getTimeString(ms) {
	/**
	* Convert time in ms to string
	*
	* @param {int} ms time in miliseconds
	* @returns uptime in formatted string
	*/

	let msCopy = ms;

	let days = Math.floor(ms / 86400);
	ms %= 86400;
	let hours = Math.floor(ms / 3600);
	ms %= 3600;
	let minutes = Math.floor(ms / 60);
	let seconds = ms % 60;

	if (ms == 0) {
		return -1
	}
	else if (msCopy >= 86400) { //day
		return `${days} day(s), ${hours} hr, ${minutes} min, ${Math.round(seconds)} sec`;
	}
	else if (msCopy >= 3600) { //hour
		return `${hours} hr, ${minutes} min, ${Math.round(seconds)} sec`;
	}
	else if (msCopy >= 60) { // minute
		return `${minutes} min, ${Math.round(seconds)} sec`;
	}
	else if (msCopy >= 1) { //second
		return `${Math.round(seconds)} sec`;
	}
}

function helpMsg(variant, recMsgDummy) {
	/**
	 * Compiles help text(s)
	 * 
	 * @param {String} variant which help text to send
	 * @param {Object} recMsgDummy yes.
	 */


	if (variant == "depricated") {
		return res.helpDepricated;
	}
	else {
		return new EmbedParse(recMsgDummy, 'Bot Commands', `The prefix is (${prefix})`, 6053119,
			[
				{ name: `General`, value: res.help.General },
				{ name: 'Pasteboard', value: res.help.Pasteboard },
				{ name: 'Economy', value: res.help.Economy },
				{ name: 'Music', value: res.help.Music }
			]);
	}
}

function getInfo(callback, embedSwitch, recMsgDummy) {
	/**
	 * Return system and bot nerd stats, either in a rich embed or just plain text
	 * 
	 * @param {Object} callback nessesary for cpu usage
	 * @param {String} embedSwitch specify whether to use rich embed or plain text
	 * @param {Object} recMsgDummy pass along data to use to compile messages
	 */

	return new Promise(function (resolve, reject) {
		let infoMsg = '';

		osu.cpu.usage()
			.then(usg => {
				// bot info 
				let nodePlatform = process.platform;
				let nodeVersion = process.version;
				let discordjsVer = require("discord.js").version;
				let musicModuleVer = musicPlayer.getVersion();
				let memUsg = process.memoryUsage().heapUsed / 1024 / 1024;
				let botMemUsg = `${Math.round(memUsg * 100) / 100}`;
				let botUptime = getTimeString(client.uptime / 1000);
				let botConfigFile = `${config.bot.jsonVersion} (expected: ${whatTheJsonVersionShouldBeForThisVersonOfTheBot})`;

				//system info
				let coreCount = physicalCpuCount = require('physical-cpu-count');
				let hostCPU = `(${os.arch()}), ${coreCount}C/${osu.cpu.count()}T`;
				let cpuUilization = `${usg}% (${os.loadavg()})`;
				let hostOS = `${os.type} (${os.platform()})`;
				let hostMemUsg = `${parseInt(os.totalmem * bytesToMB) - parseInt(os.freemem * bytesToMB)}/${parseInt(os.totalmem * bytesToMB)} MB (${(((parseInt(os.totalmem * bytesToMB) - parseInt(os.freemem * bytesToMB)) / parseInt(os.totalmem * bytesToMB)) * 100).toFixed(2)}% usage)`;
				let hostUptime = getTimeString(os.uptime);


				// some systems may have issues with this, ex. Termux Android
				try {
					hostCPU = `${osu.cpu.model()} (${os.arch()}), ${coreCount}C/${osu.cpu.count()}T`;
				}
				catch (error) {
					new BotLogging('WARNING', `Could not resolve cpu model`);
				}

				if (embedSwitch == 'embed') { // use rich embeds
					infoMsg = new EmbedParse(recMsgDummy, "Bot Info", 'Hewwo? Is this thing on?', 13691445,
						[{
							name: 'Bot', value: `**Version:** ${version}
**Music Module:** ${musicModuleVer}
**Platform:** ${nodePlatform}
**Node:** ${nodeVersion}
**discord.js:** ${discordjsVer}
**Memory Usg:** ${botMemUsg} MB
**Uptime:** ${botUptime}
**Prefix:** ${config.bot.prefix}
**Config**: ${botConfigFile}`
						},

						{
							name: 'Host Device', value: `**CPU:** ${hostCPU}
**Utilization:** ${cpuUilization}
**OS:** ${hostOS}
**RAM:** ${hostMemUsg}
**Uptime:** ${hostUptime}
`}]);
					callback(infoMsg);
				}


				else { // no rich embeds
					infoMsg = `
            --Bot--
            Version: ${version}
            Music Module: ${musicModuleVer}
            Platform: ${nodePlatform}
            Node: ${nodeVersion}
            discord.js: ${discordjsVer}
            Memory Usg: ${botMemUsg} MB
            Uptime: ${botUptime}
            Prefix: ${config.bot.prefix}
            Config: ${botConfigFile}

            --Host Device--
            CPU: ${hostCPU}
            Utilization: ${cpuUilization}
            OS: ${hostOS}
            RAM: ${hostMemUsg}
            Uptime: ${hostUptime}`;
					callback(infoMsg);
				}

			})
	})

}








//loading

client.once('ready', () => {
	/**
	 * bot boot process
	 */

	new BotLogging('INFO', `Booting... 

Bot Version:  ${version}
Using Config File: ${config.configName}
Config Version: ${config.bot.jsonVersion} (expected: ${whatTheJsonVersionShouldBeForThisVersonOfTheBot})
Node Version:  ${process.version}
Servers:
`);

	console.log("Connected as " + client.user.tag);
	console.log("Servers:");
	client.guilds.cache.forEach((guild) => {
		console.log(" - " + guild.name);
	})


	try { // post a bot wake message to testing channel
		if (Number.isInteger(parseInt(config.bot.testingChannel))) {
			client.channels.cache.get(config.bot.testingChannel).send({ content: 'I is the online' });
		}
		else {
			console.log('Wake message disabled');
		}
	}
	catch (e) {
		console.log('--Invalid channel ID specified?--');
		console.log('Wake message failed');
		console.log(e);
	}


	console.log('--------------------------');
	getInfo(function (infoMsg) {
		console.log(infoMsg);



		if (config.bot.jsonVersion != whatTheJsonVersionShouldBeForThisVersonOfTheBot) {
			console.log('JSON version mismatch, you may run into issues. Have: ' + config.bot.jsonVersion + ", Expected: " + whatTheJsonVersionShouldBeForThisVersonOfTheBot);
			new BotLogging('WARNING', 'JSON version mismatch, you may run into issues. Have: ' + config.bot.jsonVersion + ", Expected: " + whatTheJsonVersionShouldBeForThisVersonOfTheBot);
		}

		if (config.bot.usePresense == "true") {
			new BotLogging('DEBUG', 'Setting up presense');

			try {
				// client.user.setPresence(config.bot.presenseMsg) // PLAYING, STREAMING, LISTENING, WATCHING
				client.user.setPresence({
					activities: [{ name: config.bot.presenseMsg, type: ActivityType.Playing }],
					status: 'online',
				});
				console.log('Presense set to: ' + config.bot.presenseMsg);
				new BotLogging('DEBUG', 'Done setting up presense\n\n\n');
			}
			catch (e) {
				recMsg
				console.log(e);
				new BotLogging('ERROR', 'Failed to set up presense\n\n\n');
			}
		}

		console.log('-----finished loading-----');
	})

	new BotLogging('INFO', 'Boot completed');
})



/**
 * Music player button interaction
 */
client.on(Events.InteractionCreate, interaction => {
	if (!interaction.isButton()) { return };

	if (playerBoundMessage == undefined) { // destroy players/spawners that are alive when they shouldn't be
		interaction.message.edit({
			embeds: [
				new EmbedParse(playerBoundMessage, "Player Expired", "Please spawn another player", 52224,
				)], components: [musicPlayer.getButtons(1)]
		});
		return
	}

	// prevent acessing old players created before bot boot
	if (interaction.message.createdTimestamp < Starttime) {
		console.log("killing old")
		interaction.message.edit({
			embeds: [
				new EmbedParse(playerBoundMessage, "Player", "Old player, destroyed", 52224,
					[{ name: "⠀", value: "---" }, { name: "Now Playing:", value: "---" }, { name: "Up Next:", value: "---" }]
				)], components: [musicPlayer.getButtons(1)]
		});
		return;
	}


	setTimeout(() => { // add artifical time to ratelimit buttons
		let wah = musicPlayer.getDisplayData()
		let prevDisp = wah[0];
		let nextDisp = wah[1];
		let playingDisp = wah[2];


		switch (interaction.customId) {
			case "next":
				musicPlayer.playerNext("next");
				break;


			case "prev":
				musicPlayer.previous();
				break;
			case "play":
				musicPlayer.pause();
				interaction.message.edit({
					embeds: [new EmbedParse(playerBoundMessage, "Player", "PLAYING", 52224,
						[{ name: "⠀", value: prevDisp }, { name: "Now Playing:", value: playingDisp }, { name: "Up Next:", value: nextDisp }]
					)], components: [musicPlayer.getButtons()]
				});
				break;


			case "pause":
				musicPlayer.pause()
				interaction.message.edit({
					embeds: [
						new EmbedParse(playerBoundMessage, "Player", "PAUSED", 52224,
							[{ name: "⠀", value: prevDisp }, { name: "Now Playing:", value: playingDisp }, { name: "Up Next:", value: nextDisp }]
						)], components: [musicPlayer.getButtons(0)]
				}
				);
				break;


			case "shuffle":
				interaction.message.edit({
					embeds: [
						new EmbedParse(playerBoundMessage, "Player", "Shuffling...", 52224,
							[{ name: "⠀", value: prevDisp }, { name: "Now Playing:", value: playingDisp }, { name: "Up Next:", value: nextDisp }]
						)], components: [musicPlayer.getButtons()]
				});

				musicPlayer.shuffle();
				break;


			case "loop":
				musicPlayer.setOneLoop();
				break;

			case "spawn":
				musicPlayer.setBind(interaction.message);
				musicPlayer.usePlayer();

				interaction.message.edit({
					embeds: [new EmbedParse(playerBoundMessage, "Player", "Hi! Use the buttons to navagate", 52224,
						[{ name: "⠀", value: prevDisp }, { name: "Now Playing:", value: playingDisp }, { name: "Up Next:", value: nextDisp }]
					)], components: [musicPlayer.getButtons()]
				});
				break;


			case "exit":
				musicPlayer.destroyPlayer();
				break;
		}

		interaction.update("⠀") // This serves the sole purpose of adverting failed interaction. idk why there is not a more elegant way to NOT HAVE A REPLY

	}, 200);
});






//General commands
client.on('messageCreate', async recMsg => {
	// console.log(recMsg.content);
	/**
	 * main bot code
	 */


	// Chat logging
	if (config.bot.enableChatlogging == 'true') {
		/**
		 * will log in the following order: regular text, attachment links, embeds
		 * will NOT log message edits. Attachments in embeds may not work
		 */
		let content = recMsg.content;

		// attachments
		recMsg.attachments.forEach(element => {
			content += "\t" + element.url;
		});

		// embeds
		recMsg.embeds.forEach(element => {
			if (element == undefined) { return }
			content += "\n\t\t\t---Logging embeds---\n\n";

			try { // title and description
				content += element.title + "\n" + element.description + "\n\t---fields:---\n";
			} catch {
				content += " !!!title/desc log failure!!!";
			}

			try { // fields
				let fieldCount = 0;
				element.fields.forEach(element2 => {
					content += `+-+Field ${fieldCount}+-+\n`;
					content += "\t" + element2.name + "\n" + element2.value + "\n";
					fieldCount++;
				});
			} catch {
				content += " !!!field log failure!!!";
			}

			content += "\n\t\t\t---Embed logging finish---\n\n";
		});

		let doIt = new ChatLogMe(recMsg.guild.name, recMsg.channel.name, recMsg.author.username, content);
		doIt.logMe();
	}




	if (recMsg.author == client.user || antiSpam.has(recMsg.author.id)) {
		return;
	}
	else {

		//main commands
		let cmd = recMsg.content.toLowerCase(); // I realize that writing recMsg.content.toLowerCase() over again is very inefficient
		switch (cmd) {

			case prefix + 'help':
				recMsg.channel.send({ embeds: [helpMsg(undefined, recMsg)] });
				break;

			case prefix + 'help-depricated':
				recMsg.channel.send({ content: helpMsg('depricated') });
				break;

			case prefix + 'info':
				getInfo(function (infoMsg) {
					recMsg.channel.send({ embeds: [infoMsg] });
				}, 'embed', recMsg);
				break;

			case prefix + 'ping':
				const msg = await recMsg.channel.send({ embeds: [new EmbedParse(recMsg, 'HoW baD iS mY IntERnEt?', "**UwU? Pinging...**", 13691445,)] });
				msg.edit({ embeds: [new EmbedParse(recMsg, 'HoW baD iS mY IntERnEt?', `**UwU!**\nRound-Trip: ${msg.createdTimestamp - recMsg.createdTimestamp}ms.\nAPI: ${Math.round(client.ws.ping)}ms`, 13691445)] });

				console.log(`Pong! ${msg.createdTimestamp - recMsg.createdTimestamp}ms, API:${Math.round(client.ping)}ms)`);
				new BotLogging('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) Executed "ping" - ${msg.createdTimestamp - recMsg.createdTimestamp}ms, API:${Math.round(client.ping)}ms)`);
				break;


			case prefix + 'alt f4':
				new BotLogging('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) Executed "alt f4"`);
				console.log(`${recMsg.author.id} (${recMsg.member.user.username}) Executed "alt f4"`);

				try {
					if (recMsg.author.id == config.bot.owner) { // user id you want to give kill-the-bot perms too, put in json
						console.log('Owner requested terminating...');
						new BotLogging('DEBUG', `Owner requested terminating...`);
						recMsg.channel.send('au revoir!');
						await sleep(3000);
						process.exit();
					}
					else {
						recMsg.channel.send('haha lol XDDDDDDD you cannot kill the bot.');
						console.log(`${recMsg.author.id} (${recMsg.member.user.username}) Termination failure (no permissions)`);
						new BotLogging('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) Termination failure (no permissions)`);
					}
				}
				catch {
					console.log('something went wrong');
					new BotLogging('ERROR', `Something went wrong`);
				}

				break;

			case prefix + 'invite':
				recMsg.channel.send('Add this bot ---> ' + config.bot.botInviteLink);
				new BotLogging('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) Executed "invite"`);
				break;









			default: // all the commands that take arguments

				if (cmd.startsWith(prefix + 'user')) {
					new BotLogging('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) Executed "user"`);

					// retrive user from the message
					let getUseriD = (recMsg.content.split(' ').slice(1)).toString();
					let useriD = getUseriD.replaceAll('@', '').replaceAll("<", '').replaceAll("!", '').replaceAll(">", '');


					let user; // user personal info
					let guildUsr; // user info in regards to guild

					// user information
					let dateCreate;
					let dateJoin;
					let usrHighestRole;
					let allRoles = [];


					if (recMsg.guild.members.cache.has(useriD) || useriD == '') { // is valid user? (id will break if you do not first do the command by mention user, idk)
						user = recMsg.mentions.users.first();

						try {
							guildUsr = recMsg.guild.members.cache.get(user.id);
						}

						catch (errorrrrr) {

							if (useriD.length > 1) { // lookup user via id
								guildUsr = recMsg.guild.members.cache.get(useriD);
								user = await client.users.fetch(useriD).catch(() => null);
								// console.log(user)
								// console.log(user.id)
							}
							else { // lookup message author
								guildUsr = recMsg.guild.members.cache.get(recMsg.author.id);
								user = recMsg.author;
							}
						}

						dateCreate = user.createdAt.toLocaleDateString();
						dateJoin = guildUsr.joinedAt.toLocaleDateString();
						usrHighestRole = guildUsr.roles.highest;
						// get all user's roles
						guildUsr.roles.cache.each(role => allRoles.push(role.name));


						// new BotLogging('DEBUG', `User: ${user.username} (${useriD})`)
						// new BotLogging('DEBUG', `Date create: ${dateCreate}`)
						// new BotLogging('DEBUG', `Date Join: ${dateJoin}`)
						// new BotLogging('DEBUG', `Highest role: ${usrRoles}`)


						recMsg.channel.send({
							embeds: [new EmbedParse(recMsg, "User info", `<@!${user.id}>`, 13691445,
								[
									{ name: 'ID', value: `${user.username} ||(${user.id})||` },
									{ name: 'Account Created', value: `${dateCreate}` },
									{ name: 'Joined Server', value: `${dateJoin}` },
									{ name: 'Highest Role', value: `${usrHighestRole}` },
									{ name: "Roles", value: `${allRoles}` }
								]
							)]
						});
						new BotLogging('DEBUG', `user cmd success`);
					}

					else {
						recMsg.channel.send({ embeds: [new EmbedParse(recMsg, 'ERROR!', `User not found.`, 2727567)] });
						new BotLogging('ERROR', `Rquested user not found`);
					}
				}


				else if (cmd.startsWith(prefix + 'remind')) {
					let args = recMsg.content.split(' ').slice(1);
					let timesUnit = args[1];
					let time = args[0];
					let whatToRemind = recMsg.content.split(' ').slice(3).join(' ');
					let timeToWait = 0;

					try {
						if (time > 0 && !isNaN(time) && isNaN(timesUnit)) {
							function setReminder() {

								if (timeToWait > 2147483647) { // 32 bit int limit 
									timeToWait = 2147483647;
								}
								recMsg.reply({ embeds: [new EmbedParse(recMsg, "Reminder set", `Reminding you in ${getTimeString(timeToWait / 1000)}`, 52224)] });
								sleep(timeToWait).then(() => {
									recMsg.reply({ embeds: [new EmbedParse(recMsg, "Hewwo!", whatToRemind, 52224)] });
								})
							}

							if (timesUnit.toLowerCase() == 'sec') {
								timeToWait = timeToWait + (time * 1000);
							}
							else if (timesUnit.toLowerCase() == 'min') {
								timeToWait = timeToWait + (time * 1000 * 60);
							}
							else if (timesUnit.toLowerCase() == 'hr') {
								timeToWait = timeToWait + (time * 1000 * 60 * 60);
							}
							else if (timesUnit.toLowerCase() == 'day') {
								timeToWait = timeToWait + (time * 1000 * 60 * 60 * 24);
							}
							else {
								recMsg.reply(`Invalid time unit.`);
							}

							setReminder();
						}

						else {
							recMsg.channel.send({ embeds: [new EmbedParse(recMsg, "Error", "Invalid command usage", 52224)] });
						}
					}

					catch {
						recMsg.channel.send({ embeds: [new EmbedParse(recMsg, "Error", "Invalid command usage", 52224)] });
					}
				}

				/**
				 * Music commands
				 * Keep the non-args commands here instead of switch, most have other alias for ease of use
				 */
				else if (cmd == prefix + "listsongs" || cmd == prefix + "list-songs" || cmd == prefix + "ls") {
					const MAX_CHARS = 1950;

					let songStash = musicPlayer.listSongLibrary();
					if (songStash == 0) {
						recMsg.channel.send({ embeds: [new EmbedParse(recMsg, "!", "The song library is empty", 52224)] });
						return;
					}

					let pageCount = 1;
					let charCount = 0;
					let pointer = 0;
					let messageBuffer = []; //message buffer

					while (pointer < songStash.length) {

						while (charCount < MAX_CHARS) {
							let song = songStash[pointer];
							if (song == undefined || song.length + charCount > MAX_CHARS) { break }

							messageBuffer.push(song);
							charCount += song.length;
							pointer++;
						}

						recMsg.channel.send({ embeds: [new EmbedParse(recMsg, `All songs (Page ${pageCount})`, "`" + messageBuffer.join("\n") + "`", 52224)] });
						// reset
						pageCount++;
						charCount = 0;
						messageBuffer = [];
					}
				}

				else if (cmd == prefix + 'queue' || cmd == prefix + 'que') {

					/**
					 * 1 song
					 * 2 song
					 * +n more... last song 
					 */
					if (musicPlayer.getPlayingQueue().length > 0) { // queue not empty

						let head = 0;
						let tail = 1950; // use 1950 char chunks, assume discord character limit is 2000 for (body + title)
						let playSong = ""; // queue, string form
						let playingQueue = musicPlayer.getPlayingQueue();

						for (i in playingQueue) {
							if (playingQueue[i].id == -1) { // this is last element for queues that exceed the defined display length, don't display the number in front
								playSong += playingQueue[i].alias;
								break;
							}
							playSong += `**${parseInt(i) + 1}.** ${playingQueue[i].alias}    (id=${playingQueue[i].id})\n`;
						}

						recMsg.channel.send({ embeds: [new EmbedParse(recMsg, "Current Queue", playSong.substring(head, tail), 52224)] });
					}
					else {
						recMsg.channel.send({ embeds: [new EmbedParse(recMsg, ":exclamation::exclamation::exclamation:", "QUEUE IS EMPTY", 52224)] });
					}

				}

				else if (cmd == prefix + 'shuffle') {
					musicPlayer.shuffle();
					recMsg.channel.send({ embeds: [new EmbedParse(recMsg, "Shuffling Queue", ":twisted_rightwards_arrows:", 52224)] });
				}
				else if (cmd == prefix + 'repeat' || cmd == prefix + 'loop') {
					musicPlayer.setOneLoop();
				}

				else if (cmd == prefix + 'stop' || cmd == prefix + 'leave' || cmd == prefix + 'kill-the-dj') {
					try {
						musicPlayer.destroyPlayer();
					}
					catch (error) {
						recMsg.channel.send({ embeds: [new EmbedParse(recMsg, ":exclamation:", "No music is active", 52224)] });
						return;
					}

					recMsg.channel.send({ embeds: [new EmbedParse(recMsg, ":exclamation:", "Stopping playback and emptying queue", 52224)] });
				}


				else if (cmd.startsWith(prefix + 'next') || cmd.startsWith(prefix + 'slip')) {
					musicPlayer.playerNext("next", recMsg);
				}


				/**
				 * Commands that take args
				 */

				else if (cmd.startsWith(prefix + 'prev')) {
					musicPlayer.previous();
				}

				// spawn player GUI
				else if (cmd == (prefix + 'pl') || cmd == (prefix + 'gui') || cmd == (prefix + 'player')) {
					if (musicPlayer.isEmpty()) {
						recMsg.channel.send("Cannot spawn GUI when queue empty");
						return;
					}

					// ensure old player is dead
					musicPlayer.destroyOldGUI();

					const spawn = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId('spawn')
								.setLabel('Click to spawn interface')
								.setStyle(ButtonStyle.Primary)
						);

					// spawn player prompt
					recMsg.channel.send({
						embeds: [
							new EmbedParse(recMsg, "Player GUI", "Hello.", 52224)
						], components: [spawn]
					});

					playerBoundMessage = recMsg; // keep copy of recmsg
				}


				else if (cmd == (prefix + 'exitgui') || cmd == (prefix + 'killgui') || cmd == (prefix + 'closegui') || cmd == (prefix + 'cg')) {
					try {
						playerBoundMessage = undefined;
						musicPlayer.destroyOldGUI()
					}
					catch (e) {
						console.log(e)
						recMsg.channel.send("No player GUI to kill")
					}
				}

				else if (cmd == (prefix + 'pause') || cmd == (prefix + 'unpause') || cmd == (prefix + 'p')) { musicPlayer.pause() }

				else if (cmd.startsWith(prefix + 'play')) {
					let request = recMsg.content.split(' ').slice(1).join(' ');
					musicPlayer.updateRecMsgDummy(recMsg);

					if (cmd.startsWith(prefix + 'playall')) { // for playall command
						let request = recMsg.content.split(' ').slice(1).join(' ');
						musicPlayer.addToQueue("add-all");
						if (request == "s" || request == "shuffle") {
							musicPlayer.shuffle();
						}
					}
					else if (cmd.startsWith(prefix + 'playnow')) { // for play now command
						musicPlayer.addToQueue("add-force", request);
					}
					else { // for play command
						musicPlayer.addToQueue("add", request);
					}

					musicPlayer.loopWatchDog(); // begin queue
				}

				else if (cmd.startsWith(prefix + 'del')) {
					let request = recMsg.content.split(' ').slice(1).join(' ');
					musicPlayer.updateRecMsgDummy(recMsg)
					recMsg.channel.send({ embeds: [new EmbedParse(recMsg, "Deleting...", musicPlayer.delSong(request), 52224)] });
				}

				else if (cmd.startsWith(prefix + 'rescan') || cmd == (prefix + 'rs')) {
					musicPlayer.scanner();
					recMsg.channel.send({ embeds: [new EmbedParse(recMsg, "Maintnence", "Updated Song List", 52224)] });
				}

				else if (cmd.startsWith(prefix + 'musicadd') || cmd.startsWith(prefix + 'ma')) {
					let request = recMsg.content.split(' ').slice(1).join(' ');
					console.log("a" + request + "b")

					musicPlayer.dlSong(recMsg, request);

				}

				else if (cmd.startsWith(prefix + 'killdl') || cmd == (prefix + 'fkd')) {
					musicPlayer.forceKillDL(recMsg)

				}


				/**
				 * Pasteboard commands
				 */
				else if (cmd.startsWith(prefix + 'pb-del')) {
					let content = recMsg.content.split(' ').slice(2).join(' ')
					let yes = new Pasteboard(recMsg, content)

					if (recMsg.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
						let pasteMsg;

						if (cmd.startsWith(prefix + 'pb-delid')) { // delete by id
							pasteMsg = yes.evict(true);
						}
						else { // delete by alias
							pasteMsg = yes.evict();
						}

						let head = 0;
						let tail = 2000; // use 2000 char chunks, assume discord character limit is 2000

						do {
							recMsg.channel.send((pasteMsg.substring(head, tail)));
							head = tail + 1;
							tail += 2000;


							if (tail > pasteMsg.length && pasteMsg.substring(head, pasteMsg.length).length > 0) {
								recMsg.channel.send(pasteMsg.substring(head, pasteMsg.length));
							}
						} while (tail <= pasteMsg.length);
					}

					else {
						recMsg.channel.send({ content: 'You do not have authority to edit the pasteboard' })
					}
				}


				else if (cmd.startsWith(prefix + 'pb-list')) {
					let yes = new Pasteboard(recMsg);


					let pasteMsg = yes.listPastes();
					let head = 0;
					let tail = 2000; // use 2000 char chunks, assume discord character limit is 2000

					do {
						recMsg.channel.send((pasteMsg.substring(head, tail)));
						head = tail + 1;
						tail += 2000;

						if (tail > pasteMsg.length && pasteMsg.substring(head, pasteMsg.length).length > 0) {
							recMsg.channel.send((pasteMsg.substring(head, pasteMsg.length)));
						}
					} while (tail <= pasteMsg.length);

				}

				else if (cmd.startsWith(prefix + 'pb-info')) {

					let content = recMsg.content.split(' ').slice(2).join(' ');
					let yes = new Pasteboard(recMsg, content);

					let pasteMsg = yes.getInfo();
					let head = 0;
					let tail = 2000; // use 2000 char chunks, assume discord character limit is 2000

					do {
						recMsg.channel.send((pasteMsg.substring(head, tail)));
						head = tail + 1;
						tail += 2000;


						if (tail > pasteMsg.length && pasteMsg.substring(head, pasteMsg.length).length > 0) {
							recMsg.channel.send((pasteMsg.substring(head, pasteMsg.length)));
						}
					} while (tail <= pasteMsg.length);
				}


				else if (cmd.startsWith(prefix + 'pb')) { // main command, paste and copy

					try {
						let suffix = recMsg.content.split(' ').slice(1);
						let alias = suffix[0];
						let content = recMsg.content.split(' ').slice(2).join(' ').replace("\n", " ");

						let yes = new Pasteboard(recMsg, content);
						if (content == '' && alias != undefined) { // paste
							let pasteMsg;

							if (cmd.startsWith(prefix + 'pbid')) {
								pasteMsg = yes.paste(true); // paste by id
							}
							else {
								pasteMsg = yes.paste(); // paste by alias
							}


							let head = 0;
							let tail = 2000; // use 2000 char chunks, assume discord character limit is 2000

							do {
								recMsg.channel.send((pasteMsg.substring(head, tail)));
								head = tail + 1;
								tail += 2000;


								if (tail > pasteMsg.length && pasteMsg.substring(head, pasteMsg.length).length > 0) {
									recMsg.channel.send((pasteMsg.substring(head, pasteMsg.length)));
								}
							} while (tail <= pasteMsg.length);
						}

						else if (alias != undefined && content != undefined) { // copy
							if (recMsg.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
								try {
									recMsg.channel.send({ content: yes.copy() });
								}

								catch (error) {
									recMsg.channel.send({ content: 'Paste add failure' });
									console.log(error);
								}
							}

							else {
								recMsg.channel.send({ content: 'You do not have authority to edit the pasteboard' });
							}
						}
					}


					catch (e) {
						console.log(e);
						console.log('something went wrong');
						new BotLogging('ERROR', `Something went wrong`);
						recMsg.channel.send({ content: 'something went wrong' })
					}
				}


		}


		antiSpam.add(recMsg.author.id);
		setTimeout(() => {
			antiSpam.delete(recMsg.author.id);
		}, 1000); //1sec
	}




})


client.login(config.bot.token);




const readline = require('readline');
const propter = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});


/**
 * keep prompting for input, 99% sure recursion memory leak
 */
function inputWatch() {
	propter.question("Enter a command\n>", function (cmd) {
		switch (cmd) {
			case "help":
				console.log("Avalible commands:\nhelp: Prints this message\nexit: terminate this process\n");
				break;

			case "exit":
				console.log("Exiting");
				new BotLogging('DEBUG', `Console request termination`);
				musicPlayer.destroyPlayer(true);
				console.log("Finished shutdown sequence");
				new BotLogging('DEBUG', `Finished shutdown sequence`);
				process.exit(0);
				break;

			default:
				console.log("Invalid command, type help to view a list of commands\n");
		}

		inputWatch();
	})
}

inputWatch();