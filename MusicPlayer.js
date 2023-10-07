const fs = require('fs');
const EmbedParse = require('./EmbedParse');
const https = require('https');
const version = '1013-music';

const { exec } = require('child_process');
var masterSongList = "default";
const config = require('./Renegade-meepco.json');
const boardPath = config.bot.boardPath;

const dlBinary = config.bot.dlBinary;
const dlPath = config.bot.dlPath;
const dlArgs = config.bot.dlArgs;
const dlFormatting = config.bot.dlFormatting;

const MAX_DISP_CHARS = config.bot.MAX_DISP_CHARS;

let alias; // name or id of song
// let requestAuthor;
let database = { // avalible songs on disk
	boardName: masterSongList,
	songboard: []
};
const { getVoiceConnection, VoiceConnectionStatus, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, joinVoiceChannel, createAudioResource } = require('@discordjs/voice');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { error } = require('console');

let downloaderBusy = false;
let downloader; // downloader ecec

/**
 * buttons
 */
// for destroyed players
const empty = new ActionRowBuilder().addComponents(
	new ButtonBuilder()
		.setCustomId('w')
		.setLabel('This player is destroyed.')
		.setStyle(ButtonStyle.Danger)
		.setDisabled(true));
// for active players
const rowOfButtons = new ActionRowBuilder().addComponents(
	new ButtonBuilder()
		.setCustomId('shuffle')
		.setLabel('🔀')
		.setStyle(ButtonStyle.Secondary),

	new ButtonBuilder()
		.setCustomId('prev')
		.setLabel('⏮️')
		.setStyle(ButtonStyle.Primary),

	new ButtonBuilder()
		.setCustomId('pause')
		.setLabel('⏸️')
		.setStyle(ButtonStyle.Danger),

	new ButtonBuilder()
		.setCustomId('next')
		.setLabel('⏭️')
		.setStyle(ButtonStyle.Primary),

	new ButtonBuilder()
		.setCustomId('loop')
		.setLabel('🔂')
		.setStyle(ButtonStyle.Secondary),
	// :arrow_forward: 
	// :pause_button: 
	// :track_next:   
	// :repeat::repeat_one:
);

// for when paused
const pausedButtons = new ActionRowBuilder().addComponents(
	new ButtonBuilder()
		.setCustomId('shuffle')
		.setLabel('🔀')
		.setStyle(ButtonStyle.Secondary),

	new ButtonBuilder()
		.setCustomId('prev')
		.setLabel('⏮️')
		.setStyle(ButtonStyle.Primary),

	new ButtonBuilder()
		.setCustomId('play')
		.setLabel('▶️')
		.setStyle(ButtonStyle.Danger),

	new ButtonBuilder()
		.setCustomId('next')
		.setLabel('⏭️')
		.setStyle(ButtonStyle.Primary),

	new ButtonBuilder()
		.setCustomId('loop')
		.setLabel('🔂')
		.setStyle(ButtonStyle.Secondary),
	// :arrow_forward: 
	// :pause_button: 
	// :track_next:   
	// :repeat::repeat_one:
);



/**
 * Searches for an element inside a given array with the extremely inefficient linear search method
 * 
 * @param array Array to search
 * @param thingyToSearch The element to search for. A full alias
 * 
 * @return {int} The index of the item in the array, -1 if the item is not found
 */
function aliasSearch(array, thingToSearch) {
	for (const i in array) {
		if (array[i].alias == thingToSearch) {
			return parseInt(i);
		}
	}
	return -1;
}

/**
 * Searches for an element inside a given array with the extremely inefficient linear search method
 * 
 * @param array Array to search
 * @param thingyToSearch The element to search for. An integer id
 * 
 * @return {int} The index of the item in the array, -1 if the item is not found
 */
function idSearch(array, thingToSearch) {
	for (const i in array) {
		if (array[i].id == thingToSearch) {
			return parseInt(i);
		}
	}
	return -1;
}

/**
 * I stole err... I mean borrowed this Fisher-Yates (Kunuth) shuffle function from https://stackoverflow.com/a/2450976 
 * and modified it to not infinite loop on empty array and to ignnore 0th index
 * @param {*} array 
 * @returns 
 */
function shuffle(array) {
	if (array.length <= 0) {
		return;
	}
	let currentIndex = array.length, randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {

		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		if (randomIndex != 0) { // ignore 0th index
			[array[currentIndex], array[randomIndex]] = [
				array[randomIndex], array[currentIndex]];
		}
	}

	return array;
}

/**
 * For music downloader. Updates the screen with output from the download binary
 * 
 * @param {Object} process exec process
 * @param {Object} where recMsg dummy for where to send messages
 * @param {int} timeoutOverride update interval ovveride onver default
 */
async function dlWatchdog(where, timeoutOverride) {
	let pauseTime = config.bot.displayUpdatetimeout;
	if (timeoutOverride != undefined && Number.isInteger(timeoutOverride) && timeoutOverride > 0) {
		pauseTime = timeoutOverride;
	}
	let numberOfSongs = 0;


	await where.channel.send({ embeds: [new EmbedParse(where, 'DL status', "---", 13691445)] }).then((msg) => {
		let title = ":hourglass:";
		let cd = false;

		downloader.stdout.on('data', function (data) {
			data.replace(`../${boardPath}/`, ""); // remove path from message

			if (data.includes("[download] Destination:")) { // set title
				title = data;
			}


			if (data.includes("ERROR:")) {
				msg.edit({ embeds: [new EmbedParse(where, 'Download ERROR', title + "\n" + data, 13691445)] });
				return;
			}

			else if (data.includes("[download] 100% of")) {
				numberOfSongs++;
				setTimeout(() => { // make sure this is last message
					msg.edit({ embeds: [new EmbedParse(where, `Download Completed: ${numberOfSongs} Item(s)`, title + "\n" + data, 13691445)] });
				}, pauseTime);
				return;
			}

			else if (cd == true) { return; }

			cd = true
			// console.log(data); 
			// where.channel.send(data)
			msg.edit({ embeds: [new EmbedParse(where, 'DL status', title + "\n" + data, 13691445)] });


			setTimeout(() => {
				cd = false
			}, pauseTime);

		});
	})
}





class MusicPlayer {

	/**
	 * Hi. This is the music player.
	 * Creates an empty music player, scans disk for audio files
	 * 
	 * This class will only send messages when nessesary. Updated recMsg is required. The user is required to handle sending messages returned.
	 * 
	 * @param {*} recMsgDummyy message object mainly used for sending messages. Can also use updateRecMsg() 
	 */
	constructor(recMsgDummyy) {
		this.recMsgDummy = recMsgDummyy;

		// player settings/ststus
		this.player = undefined;
		this.connection = undefined;
		this.loopOne = false;
		this.playing = false;

		// player GUI
		this.bindGUI = undefined; // interaction.message object for updating GUI
		this.activePlayer = undefined;

		// queue data structure
		this.songQueue = {
			boardName: "`Current Queue`",
			songboard: [],
			prev: []
		};


		// create music folder
		if (!fs.existsSync(`./musicStronghold`)) {
			fs.mkdirSync(`./musicStronghold`);
		}
		if (!fs.existsSync(dlPath)) {
			fs.mkdirSync(dlPath);
		}

		this.scanner();
	}


	/**
	 * Maintenance functions
	 */


	/**
	 * Scan song library folder
	 */
	scanner() {
		let db = {
			boardName: masterSongList,
			songboard: []
		};


		let avalibleSongs = fs.readdirSync(boardPath);

		for (const i in avalibleSongs) {
			db.songboard.push({
				id: db.songboard.length,
				// requester : requestAuthor,
				alias: avalibleSongs[i]
			})
		}

		database = db;
	}

	/**
	 * Slaughter the voice connection. Closes player GUI if active, stop audio player, set playing/oneloop status to false, delete queues
	 * @param {Boolean} firstRun set to true if this is run to ensure player is dead before starting a new player
	 */
	destroyPlayer(firstRun) {
		// only destroy playerGUI if active. firstrun Prevents it from sending message when "ensure player destryed is firstrun status is true"
		if (!this.activePlayer && firstRun != true) {
			if (this.isEmpty()) {
				this.recMsgDummy.channel.send({ embeds: [new EmbedParse(this.recMsgDummy, ":exclamation:", "Queue is empty, playback Stopped", 52224)] });
				// return
			}
			else { // when stopping player before queue ends
				this.recMsgDummy.channel.send({ embeds: [new EmbedParse(this.recMsgDummy, ":exclamation:", "Playback Stopped", 52224)] });
			}
		}


		else if (this.activePlayer) { // kill player GUI if active
			this.updateScrn("stop");
			this.activePlayer = false;
			this.bindGUI = undefined; // unbind
		}


		// kill audioplayer, queues
		this.playing = false;
		this.loopOne = false;
		this.player.stop();
		this.player = undefined;
		this.connection.destroy();
		this.songQueue.songboard = [];
		this.songQueue.prev = [];
	}

	/**
	 * Join channel, prepare audio player for playing music
	 */
	startPlayer() {
		if (this.playing == false) {
			// join the channel and create audio player
			this.connection = joinVoiceChannel({
				channelId: this.recMsgDummy.member.voice.channel.id,
				guildId: this.recMsgDummy.member.guild.id,
				adapterCreator: this.recMsgDummy.guild.voiceAdapterCreator,
			});
			this.player = createAudioPlayer();
		}
	}





	/**
	 * GUI function
	 */

	/**
	 * Updates the display message (GUI). Requires bind to be set, this is the interaction message object used to send messages.
	 * Based on if the queue is empty or not, using the "stop" flag will state if the queue is empty or not.
	 * 
	 * @param {String} whatToDo "stop" signals that this is the final display update before the GUI closes. Anything else is handled as a regular display update
	 */
	updateScrn(whatToDo) {
		if (this.activePlayer != true) {
			return;
		}


		let wah = this.getData();
		let prevDisp = wah[0];
		let nextDisp = wah[1];
		let playingDisp = wah[2];


		// update display
		if (whatToDo != "stop") { // general case, just update screen with new info
			// console.log("updating screen")
			setTimeout(() => { // use delay to hopefully avoid the async programming demons causing display to display wrongly
				this.bindGUI.edit({
					embeds: [
						new EmbedParse(this.recMsgDummy, "Player(auto)", "Use the buttons to navagate" + `\nOneLoop = ${this.loopOne}`, 52224,
							[{ name: "⠀", value: prevDisp }, { name: "Now Playing:", value: playingDisp }, { name: "Up Next:", value: nextDisp }]
						)], components: [rowOfButtons]
				});
			}, 200);
			return;
		}


		if (this.isEmpty()) { // display stop, empty
			this.bindGUI.edit({
				embeds: [
					new EmbedParse(this.recMsgDummy, "Player(auto)", "Player stopped, empty queue", 52224,
						[{ name: "⠀", value: prevDisp }, { name: "Now Playing:", value: "---" }, { name: "Up Next:", value: "---" }]
					)], components: [empty]
			});

			return;
		}


		// general stop case
		this.bindGUI.edit({
			embeds: [
				new EmbedParse(this.recMsgDummy, "Player(auto)", "Player stopped", 52224,
					[{ name: "⠀", value: prevDisp }, { name: "Was Playing:", value: playingDisp }, { name: "Up Next:", value: nextDisp }]
				)], components: [empty]
		});
	}

	/**
	 * Closes the GUI and unbinds the interaction message
	 */
	destroyOldGUI() {
		if (this.activePlayer) {
			// console.log("hai, killing")
			this.updateScrn("stop");
			this.bindGUI = undefined;
			this.activePlayer = false;
		}
	}


	/**
	 * Player functions
	 */

	/**
	 * Play the 0th song in the queue
	 */
	play() {
		const resource = createAudioResource(`./musicStronghold/${this.songQueue.songboard[0].alias}`);
		this.player.play(resource);
		this.connection.subscribe(this.player);
		this.playing = true;
		this.updateScrn()
	}

	/**
	 * Pause if playing, play if paused
	 */
	pause() {
		// poor way to handling pauses, need to use discord audio status instead
		if (this.player == undefined) { // if player is dead
			return;
		}
		else if (this.playing) {
			this.player.pause();
			this.playing = false;
		}
		else {
			this.player.unpause();
			this.playing = true;
		}
	}

	/**
	 * Toggles loop one song
	 */
	setOneLoop() {
		if (this.loopOne) { this.loopOne = false; }
		else { this.loopOne = true; }

		if (!this.activePlayer) { // dont send to channel when player is active
			if (!this.loopOne) { // one loop is off
				this.recMsgDummy.channel.send({ embeds: [new EmbedParse(this.recMsgDummy, "Single song loop OFF", ":x: :repeat_one:", 52224)] });
			}
			else {
				this.recMsgDummy.channel.send({ embeds: [new EmbedParse(this.recMsgDummy, "Single song loop ON", ":repeat_one:", 52224)] });
			}
		}
		else if (this.activePlayer) {
			this.updateScrn();
		}
	}

	/**
	 * Shuffles the queue
	 */
	shuffle() {
		shuffle(this.songQueue.songboard);

		if (this.activePlayer) { // update gui after shuffling
			this.updateScrn();
		}
	}

	/**
	 * Add song to queue.
	 * Find song, if valid song, push to queue. If queue is empty, triger startPlayer() and start playing the song
	 * 
	 * @param {String} whatToDo "add" adds a song to back of queue. "add-force" will play this song now
	 * @param {String, Int} thing an alias (String), or an id (Int) of the song to add
	 */
	addQueue(whatToDo, thing) {
		// check if member is in a channel
		try {
			var yes = this.recMsgDummy.member.voice.channel.id;
		}
		catch {
			this.recMsgDummy.channel.send({ embeds: [new EmbedParse(this.recMsgDummy, "Error", "Command failure. Are you in a voice channel?", 52224)] });
			return;
		}

		alias = thing;

		if (alias === "") { // filter out blank entries
			alias = -1;
		}

		if (this.songQueue.songboard.length <= 0) { // ensure player is dead if queue empty
			try {
				this.destroyPlayer(true);
			}
			catch (error) { }
		}

		// start player, search for song
		this.startPlayer();
		let songToPlay = this.getSong();

		if (whatToDo == "add") {
			if (typeof songToPlay == "object") { // assume we have a valid song, else undefined object
				this.songQueue.songboard.push(songToPlay);
				this.recMsgDummy.channel.send({ embeds: [new EmbedParse(this.recMsgDummy, "Add To Queue", songToPlay.alias, 52224)] });
				this.updateScrn();
				return;
			}


			this.recMsgDummy.channel.send({ embeds: [new EmbedParse(this.recMsgDummy, "Add To Queue", songToPlay, 52224)] });
		}
		else if (whatToDo == "add-force") { // delete current playing song, play this song

			if (typeof songToPlay == "object") { // assume we have a valid song, else undefined object
				// insert currently playing to prev, play the provided song
				if (this.songQueue.songboard.slice(0, 1)[0] != undefined && !this.isEmpty()) { // dont use this when empty
					this.songQueue.prev.push(this.songQueue.songboard.slice(0, 1)[0]);
					this.songQueue.songboard.splice(0, 1, songToPlay); // insert song

					if (this.songQueue.prev.length > config.bot.musicPrevScope) { // delete record past this number
						this.songQueue.prev.splice(0, 1);
					}
				}

				if (this.isEmpty()) { // do this when empty
					this.songQueue.songboard.push(songToPlay);
				}


				this.play();
				this.recMsgDummy.channel.send({ embeds: [new EmbedParse(this.recMsgDummy, "Force Playing", this.songQueue.songboard[0].alias, 52224)] });
				this.updateScrn();
				return;
			}
			this.recMsgDummy.channel.send({ embeds: [new EmbedParse(this.recMsgDummy, "Add To Queue", songToPlay, 52224)] });
		}


		// adds all songs in library to queue
		else if (whatToDo == "add-all") {
			let allSongs = this.getAll();
			if (typeof allSongs == "object") {
				this.songQueue.songboard = this.songQueue.songboard.concat(allSongs);
				this.recMsgDummy.channel.send({ embeds: [new EmbedParse(this.recMsgDummy, "Queueing all", "Playing entire library", 52224)] });
				this.updateScrn();
				return;
			}

			this.recMsgDummy.channel.send({ embeds: [new EmbedParse(this.recMsgDummy, "Error", "Command failure", 52224)] });
		}
	}

	/**
	 * Plays next song in queue. Trigger destroyPlayer() when queue is empty
	 * @param {Boolean} isAutoplay true will assume this is called by the watchdog once a song has ended. This does nothing outside of oneloop = true.
	 */
	playerNext(isAutoplay = false) {
		/**
		 * Play next song
		 * Delete currenly playing song from queue, play the next in queue
		 */
		if (this.loopOne && isAutoplay == true) { // loop one song over again
			this.play();
			return;
		}


		// insert at front, del from back
		if (this.songQueue.songboard.slice(0, 1)[0] != undefined) {
			this.songQueue.prev.push(this.songQueue.songboard.slice(0, 1)[0]);
			this.songQueue.songboard.splice(0, 1); // store to previous

			if (this.songQueue.prev.length > config.bot.musicPrevScope) { // delete record past this number
				this.songQueue.prev.splice(0, 1);
			}
		}


		if (this.songQueue.songboard.length < 1) { // kill player, queue empty
			try {
				// console.log("killing player")
				this.destroyPlayer();
			}
			catch (error) { }
			return;
		}
		else { // play next
			// console.log("playing next")
			this.play();
			if (!this.activePlayer) {
				this.recMsgDummy.channel.send({ embeds: [new EmbedParse(this.recMsgDummy, "Now playing", this.songQueue.songboard[0].alias, 52224)] })
			}
		}

	}

	/**
	 * Play the previous song. This will not do anything is previous queue is empty
	 */
	previous() {
		if (this.songQueue.prev.length <= 0) {
			return;
		}
		this.songQueue.songboard.splice(0, 0, this.songQueue.prev.pop()) // move from previous to playing queue

		this.play();
		if (!this.activePlayer) {
			this.recMsgDummy.channel.send({ embeds: [new EmbedParse(this.recMsgDummy, "Now playing", this.songQueue.songboard[0].alias, 52224)] });
		}
	}

	/**
	 * Take action when the current song has ended (play the next song)
	 */
	loopWatchDog() {
		if (this.playing == true) {
			return;
		}
		try {
			if (this.songQueue.songboard.length > 0) {
				this.playing = true;
				this.play();
				if (!this.activePlayer) {
					this.recMsgDummy.channel.send({ embeds: [new EmbedParse(this.recMsgDummy, "Now playing", this.songQueue.songboard[0].alias, 52224)] });
				}

				// take action when current song stops playing
				this.player.on(AudioPlayerStatus.Idle, () => {
					this.playerNext(true);
				});
			}
			else {
				this.playing = false;
			}
		}
		catch (Error) {
			console.log("LOOP FAILURE")
			console.log(Error)
		}
	}


	/**
	 * Deletes song(s) from queue
	 * 
	 * FOR INDEXES:
	 * Head/tail index will snap to the index limits of the queue when given numbers too small/large
	 * Index 0 (current playing) will be ignored. The playerNext() method should be used in place
	 * 
	 * @param {String} songAlias batch delete range of indexes to delete in format "<head>-<tail>". Ex. 3-6 will delete index 3 to index 6 (inclusive) 
	 * @param {String} songAlias alias of song
	 * @param {Integer} songAlias id of song
	 * @returns status message
	 */
	delSong(songAlias) {
		if (this.isEmpty()) { return "incorrect command usage (queue is empty)" }

		let head = parseInt(songAlias.split("-")[0]);
		let tail = parseInt(songAlias.split("-")[1]);

		if (Number.isInteger(head) && Number.isInteger(tail)) {
			if (head > tail) {
				return "Incorrect command usage\n (head index is > tail index, both inegers)";
			}

			// conform head/tail to bounds of list
			if (tail >= this.songQueue.songboard.length) {
				tail = this.songQueue.songboard.length;
			}
			if (head <= 0) { // do not touch the now playing song
				head = 1;
				if (head > tail) {
					return "Range delete cannot delete 0th (or lower) head index. Thus head has been set to 1 (min value). Now head > tail, which is invalid.";
				}
			}

			// delete and display it 
			this.peek(head, tail).forEach(yes => dispStr += yes.alias + "\n");
			this.songQueue.songboard.splice(head, tail - head + 1);
			let dispStr = "";
			this.recMsgDummy.channel.send(dispStr);

			if (this.activePlayer) { this.updateScrn() }
			return "Range delete sucess";
		}


		alias = songAlias; // idk why I'm still using a class var
		if (alias === "") { // filter out blank entries
			alias = -1;
		}
		let songToPlay = this.getSong();

		// if is first index, treat it as a next song command
		if (songToPlay == this.songQueue.songboard[0].alias) {
			this.playerNext();
			// NO update screen here
			return "Deleted sucessfully";
		}


		// finder
		let index = -1;

		for (let i in this.songQueue.songboard) {
			if (this.songQueue.songboard[i].alias == songToPlay.alias || this.songQueue.songboard[i].id == songToPlay.id) {
				index = i;
			}
		}

		if (index >= 0) {
			// delete song from thing
			this.songQueue.songboard.splice(index, 1);
			if (this.activePlayer) { this.updateScrn() }
			return "Deleted sucessfullyyyyyy";
		}
		else {
			return "Song does not exist";
		}

	}



	/**
	 * Get and set data
	 */


	/**
	 * Retrieve the queue that is playing.
	 * scope is set in config.
	 */
	getPlayingQueue() {
		// exclude including the playing song (0th index).  1 and onwards is the next songs
		return this.peek(1, this.songQueue.songboard.length, this.songQueue.songboard);
	}

	/**
	 * Peek at a slice a range in the song queue.
	 * This is essentially the splice() array metod with a few extra things
	 * to add formatting for shortning queues.
	 * Indexes are inclusive.
	 * Scope (elements that follow head index is set in config)
	 * 
	 * @param {Integer} head starting index (>=0)
	 * @param {Integer} tail ending index 
	 * @param {Array} array a queue
	 * @returns array of songs {song{id, alias}, etc {}}
	 */
	peek(head, tail, array) {
		// sanitize input
		if (!Number.isInteger(head) || !Number.isInteger(tail) || head > tail) {
			throw new error("Invalid Input, head cannot be greater than tail, must be integers");
		}

		if (head < 0) {
			head = 0;
		}
		if (tail > head + config.bot.musicNextScope - 1) { // -1 because 0 indexing
			tail = head + config.bot.musicNextScope - 1;
		}

		let list = array.slice(head, tail + 1);

		// for display of how many elements is not displayed
		if (list.length >= config.bot.musicNextScope) {
			list.push({
				id: -1,
				alias: `+${array.length - config.bot.musicNextScope - 1} more... **${array.length - 1}.** ${array[array.length - 1].alias} (id=${array[array.length - 1].id})`  // +n more... (number of song in queue) last song alias (id of last song) 
			});
		}

		// cut off long names
		for (let i in list) {
			if (list[i].alias.length > MAX_DISP_CHARS) {
				list[i].alias = list[i].alias.substring(0, MAX_DISP_CHARS) + "...";
			}
		}

		return list;
	}


	/**
	 * Get the buttons for the player GUI
	 * 
	 * @param {int} whichOne 0 = paused buttons, 1 = destroyed player buttons, everything else returns default buttons
	 * @returns Buttons object(s)
	 */
	getButtons(whichOne) {
		if (whichOne == 0) {
			return pausedButtons;
		}
		else if (whichOne == 1) {
			return empty;
		}
		return rowOfButtons;
	}

	/**
	 * Get the previous songs queue
	 * 
	 * @returns array of songs
	 */
	getPrev() {
		// it is assumed we only keep a finite amount of previous songs... for now
		// let list = this.songQueue.prev.slice(0, config.bot.musicPrevScope +1);
		return this.peek(0, config.bot.musicPrevScope, this.songQueue.prev);
	}

	/**
	 * Get the display data for the player GUI
	 * 
	 * @returns array, [previous songs, next songs, current song]
	 */
	getData() {
		let prevq = "";
		let nextq = "";
		let cur = "";

		// next, previous, current song
		for (var i in this.getPlayingQueue(config.bot.musicNextScope)) {
			nextq += this.getPlayingQueue(config.bot.musicNextScope)[i].alias + "\n";
		}
		for (var i in this.getPrev(config.bot.musicPrevScope)) {
			prevq += this.getPrev(config.bot.musicPrevScope)[i].alias + "\n";
		}
		try {
			cur = this.getHead().alias;
		} catch { }

		// set default because Discord is scared of sending empty messages
		if (prevq == "" || prevq == undefined) { prevq = "⠀" }
		if (nextq == "" || nextq == undefined) { nextq = "⠀" }
		if (cur == "" || cur == undefined) { cur = "⠀" }

		return [prevq, nextq, cur];
	}

	/**
	 * Return the current playing song
	 * 
	 * @returns the 0th index song (current playing song)
	 */
	getHead() { return this.songQueue.songboard[0] } //return first song (currently playing)


	/**
	 * Returns the entire song queue
	 * 
	 * @returns 
	 */
	getAll() { return database.songboard }

	/**
	 * Find song in the song library.
	 * Search by both id and alias, return whichever returns a valid song.
	 * 
	 * @returns int, the index in library of the song
	 */
	getSong() {
		let indexOfPaste = idSearch(database.songboard, alias);
		let indexOfPaste2 = aliasSearch(database.songboard, alias);

		if (indexOfPaste == -1 && indexOfPaste2 == -1) {
			return "Song does not exist";
		}
		else if (indexOfPaste == -1) {
			return database.songboard[indexOfPaste2];
		}
		else {
			return database.songboard[indexOfPaste];
		}
	}

	/**
	 * Get music module version
	 * 
	 * @returns String, version
	 */
	getVersion() { return version }

	/**
	 * Returns whether queue is empty
	 * 
	 * @returns true if queue is empty
	 */
	isEmpty() {
		if (this.songQueue.songboard.length <= 0) { return true }
		else { return false }
	}

	/**
	 * list all avalible songs
	 * 
	 * @returns array, all songs in song library {id: x, alias: y}
	 */
	listSongLibrary() {
		let availableSongs = [];
		// availableSongs.push("Avalible Song")
		try {

			for (const i in database.songboard) { // list all the aliases
				availableSongs.push((`(${database.songboard[i].id}) ` + database.songboard[i].alias));
			}
			return availableSongs;
		}

		catch (error) {
			console.log(error);
			this.scanner(); // First-time setup
			return 0;
		}
	}


	/**
	 * Bind which message to update, for updateDisplay()
	 * 
	 * @param {Object} newBind interaction object (interaction.message). This is used to facilitate updating the player "GUI"
	 */
	setBind(newBind) {
		this.bindGUI = newBind;
	}

	/**
	 * Set flag for Player GUI is active
	 */
	usePlayer() {
		this.activePlayer = true;
	}

	/**
	 * Update the resMsg
	 * 
	 * @param {Object} newOne
	 */
	updateRecMsg(newOne) {
		this.recMsgDummy = newOne;
	}



	/**
	 * Downloads song from URL/upload
	 * URL will take priority over file uploads
	 * 
	 * @param {Object} where the message object for sending messages
	 * @param {String} providedName name of song or URL provided by user. if undefined, replace with file name
	 */
	async dlSong(where, providedName) {


		/**
		 * Download from URL
		 */
		if (providedName.startsWith("http")) {
			let binary; // binary with file extenstion, not to be confused with the constant

			let ls = fs.readdirSync(dlPath);
			for (const i in ls) {
				if (ls[i].includes(dlBinary)) {
					binary = `${ls[i]}`;
					break;
				}
			}

			// check if downloader exists, reject non whitelisted URLs
			if (!fs.existsSync(dlPath + binary)) {
				where.channel.send("Downloader is unavalible");
				return;
			}

			else if (!providedName.startsWith("https://www.youtube.com") && !providedName.startsWith("https://youtu.be") && !providedName.startsWith("https://music.youtube.com") && !providedName.startsWith(" https://m.youtube.com") && !providedName.startsWith("https://soundcloud.com")) {
				where.channel.send("For security reasons, non-YouTube/Soundcloud URLs are unsupported");
				return;
			}


			// only one download at a time
			if (!downloaderBusy) {
				downloaderBusy = true;

				downloader = exec(`"${binary}" -o "../${boardPath}/${dlFormatting}" ${dlArgs} ${providedName.split(" ")[0]}`, { cwd: dlPath }, (err, stdout, stderr) => {
					if (err) {
						console.error(err);

						// remove commandline 
						let sanitizedError = String(err).split(providedName)
						sanitizedError = sanitizedError[1];
						if (sanitizedError == undefined) {
							sanitizedError = "";
						}
						where.channel.send("Download failure\n`" + sanitizedError + "`");

						downloaderBusy = false;
						downloader = undefined;
						return;
					}
					where.channel.send("Finished")
					downloaderBusy = false;
					downloader = undefined;
				});


				dlWatchdog(where);
			}
			else {
				where.channel.send("DOWNLOADER IS BUSY");
			}

			return;
		}


		/**
		 * Download file uploaded
		 */
		let name; // name of file

		if (where.attachments.first()) {
			// if undefined, replace with file name
			if (providedName == undefined || providedName == "") {
				name = where.attachments.first().name
			}
			else {
				name = providedName;
			}


			// check if valid song
			// allow only audio and video
			if (where.attachments.first().contentType == undefined) {
				where.channel.send("This is not an valid file");
				return;
			}

			if (where.attachments.first().contentType.startsWith("audio") || where.attachments.first().contentType.startsWith("video")) {
				if (!fs.existsSync(`${boardPath}/${name}`)) {
					https.get(where.attachments.first().url, response => {
						response.pipe(fs.createWriteStream(`./musicStronghold/${name}`));
						this.scanner(); // rescan
					})

					where.channel.send("Sucessfully added to library")
				}
				else {
					where.channel.send("Error, song exists already");
				}
				return;
			}
			where.channel.send("This is not an Valid file");
			return;
		}
		where.channel.send("Please provide a file or URL");
	}


	/**
	 * Terminate the downloader.
	 * WARNING: On Windows hosts The song will not be added to the music library, HOWEVER, the downloader will not stop until downloading finishes
	 * 
	 * @param {Object} where the message object for sending messages
	 */
	forceKillDL(where) {
		try {
			downloader.kill("SIGINT");

			where.channel.send({ embeds: [new EmbedParse(where, "Maintenance", "Forcefully terminated downloader", 52224)] });
			if (os.type == "win32") { // fuck you Windows
				where.channel.send(":bangbang: WARNING: Detected Windows host. The song will not be added to the music library, HOWEVER, the downloader will not stop until downloading finishes. Blame Windows.")
			}

		}
		catch (e) {
			where.channel.send({ embeds: [new EmbedParse(where, "Maintenance", "Error forcefully terminating downloader", 52224)] });
			console.log("Error forcefully terminating downloader\n" + e);
		}
	}

}


module.exports = MusicPlayer;