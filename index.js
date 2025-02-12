const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));



const userSchema = new mongoose.Schema({
  username: String
});
const User = mongoose.model("User", userSchema);



const exerciseSchema = new mongoose.Schema({
  userId: String,  
  description: String,
  duration: Number,
  date: Date,
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
  console.log(Exercise.find({}, { date: 1 }));
  res.json(users);
  
});



app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    const { description, duration, date } = req.body;
    const userId = req.params._id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Correct Date Handling
    let parsedDate = date ? new Date(date) : new Date();


    // Check if the date is valid
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid Date" });
    }


    // Save exercise to the Exercise model
    const newExercise = new Exercise({
      userId,
      description,
      duration: Number(duration),
      date: parsedDate, 
    });

    await newExercise.save();
    

    res.json({
      _id: user._id,
      username: user.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: parsedDate.toDateString(), 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let { from, to, limit } = req.query;
    let filter = { userId: req.params._id };

    if (from) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from + "T00:00:00.000Z"); // Start of the day
      if (to) filter.date.$lte = new Date(to + "T23:59:59.999Z"); // End of the day
    }
    

    

    // Query exercises
    let logs = await Exercise.find(filter)
      .sort({ date: 1 }) // Sort logs by date (oldest first)
      .limit(Number(limit) || 0);

    res.json({
      _id: user._id,
      username: user.username,
      count: logs.length,
      log: logs.map(({ description, duration, date }) => ({
        description,
        duration,
        date: new Date(date).toDateString(), 
      })),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server running on port " + listener.address().port);
});
