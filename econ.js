function balReset(usriD) {
	`this function is used to reset balence so i dont have to spam this everywhere in econ`
	fs.writeFileSync(`./moneys/${usriD}.txt`, `ur_money= 0`)
	recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `Account created, use **${prefix}bal** reset to reset your balence.`, 2727567))
	logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) Created account`)
}





// moneyyyyyy
client.on('message', async recMsg => {

	if (recMsg.author == client.user) {
		return
	}

	if (antiSpamEcon.has(recMsg.author.id)) { // also 1 sec rate limit
	}

	else {

		if (recMsg.content.toLowerCase() == prefix + 'reset bal') {

			fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= 0`)
			recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, 'Balence reset.', 14685520))
			logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) Executed "reset bal" (bal was reset)`)
		}

		if (recMsg.content.toLowerCase().startsWith(prefix + 'bal') || recMsg.content.toLowerCase().startsWith(prefix + 'balance') || recMsg.content.toLowerCase().startsWith(prefix + 'money')) {
			logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) Executed "bal"`)

			var getUseriD = (recMsg.content.split(' ').slice(1)).toString();
			var useriD = getUseriD.replace('@', '').replace("<", '').replace("!", '').replace(">", '')

			if (useriD == undefined, useriD == '') {
				useriD = recMsg.author.id
			}
			// console.log(getUseriD)
			// console.log(useriD)

			var guild = recMsg.guild // is user in the server?

			if (guild.member(useriD)) { // skid is here

				fs.stat(`./moneys/${useriD}.txt`, function (err) {
					if (err) {
						fs.writeFileSync(`./moneys/${useriD}.txt`, `ur_money= 0`)
						recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `Account created, use **${prefix}bal reset** to reset your balence.`, 2727567))
						logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) Created account`)
						// balReset(useriD)

					} else {
						var lineReader = require('readline').createInterface({
							input: require('fs').createReadStream(`./moneys/${useriD}.txt`)
						});
						lineReader.on('line', function (line) {
							recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `Balance for <@!${useriD}>: $${line.split(' ').slice(1)}`, 2727567))
						})
					}
				})
				logme('DEBUG', `bal sucessful`)
			}

			else {
				recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `Member not found.`, 2727567))
				logme('ERROR', `Rquested member not found`)
			}
		}


		if (recMsg.content.toLowerCase().startsWith(prefix + 'backdoor')) { // we dont talk about this...
			logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) Executed "backdoor"...`)

			var backdoorMoney = parseFloat(0 + recMsg.content.split(' ').slice(1));
			recMsg.channel.send(backdoorMoney)

			if (backdoorMoney > 0) {
				fs.stat(`./moneys/${recMsg.author.id}.txt`, function (err) {
					if (err) {
						fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= 0`)
						logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) created account`)
						recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `Account created, use **${prefix}bal** reset to reset your balence.`, 14685520))
						// balReset(recMsg.author.id)

						logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) created account`)
					} else {
						var lineReader = require('readline').createInterface({
							input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
						});

						lineReader.on('line', function (line) {
							fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= ${backdoorMoney}`)

							recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, 'Yes.', 14685520))
						})

						logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) transaction success (${backdoorMoney})`)
					}

				});
			}
			else {
				recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, 'No.', 14685520))
				logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) transaction not success (${backdoorMoney})`)
			}
		}


		if (recMsg.content.toLowerCase() == prefix + 'daily') {
			logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) exectued "daily"`)

			if (sloTFdownDaily.has(recMsg.author.id)) {
				recMsg.channel.send(`Boiiii too fast for me! You can only do this again in ${timeParse(dailyTimeRemaining.getTimeLeft())}.`);
				console.log(dailyTimeRemaining.getTimeLeft())
				logme('DEBUG', `daily not paid (retelimited)`)
			}
			else {

				fs.stat(`./moneys/${recMsg.author.id}.txt`, function (err) {
					if (err) {
						fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= 0`)
						recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `Account created, use **${prefix}bal reset** to reset your balence.`, 14685520))

						logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) created account`)
						// balReset(recMsg.author.id)
					}

					else {
						var lineReader = require('readline').createInterface({
							input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
						});

						lineReader.on('line', function (line) {
							fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= ${parseFloat(line.split(' ').slice(1)) + 500}`)
							recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, "Here's $500", 14685520))
						})
					}
				})
				logme('DEBUG', `paid daily`)


				sloTFdownDaily.add(recMsg.author.id);
				// setTimeout(() => {
				// sloTFdownDaily.delete(recMsg.author.id);
				// }, 82800000); // 23 hrs
				dailyTimeRemaining = new timer(function () {
					sloTFdownDaily.delete(recMsg.author.id);
					// What ever
				}, 82800000)
			}
		}


		if (recMsg.content.toLowerCase().startsWith(prefix + 'gamble')) {
			logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) executed "gamble"`)

			var yesOrNo = Math.floor(Math.random() * Math.floor(101)) //random number...
			var moneyMultiplier = Math.floor(Math.random() * Math.floor(5))
			var moneyBet = Math.floor(parseFloat(0 + recMsg.content.split(' ').slice(1)));
			var moneyWon = Math.round(moneyBet * moneyMultiplier / 3.3827463287482) + moneyBet

			// console.log(moneyBet)
			// console.log('--------')
			// console.log(yesOrNo)

			if (moneyBet > 9) {

				fs.stat(`./moneys/${recMsg.author.id}.txt`, function (err) {
					if (err) {
						fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= 0`)
						recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `Account created, use **${prefix}bal reset** to reset your balence.`, 14685520))
						logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) created account`)
						// balReset(recMsg.author.id)
					}

					else {
						var lineReader = require('readline').createInterface({
							input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
						});

						lineReader.on('line', function (line) {
							if (parseFloat(line.split(' ').slice(1)) >= moneyBet) {

								if (yesOrNo > 60) {
									var lineReader = require('readline').createInterface({
										input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
									});
									lineReader.on('line', function (line) {
										fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= ${Math.round(parseFloat(line.split(' ').slice(1)) + moneyWon)}`)
										recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `You somehow won and got ${moneyWon}`, 3591188))
										logme('DEBUG', `Won gamble (${moneyWon})`)
									})
								}

								else if (yesOrNo == 50) {
									fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= 0`)
									recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, 'lol rip ur luck is very bad and u lost literally all ur money', 14685520))
									logme('DEBUG', `lost all money`)
								}

								else {
									var lineReader = require('readline').createInterface({
										input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
									});

									lineReader.on('line', function (line) {
										fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= ${Math.round(parseFloat(line.split(' ').slice(1)) - moneyBet)}`)
										recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, "lol rip u lost", 14685520))
										logme('DEBUG', `lost gamble (${moneyBet})`)
									})
								}
							}
							else {
								recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, 'You dont have enough money', 2727567))
								logme('DEBUG', `user has not enough money`)
							}
						})
					}
				})
			}
			else {
				recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, 'You must bet at least $10.', 14685520))
				logme('DEBUG', `user bet less than $10 (${moneyBet})`)
			}
		}


		if (recMsg.content.toLowerCase() == prefix + 'stalk') {
			logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) executed "stalk"`)

			var addOrTake = Math.floor(Math.random() * Math.floor(34))
			var addOrTakeBonus = Math.floor(Math.random() * Math.floor(287))
			var moneyMultiplier = Math.floor(Math.random() * Math.floor(9))
			var OtherMoneyMultiplier = Math.floor(Math.random() * Math.floor(25))
			var nerfBonus = 1

			if (addOrTakeBonus > 251) { // decide if take away bonus
				nerfBonus = -1
			}
			var moneyBet = 695
			var moneyWon = Math.round(moneyBet * moneyMultiplier / 3.3827463287482) + Math.round(moneyBet * OtherMoneyMultiplier / 83.9203485763457834) * nerfBonus

			// console.log(addOrTake)
			// console.log(moneyBet)
			// console.log(yesOrNo)

			if (sloTFdownStalk.has(recMsg.author.id)) {
				recMsg.channel.send(`You can stalk again in ${timeParse(stalkTimeRemaining.getTimeLeft())}.`);
				logme('DEBUG', `stalk ratelimited (${timeParse(stalkTimeRemaining.getTimeLeft())})`)
			}
			else {
				fs.stat(`./moneys/${recMsg.author.id}.txt`, function (err) {
					if (err) {
						fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= 0`)
						recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `Account created, use **${prefix}bal** reset to reset your balence.`, 14685520))
						logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) created account`)
						// balReset(recMsg.author.id)
					}

					else {
						var lineReader = require('readline').createInterface({
							input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
						});

						lineReader.on('line', function (line) {
							// pull messages from json
							logme('DEBUG', `pulling message from json)`)
							dabMessage = config.bot.stalkMsg[Math.floor(Math.random() * Math.floor(config.bot.stalkMsg.length))]
							// console.log(dabMessage)
							dabMessageNegative = config.bot.stalkMsgNeg[Math.floor(Math.random() * Math.floor(config.bot.stalkMsgNeg.length))]
							logme('DEBUG', `pull success)`)

							if (addOrTake > 19) {

								if (moneyWon < 0) {
									moneyWon = moneyWon * -1
								}
								var lineReader = require('readline').createInterface({
									input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
								});

								lineReader.on('line', function (line) {
									fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= ${Math.round(parseFloat(line.split(' ').slice(1)) + moneyWon)}`)
									recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `${dabMessage.replace('{pholder}', moneyWon)}`, 3591188))
									logme('DEBUG', `sucessful stalk (${moneyWon})`)
								})
							}

							else {

								if (moneyWon < 0) {
									moneyWon = moneyWon * -1
								}

								moneyWon = (Math.round(moneyWon * 1.3432473246))

								var lineReader = require('readline').createInterface({
									input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
								});
								lineReader.on('line', function (line) {
									fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= ${Math.round(parseFloat(line.split(' ').slice(1)) + (moneyWon * -1))}`)
									recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `${dabMessageNegative.replace('{pholder}', moneyWon)}`, 15278883))
									logme('DEBUG', `failed stalk (${moneyWon})`)
								})
							}
						})
						sloTFdownStalk.add(recMsg.author.id);
						stalkTimeRemaining = new timer(function () {
							sloTFdownDaily.delete(recMsg.author.id);
							// What ever
						}, 25200000)
					}
				})
			}
		}


		if (recMsg.content.toLowerCase() == prefix + 'dab') {
			logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) executed "dab"`)

			// var yesOrNo = Math.floor(Math.random() * Math.floor(101)) //random number...
			var addOrTake = Math.floor(Math.random() * Math.floor(3))
			var addOrTakeBonus = Math.floor(Math.random() * Math.floor(3))
			var moneyMultiplier = Math.floor(Math.random() * Math.floor(5))
			var OtherMoneyMultiplier = Math.floor(Math.random() * Math.floor(20))
			var nerfBonus = 1

			if (addOrTakeBonus == 0) { // decide if take away bonus
				nerfBonus = -1
			}
			var moneyBet = 69//Math.floor(parseFloat(0 + recMsg.content.split(' ').slice(1)));
			var moneyWon = Math.round(moneyBet * moneyMultiplier / 3.3827463287482) + Math.round(moneyBet * OtherMoneyMultiplier / 8.9203485763457834) * nerfBonus

			// console.log(addOrTake)
			// console.log(moneyBet)
			// console.log(yesOrNo)

			if (sloTFdownDab.has(recMsg.author.id)) {
				recMsg.channel.send(`You can dab again in ${timeParse(dabTimeRemaining.getTimeLeft())}.`);
			}
			else {

				fs.stat(`./moneys/${recMsg.author.id}.txt`, function (err) {
					if (err) {
						fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= 0`)
						recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `Account created, use **${prefix}bal** reset to reset your balence.`, 14685520))
						logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) created account`)
						// balReset(recMsg.author.id)
					}

					else {
						var lineReader = require('readline').createInterface({
							input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
						});

						lineReader.on('line', function (line) {
							// pull messages from json
							logme('DEBUG', `pulling message from json)`)
							dabMessage = config.bot.dabMsg[Math.floor(Math.random() * Math.floor(config.bot.dabMsg.length))]
							// console.log(dabMessage)
							dabMessageNegative = config.bot.dabMsgNeg[Math.floor(Math.random() * Math.floor(config.bot.dabMsgNeg.length))]
							logme('DEBUG', `oull success`)

							if (addOrTake > 0) {

								if (moneyWon < 0) {
									moneyWon = moneyWon * -1
								}
								var lineReader = require('readline').createInterface({
									input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
								});

								lineReader.on('line', function (line) {
									fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= ${Math.round(parseFloat(line.split(' ').slice(1)) + moneyWon)}`)
									recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `${dabMessage.replace('{pholder}', moneyWon)}`, 3591188))
									logme('DEBUG', `dab success (${moneyWon})`)
								})
							}

							else {

								if (moneyWon < 0) {
									moneyWon = moneyWon * -1
								}

								moneyWon = (Math.round(moneyWon * 1.3432473246))

								var lineReader = require('readline').createInterface({
									input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
								});

								lineReader.on('line', function (line) {
									fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= ${Math.round(parseFloat(line.split(' ').slice(1)) + (moneyWon * -1))}`)
									recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `${dabMessageNegative.replace('{pholder}', moneyWon)}`, 15278883))
									logme('DEBUG', `dab failed (${moneyWon})`)
								})
							}
						})
						sloTFdownDab.add(recMsg.author.id);
						dabTimeRemaining = new timer(function () {
							sloTFdownDaily.delete(recMsg.author.id);
							// What ever
						}, 14400000)
					}
				})
			}
		}

		if (recMsg.content.toLowerCase().startsWith(prefix + 'pay')) {
			logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) Executed "pay"`)

			var suffix = recMsg.content.split(' ').slice(1);
			var getUseriD = suffix[0]; //(recMsg.content.split(' ').slice(1)).toString(); 
			var getDefinedAmount = parseFloat(recMsg.content.split(' ').slice(2).join(' '))
			var useriD = getUseriD.replace('@', '').replace("<", '').replace("!", '').replace(">", '')

			if (useriD == undefined, useriD == '') {
				recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `You need to mention someone`, 2727567))
				logme('ERROR', `No member mentioned`)
			}
			// console.log(getUseriD)
			// console.log(useriD)
			// console.log(getDefinedAmount)

			var guild = recMsg.guild // is user in the server?

			if (guild.member(useriD)) { //skid is here

				fs.stat(`./moneys/${useriD}.txt`, function (err) {
					if (err) {
						fs.writeFileSync(`./moneys/${useriD}.txt`, `ur_money= 0`)
						recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `Account created, use **${prefix}bal** reset to reset your balence.`, 2727567))
						logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) Created account`)
						// balReset(useriD)

					}
					else {
						var lineReader = require('readline').createInterface({
							input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
						});
						lineReader.on('line', function (line) {
							if (parseFloat(line.split(' ').slice(1)) >= getDefinedAmount) {
								var lineReader = require('readline').createInterface({
									input: require('fs').createReadStream(`./moneys/${useriD}.txt`)
								});
								lineReader.on('line', function (line) {

									fs.writeFileSync(`./moneys/${useriD}.txt`, `ur_money= ${Math.round(parseFloat(line.split(' ').slice(1)) + getDefinedAmount)}`)

									var lineReader = require('readline').createInterface({
										input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
									});

									lineReader.on('line', function (line) {
										fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= ${Math.round(parseFloat(line.split(' ').slice(1)) + (-1 * getDefinedAmount))}`)
									})

									recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `Transaction sucessful: <@!${useriD}> recieved $${getDefinedAmount}`, 2727567))
								})

								logme('DEBUG', `pay sucessful`)
							}

							else {
								recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, 'You dont have enough money', 2727567))
								logme('DEBUG', `user has not enough money`)
							}
						})
					}
				})
			}

			else {
				recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true }), undefined, `Member not found.`, 2727567))
				logme('ERROR', `Reuested member not found`)
			}
		}


		//   if (recMsg.content.toLowerCase().startsWith(prefix + 'blackjack') || recMsg.content.toLowerCase().startsWith(prefix + 'bj')) {
		//     // logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) executed "gamble"`)

		//     // var yesOrNo = Math.floor(Math.random() * Math.floor(101)) //random number...
		//     // var moneyMultiplier = Math.floor(Math.random() * Math.floor(5))
		//     var moneyBet = Math.floor(parseFloat(0 + recMsg.content.split(' ').slice(1)));
		//     // var moneyWon = Math.round(moneyBet * moneyMultiplier / 3.3827463287482) + moneyBet
		//     var currentNumber = 0
		//     var botCurrentNumber = 0

		//     var addingAcard = random generator stuff
		//     var addingBotCard = random generator stuff


		//     currentNumber = currentNumber + addingAcard
		//     botCurrentNumber = botCurrentNumber + addingBotCard



		//     // console.log(moneyBet)
		//     // console.log('--------')
		//     // console.log(yesOrNo)
		//     while (currentNumber <=21 && botCurrentNumber <=21) {

		//     recMsg.channel.send('stand or smash')
		//             recMsg.channel.awaitMessages(m => m.author.id == recMsg.author.id, {max: 1, time: 30000}).then(collected => {
		//                       // only accept messages by the user who sent the command
		//                       // accept only 1 message, and return the promise after 30000ms = 30s

		//                       // first (and, in this case, only) message of the collection
		//               if (collected.first().content.toLowerCase() == 'stand') {
		//               //weeee
		//               //bot decide if yeet.
		//               botCurrentNumber = botCurrentNumber + addingBotCard
		//               }
		//               else if (collected.first().content.toLowerCase() == 'smash') {
		//                 currentNumber = currentNumber + addingAcard

		//                 //bot decide if yeet.
		//                 botCurrentNumber = botCurrentNumber + addingBotCard
		// //AHHHHHHHHHHHHHHHHHHH
		//               }




		//               else {
		//                 // recMsg.reply('Not a valid setting to edit.');   
		//               }   
		//             }).catch(() => {
		//               recMsg.reply('No answer after 30 seconds, game ended.');
		//             });
		//           }

		//           recMsg.send('the winer is blank')















		//     // if (moneyBet > 9) {

		//     //   fs.stat(`./moneys/${recMsg.author.id}.txt`, function(err) {  
		//     //     if (err) {
		//     //       fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= 0`)
		//     //       recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true}), undefined, `Account created, use **${prefix}bal reset** to reset your balence.`, 14685520))
		//     //       logme('DEBUG', `${recMsg.author.id} (${recMsg.member.user.username}) created account`)
		//     //       // balReset(recMsg.author.id)
		//     //     } 

		//     //     else { 
		//     //       var lineReader = require('readline').createInterface({
		//     //         input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
		//     //       });

		//     //       lineReader.on('line', function (line) {
		//     //         if (parseFloat(line.split(' ').slice(1)) >= moneyBet) {

		//     //           if (yesOrNo > 60) {
		//     //             var lineReader = require('readline').createInterface({
		//     //               input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
		//     //             });
		//     //             lineReader.on('line', function (line) {
		//     //               fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= ${Math.round(parseFloat(line.split(' ').slice(1)) + moneyWon)}`)
		//     //               recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true}), undefined, `You somehow won and got ${moneyWon}`, 3591188))
		//     //               logme('DEBUG', `Won gamble (${moneyWon})`)
		//     //             })
		//     //           }

		//     //           else if (yesOrNo == 50) {
		//     //             fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= 0`)
		//     //             recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true}), undefined, 'lol rip ur luck is very bad and u lost literally all ur money', 14685520))
		//     //             logme('DEBUG', `lost all money`)
		//     //           }

		//     //           else {
		//     //             var lineReader = require('readline').createInterface({
		//     //               input: require('fs').createReadStream(`./moneys/${recMsg.author.id}.txt`)
		//     //             });

		//     //             lineReader.on('line', function (line) {
		//     //               fs.writeFileSync(`./moneys/${recMsg.author.id}.txt`, `ur_money= ${Math.round(parseFloat(line.split(' ').slice(1)) - moneyBet)}`)
		//     //               recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true}), undefined, "lol rip u lost", 14685520))
		//     //               logme('DEBUG', `lost gamble (${moneyBet})`)
		//     //             })
		//     //           } 
		//     //         }
		//     //         else {
		//     //           recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true}), undefined,'You dont have enough money', 2727567))
		//     //           logme('DEBUG', `user has not enough money`)
		//     //         }
		//     //       })
		//     //     }
		//     //   })
		//     // }
		//     // else {
		//     //   recMsg.channel.send(richEmbed('desc', recMsg.member.user.username, recMsg.member.user.avatarURL({ format: 'png', dynamic: true}), undefined,'You must bet at least $10.', 14685520))
		//     //   logme('DEBUG', `user bet less than $10 (${moneyBet})`)
		//     // }
		//   }


		antiSpamEcon.add(recMsg.author.id);
		setTimeout(() => {
			antiSpamEcon.delete(recMsg.author.id);
		}, 1000); //1sec
	}
})
