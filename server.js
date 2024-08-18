const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/words', require('./routes/word'));
app.use('/api/gameResults', require('./routes/gameResult'));
//app.use('/api/games', require('./routes/games'));
const { MongoClient } = require('mongodb');
// Connection URL
const url = 'mongodb://localhost:27017';
const dbName = 'word_quest_db';

// Create a new MongoClient
const client = new MongoClient(url);

async function connectToDatabase() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log('Connected successfully to MongoDB');
    
    // Get the database
    // const db = client.db(dbName);
    // //console.log(db)
    // // Example: fetch users from a 'users' collection
    // app.get('/users', async (req, res) => {
    //   const usersCollection = db.collection('users');
    //   console.log(usersCollection)
    //   const users = await usersCollection.find({}).toArray();
    //   res.json(users);
    //   console.log(res)
    // });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToDatabase();


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// const mongoose = require('mongoose');

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected...'))
// .catch(err => console.log('MongoDB connection error:', err));
