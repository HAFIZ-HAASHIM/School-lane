const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://haashim_db_user:haash2007@cluster0.fzutfvx.mongodb.net/haashimDB?appName=Cluster0";

async function run() {
    console.log("Connecting...");
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected locally!");
    } catch (err) {
        console.error("Connection error explicitly:", err);
    } finally {
        await client.close();
    }
}
run();
