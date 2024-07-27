const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};


// const { MongoClient } = require('mongodb');


// // Connection URL
// const url = process.env.MONGO_URI //'mongodb://localhost:27017';
// const dbName = process.env.DB_NAME 


// // Create a new MongoClient
// const client = new MongoClient(url);

// const connectDB = async () => { 
//   try {
//     // Connect the client to the server
//     await client.connect();
//     console.log('Connected successfully to MongoDB');
    
//     // Get the database
//     const db = client.db(dbName);
    
//     // Example: fetch users from a 'users' collection
//     app.get('/users', async (req, res) => {
//       const usersCollection = db.collection('User');
//       const users = await usersCollection.find({}).toArray();
//       res.json(users);
//     });

//   } catch (err) {
//     console.error(err.message);
//     process.exit(1);
//   }
// };

module.exports = connectDB;