# Setup Instructions

This project uses Flask and Google Login.

To setup, download and cd into my-google. Create a virtual environment for the project, then install the dependencies with the following command:

```sh
pip install -r requirements.txt
```

GOOGLE_CLIENT_ID and GOOGLE_SECRET_ID are hard coded because I could not get environment variables to work.

Then start the Flask web server with the following command:

```sh
python app.py
```

The Flask server will start on localhost port 5000. Go to the following https (not http) url to access the web page:

```
https://127.0.0.1:5000
```

On the webpage, you can login using your Google account.