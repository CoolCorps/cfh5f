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

The client attempts to connect to a server on localhost:8080 by default. If it cannot connect, it starts in single player mode.

To change the server Ip search for "serverIp" in /frontend-website/game/index.js

The client uses Google Sign-In SSO. The client id is hard coded in /frontend-website/login/index.html and /frontend-website/index.html

## Server

The server is a node.js server with socket.io. To run it, run the following commands:

```sh
npm install socket.io
npm install google-auth-library
```

```sh
node server.js
```

The server uses Google Sign-In SSO to authenticate clients. The client id is hard coded in /node-sersver/server.js.

The server runs on port 8080 by default.