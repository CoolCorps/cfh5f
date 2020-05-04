# Reflections

Both the dex project and the flask project worked, but I choose to go with the login in with Google SSO. There were no problems running it on Linux, but I did have some problems on Windows. I could not get the environment variables to work. I have them hard coded into the python program for now, but it is something I plan to fix.

While trying to understand SSO better and get my app working, I watched various YouTube videos. I also read the following websites:

- https://en.wikipedia.org/wiki/Single_sign-on
- https://realpython.com/flask-google-login/#creating-your-own-web-application

I described the details of what I want my app to do in GOALS.md, but the the overall functionality with SSO I want completed by the end of the semester is the following. A user can login using a Google account. They can view their profile and change their username and other data. While logged in, they can join a multiplayer game and their name and profile picture will be used in game.