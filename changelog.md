## Changelog

issues:
- (?) random unknown interaction 
	- DiscordAPIError[10062]: Unknown interaction


## Modern js branch
Music player
- Make note of @discordjs/voice version
- Fix empty queue causing crash
- Fuzzy-ish song alias search (also for pasteboard)
- Downloader is labeled as very experimental

Boring techncial stuff
- use filter insteaf of explicit linear search
- use if else shorhand to make stuff more readable
- Remove unessesary global bars in modules
- Misc documentation and code optimizations


### 1.4-dev
Changes up to and including [Republish](https://github.com/mikooomich/Renegade-v2/commit/a3c98c5f3feb7e6c56abab0c4c0d44091a3ad9b5)
fix bot log formatting (i think)
fix whatever discord.js appears to broke up to version up to ~~13.8.1~~ 14.3.0
misc/spelling
pasteboard (back end ok, front end wip)
- display id, delete by id, paste by id
- fix character limit issue
	- lock per some server pasteboard to members with ban members permission
Simple music player
	- "GUI" player
	- Add songs to library via file upload or yt-dlf
Console commands (exit)

refractors
- Embed parse gets own module
	- Refactor rich embed parse (and fixed it because apparently every new discordjs update means embeds break again)
- Botlogging and chat logging now share same module
- remind command

fix crash an certain systemes where cpu model cound not be resolved
fix broken presense message
fix remind command crash when providing too large intervals, no time units
fix chatlogs being affected by rate-limit
Move help text to resources
Chat logging now logs embeds and attachments

misc changes

# Beta versions only
- fix crash when member is not in a voice channel calls play command
- condense some music commands, pasteboard commands
- use == over startswith for pause command, fixes play command not working 
- misc changes
- add deletion to music player queue, remove broken pop command
- hide path from music player
- use new function for "peeking" at queue to slice queue for get playing and get prev
- delete songs from queue




**Misc changes/fixes**
Code cleanup/commenting
Fix cpu physical core count display


1.3.1 (old 1.4)
fix whatever discord.js v13 broke
    the bot working at all
    embeds



### 1.3 Back From The Dead REEEEEEE!!!

Highlights
- Pasteboard
- Disable alot of stuff (see deprecated)
- Basic chat logging
- Remind Command
- Fix whatever discord.js v12 broke (see below)


Other misc stuff no one cares about

- Fix whatever discord.js v12 broke
    - boot display
    - ping api latency
    - user cmd
    - "requested by" in rich embeds
    - presence message

- Fix typo(s)... again
- Update help text
- Add chatlogs to chatlogs folder
- Revamp info cmd entirely
    - C/T may or may not display wrong number of logical cores, I obviously can't test on 4C/4T processor
- User cmd shows all user roles
- Rekame readme
- Other misc changes


**Depricated**
- info-ext command
- jank settings editor
- moosic
- spam command
- whole economy *for now...* 

**Known issues**
- sketchy rich embed parser
	- user cmd (pinging) shows wrong requested by


### 1.2: SKETCHY MOOSIC

- Added music and hopefully it doesnt break
- bot invite link cmd
- time left in timer is now shown

- tweaked help display and ping cmd
- nerf spam rate limit to 12 hrs
- patched up rich embed to be auto-parse based on sketchy logic
- fix spam can cause bot crash 
- a much needed code cleanup


### 1.1
- "testing channel"
- fix gamble cmd
- tweaked embed colours
- pay cmd
- more messages for stalk/dab
- user info cmd


**Technical BS:**
- (somewhat) fixed the mess of logging
- (somewhat) poorly doccumented functions
- updated boot screen
- json version check

### 1.0.1
- check bal of other people
- info cmd: add bot memory usg
- un-breaked spam
- automaticly create account if not created already
- (hopefully) richembedded everything that was supposed to be

- fix money being addded wrong
- fix info cmd uptime
- fix typo in help cmd
- fix spelling in readme (oops)
- remove useless stuff from graveyard

### 1.0.0
 - ratelimit taking of inputs, ratelimit spam
 - fixed dab and daily conflicting
 - add stalk
 - heavy deprecation and code cleanup
 - kill-the-bot command
 - restructure info cmd
 - changed rich embed function again...
 - Remove meth 




### Old Builds
- b1: initial release
- b2: idk tbh
- b3: Implement kicking
- b4: Banning and kicking
- b6: Disabled moderation, removed attempt at music, fixed spamming, les optimize
- b7b1: math commands, add,sin,pyth
- b8: add shop info, tweak help text, impliment some economy, basic startup logging les optimization 
- b9: Streamlined spam cmd, fix pyth (need to fix sin tho), logging per command (ish), expand eco (daily)
- b10 b1: Add days display to the uptime, (painfully) fixed daily cmd
- b10 b2: gettin dirty with rich embeds, gambling
- b11: add dab and do other misc econ tweaks, fix not displaying proper pfp in embed