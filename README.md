[![DeepScan grade](https://deepscan.io/api/teams/8152/projects/10306/branches/140836/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=8152&pid=10306&bid=140836)
# remote-music [WIP]
This app is used to play your music from different streaming services (only Spotify is supported for now) and to remotely control music playback from different streaming services within the same app.

<img src="https://github.com/Malien/remote-music/blob/master/doc/img/Screen%20Shot%202019-10-12%20at%2010.53.08%20AM.png" height="400px"> <img src="https://github.com/Malien/remote-music/blob/master/doc/img/Screen%20Shot%202019-10-12%20at%2010.53.22%20AM.png" height="400px">

The system is distributed, so to establish connection between user client and player an intermidiate server is used. 
If player is not firewalled, or you can directly connect to it, there is option to host server on a player machine. Otherwise the same app in headless mode can be launched.

<img src="https://github.com/Malien/remote-music/blob/master/doc/img/Screen%20Shot%202019-10-12%20at%2010.55.52%20AM.png" height="300px"> <img src="https://github.com/Malien/remote-music/blob/master/doc/img/Screen%20Shot%202019-10-12%20at%2011.13.59%20AM.png" height="300px">

The app is cross platform and build on top of web technologies (JS and electron), though UI is Mac-like for now.

## Build
If for some reason you want to build this project yourself, here you go:
- Install node v12.xx and npm 
- Clone repo with `git clone https://github.com/Malien/remote-music.git`
- Run `npm install` inside the repo
- `npm run build` should build the sources into the dist folder. NOTE: scripts are written for bash, so it won't run inside Windows CMD
- `npm start` will launch it NOTE: if you want to quickly rebuild app and launch it, use `npm run go`
- Pray that it won't crash

## Note
The infrastructure is not really secure so I won't distribute this app at all
