import mongoose from "mongoose";
import "dotenv/config"

const dbConnect = async()=>{
    try{
        const {
            MONGODB_URI,
            DATABASE_URI,
            DATABASE_URL,
            DATABASE_NAME,
        } = process.env;

        const uri =
            MONGODB_URI ||
            DATABASE_URI ||
            (DATABASE_URL && DATABASE_NAME ? `${DATABASE_URL}/${DATABASE_NAME}` : DATABASE_URL);

        if (!uri || !(uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://"))) {
            throw new Error(
                "Missing/invalid MongoDB connection string. Set MONGODB_URI (recommended) to a value starting with mongodb:// or mongodb+srv://"
            );
        }

        const connectionInstance = await mongoose.connect(uri);
        console.log(`Database Connected Succefully \nHost : ${connectionInstance.connection.host}`);
    }
    catch(error){
        console.log("Database connection failed :",error)
        process.exit(1);
    }
}

export default dbConnect;