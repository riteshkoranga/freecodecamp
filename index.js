const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  username: String
});
const User = mongoose.model("User", userSchema);


const exerciseSchema = new mongoose.Schema({
  userId: Number,
  description: String,
  duration: Number,
  date: String
});
const Exercise = mongoose.model("Exercise", exerciseSchema);


app.post("/api/users", async (req, res) => {
  try {
      const newUser = new User({ username: req.body.username });
      await newUser.save();
      res.json({ username: newUser.username, _id: newUser._id });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});


app.get("/api/users", async (req, res) => {
  const users = await User.find({}, "_id username");
  res.json(users);
});


app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
      const user = await User.findById(req.params._id);
      if (!user) return res.json({ error: "User not found" });

      const date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString();

      const newExercise = new Exercise({
          userId: user._id,
          description: req.body.description,
          duration: parseInt(req.body.duration),
          date: date
      });

      await newExercise.save();

      res.json({
          username: user.username,
          _id: user._id,
          description: newExercise.description,
          duration: newExercise.duration,
          date: newExercise.date
      });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});


app.get("/api/users/:_id/logs", async (req, res) => {
  try {
      const user = await User.findById(req.params._id);
      if (!user) return res.json({ error: "User not found" });

      let query = { userId: user._id };


      if (req.query.from || req.query.to) {
          query.date = {};
          if (req.query.from) query.date.$gte = new Date(req.query.from).toDateString();
          if (req.query.to) query.date.$lte = new Date(req.query.to).toDateString();
      }

      let exercises = Exercise.find(query).select("description duration date -_id");


      if (req.query.limit) exercises = exercises.limit(parseInt(req.query.limit));

      exercises = await exercises;

      res.json({
          username: user.username,
          _id: user._id,
          count: exercises.length,
          log: exercises
      });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
