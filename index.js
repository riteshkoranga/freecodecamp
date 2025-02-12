require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let urlDatabase = [];
let urlCounter = 1; // Counter for short URLs


app.post("/api/shorturl", (req, res) => {
    let { url } = req.body;

    // Validate URL 
    try {
        const urlObj = new URL(url);
        if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
            return res.json({ error: "invalid url" });
        }

        // Check if hostname exists
        dns.lookup(urlObj.hostname, (err) => {
            if (err) return res.json({ error: "invalid url" });

            // Store URL and assign a short URL
            const shortUrl = urlCounter++;
            urlDatabase.push({ original_url: url, short_url: shortUrl });

            return res.json({ original_url: url, short_url: shortUrl });
        });
    } catch (error) {
        return res.json({ error: "invalid url" });
    }
});


app.get("/api/shorturl/:short_url", (req, res) => {
    const shortUrl = parseInt(req.params.short_url);
    const entry = urlDatabase.find((item) => item.short_url === shortUrl);

    if (entry) {
        return res.redirect(entry.original_url);
    } else {
        return res.json({ error: "No short URL found" });
    }
});




app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
