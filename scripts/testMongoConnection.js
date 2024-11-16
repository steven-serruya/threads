const { MongoClient, ServerApiVersion } = require("mongodb");

// Replace with your MongoDB connection string
const uri =
  "mongodb+srv://stevenserruya:aaabbb1234@threads.jsovn.mongodb.net/?retryWrites=true&w=majority&appName=Threads";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect(); // Connect to the database

    // Ping the admin database to confirm the connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.error("MongoDB connection failed: ", err);
  } finally {
    await client.close(); // Close the connection when done
  }
}

run().catch(console.dir);
