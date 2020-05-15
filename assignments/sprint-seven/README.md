# Sprint 6 SSO Project

This is a continuation of this project:
https://github.com/CallumFerguson/CS4610FinalSpring2020

# WebGL Multiplayer Game

Mizzou CS4610 and CS4320 final project built with custom WebGL engine with Cannon.js physics.

![Screen Shot](screen_shot.png "Screen Shot")

Demo: https://youtu.be/qxom37T8zKA

(Demo video and screenshot are from an older version)

# Instructions

## Client

The client is regular javascript and requires no special setup to run. Simply host the files inside the frontend-website folder as a webserver and connect to it.

You must change the ip or change the game mode to multiplayer local or single player.

Search for "mode" in /frontend-website/game/index.js and change it to the desired mode. The ip should be below the mode line.

The client uses Google Sign-In SSO. The client id is hard coded in /frontend-website/login/index.html.

## Server

The server is a node.js server with socket.io. To run it, run the following commands:

```sh
npm install socket.io
```

```sh
node server.js
```

Remember to change the ip and game mode of the client so it can connect to the server.