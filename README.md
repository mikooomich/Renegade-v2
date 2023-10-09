<h1 align="center">Renegade Yeet</h1>
<p align="center">
 <strong>*This project is no longer actively developed*</strong></div>
</p>

## Requirements

Node.js and the following modules
```
discord.js
node-os-utils
physical-cpu-count
@discordjs/voice
libsodium-wrappers
```

### Other Requirements
- Please note if you experience audio disappearing after ~60 seconds, you may need to manually install a newer @discordjs/voice version
- FFMPEG is also required. Install to system path, or take a look at [ffmpeg-static](https://www.npmjs.com/package/ffmpeg-static)


## Usage
It is necessary to configure Renegade.json
```
cd <directory>
node ./yeet.js
```

## Features

- Pasteboard
- Simple Local File Music Player (beta, not tested with multiple servers)
    - "GUI" player and CLI variants
    - Downloader (more info below)

![GUI Player](https://github.com/mikooomich/Renegade-Yeet/blob/dev/images/gui.png)

![CLI Player](https://github.com/mikooomich/Renegade-Yeet/blob/dev/images/cli.png)
      <br>

- Chat logging
- ~~Economy~~ returns at a later date
- Reminders
- Miscellaneous Commands
- Tested with NodeJS 18.17.1 LTS, discord.js v14.13.0, discord.js/voice v0.16.0


## Music Downloader/Uploader
Users can upload songs to the song library via a file upload or an url. As this involves downloading directly to disk, there are the following limitations, mostly for security reasons:
- Uploaded files must be recognized by Discord as a video or audio format
- URLs are limited to YouTube and Soundcloud

### URL Downloads (Very Experimental)
The URL downloader is tested to work with [yt-dlp](https://github.com/yt-dlp/yt-dlp), and downloads automatically to the music library, supplying the -o argument may result in unexpected behaviour. The downloader binary must be supplied, the default location is `./libs/`. The default binary file the bot will look for (file extension independent) is `youtube-dl`. This, along with any additional yt-dlp arguments is configurable in `Renegade.json`.
- Note: This is a very experemewntal feature and is likly extremely jank and may suddenly disappear.