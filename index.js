if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

var express = require('express')
const app = express();
const port = process.env.PORT || 3000

const axios = require('axios');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.post("/", async (req, res) => {
    var text = await parseJson(req.body)
    res.send(text);
    console.log("OK");
});

app.get("/", (req, res) => {
    res.send(`GET OK`);
});

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`);
});

async function sendHttpPost(message) {
    const token = process.env.LINE_NOTIFY_TOKEN || process.env.LINE_NOTIFY_TOKEN_FOR_TEST
    const payload = "message=" + message;
    var options =
    {
        "headers": { "Authorization": "Bearer " + token }
    };
    try {
        await axios.post("https://notify-api.line.me/api/notify", payload, options);
    } catch (error) {
        console.log(error);
    }
}
async function sendtoLINE(message) {
    await sendHttpPost(message);
}

async function parseJson(jsonbody) {
    // var text = jsonbody.text; // summary
    jsonbody.attachments.forEach(async m => {
        const title = m.title;
        const URL = m.title_link;
        const text = m.text;
        const nolink = text.replace(/<https?:\/\/[^\| ][^\| ]*\|([^>]*)>/g, "$1");
        const author = m.author_name;
        const hr = "--------------------";

        const message = "\n" + hr + "\n" + title + "\nby " + author + "\n" + URL + "\n" + nolink;
        await sendtoLINE(message);
    });
    await sendtoLINE(jsonbody.attachments.length + " items modified.");
}
