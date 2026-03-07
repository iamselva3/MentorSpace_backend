import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("MONGODB_URI is not defined in .env");
    }

    try {
        
        try {
            dns.setServers(['8.8.8.8', '8.8.4.4']);
            console.log("📡 Set DNS to Google (8.8.8.8) to bypass local block");
        } catch (e) {
            console.log("⚠️ Could not force DNS servers:", e.message);
            console.log("Using system default DNS...");
        }

        console.log("Connecting to MongoDB...");

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            family: 4, 
        });

        console.log(" MongoDB connected successfully");

       
        mongoose.connection.on('error', (err) => {
            console.error(' MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log(' MongoDB disconnected');
        });

    } catch (err) {
        console.error(" MongoDB connection failed");
        console.error("Error details:", err.message);

        if (err.name === 'MongooseServerSelectionError') {
            console.error("\n Troubleshooting tips:");
            console.error("1. Check if your IP is whitelisted in MongoDB Atlas");
            console.error("2. Verify your username and password in the connection string");
            console.error("3. Make sure the cluster name is correct");
            console.error("4. Try pinging the database host manually");
        }

        process.exit(1);
    }
};

export default connectDB;