var express = require('express');
var cors = require('cors');
require('dotenv').config()
const multer = require("multer");

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

const upload = multer({ storage: multer.memoryStorage() });
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
app.post("/api/fileanalyse", upload.single("upfile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // ✅ Return file name, type, and size in JSON response
  res.json({
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
  });
});




const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
