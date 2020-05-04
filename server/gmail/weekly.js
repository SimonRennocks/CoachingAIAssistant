const nodemailer = require("nodemailer");
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), main);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

function makeBody(from, type) {
    let subject = "";
    let message = "";
    let to = "";
    let cc = ""//"centraltutorsupport@bootcampspot.com"
    let bcc = "";
    if (type === "Weekly") {
        subject = "Coding Boot Camp - Tutorial available"
        message = fs.readFileSync("weekly.html")
        to = from;
        bcc = fs.readFileSync("weeklyBcc.txt")
    }

    bcc = bcc.toString().replace( new RegExp('\r?\n','g'), ",");
    cc = cc.toString().replace( new RegExp('\r?\n','g'), ",");
    var str = ["MIME-Version: 1.0\n",
        "Content-Type: text/html; charset=utf-8\n",
        "reply to: ", from, "\n",
        "to: ", to, "\n",
        "cc: ", cc, "\n",
        "bcc: ", bcc, "\n",
        "from: ", from, "\n",
        "subject: ", subject, "\n\n",
        message
    ].join('');

    var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    console.log(encodedMail)
    return encodedMail;
}

function main(auth) {

    var raw = makeBody('rennocks@gmail.com', 'Weekly');
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.messages.send({
        userId: 'me',
        resource: {
            raw: raw
        }
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        console.log(res);
    });
}