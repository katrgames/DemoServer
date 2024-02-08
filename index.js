const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@tinychaosdemo.pur95un.mongodb.net/Hard?retryWrites=true&w=majority`; // Replace with your MongoDB Atlas connection URI

// Middleware
app.use(cors());
app.use(express.json());


// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Call the function to connect to MongoDB
connectToMongoDB();

// Define the Leaderboard schema
const leaderboardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  difficulty: { type: String, required: true },
  statsp1: {
    character: { type: String, required: true },
    upgrade: { type: String, required: true },
    charstats: { type: String, required: true },
  },
  statsp2: {
      character: { type: String, default: null },
      upgrade: { type: String, default: null },
      charstats: { type: String, default: null },
    },
  score: { type: Number, required: true },
  levelachieved: { type: Number, required: true },
  totalkill: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  version: { type: String, default: '1.0' },
});

// Create the Leaderboard model
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// Route to get the top 100 scores as the leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const top100Scores = await Leaderboard.find({}) // Exclude the _id field from the result
      .sort({ score: -1 }) // Sort in descending order based on the score field
      .limit(100); // Limit the result to the top 100 scores
    console.log('Leaderboard data retrieved successfully');
    res.json(top100Scores);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Error fetching leaderboard.' });
  }
});

// Route to add a new leaderboard score
app.post('/api/leaderboard', async (req, res) => {
const {name, difficulty, statsp1, statsp2, score, levelachieved, totalkill, version } = req.body;

if (!name || !difficulty || !statsp1 || !score || isNaN(score)) {
  return res.status(400).json({ error: 'Name, valid score, and player class are required.' });
}

const newScore = {
  name,
  difficulty,
  statsp1,
  statsp2: statsp2 || null,
  score: parseInt(score),
  levelachieved: parseInt(levelachieved),
  totalkill: parseInt(totalkill),
  version,
};

try {
  const leaderboardScore = await Leaderboard.create(newScore);
  console.log(`Data successfully added to the leaderboard: ${name}, ${difficulty}, ${score}`);
  res.status(201).json(leaderboardScore);
} catch (error) {
  console.error('Error adding leaderboard score:', error);
  res.status(500).json({ error: 'Error adding leaderboard score.' });
}
});

// Route to delete a leaderboard score
app.delete('/api/leaderboard/:id', async (req, res) => {
const { id } = req.params;

try {
  const leaderboardScore = await Leaderboard.findByIdAndDelete(_id);

  if (!leaderboardScore) {
    return res.status(404).json({ error: 'Leaderboard score not found.' });
  }

  res.json({ message: 'Leaderboard score deleted successfully.' });
} catch (error) {
  console.error('Error deleting leaderboard score:', error);
  res.status(500).json({ error: 'Error deleting leaderboard score.' });
}
});

// Start the server
app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});