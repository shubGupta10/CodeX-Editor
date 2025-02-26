import mongoose from "mongoose";

const MONGOURI = process.env.NODE_ENV === 'production' ? process.env.MONGO_PROD_URI! : process.env.MONGO_LOCAL_URI!;

if(!MONGOURI){
    throw new Error("Please provide a valid mongodb uri in env")
}

let cached = global.mongoose;

if(!cached){
    cached = global.mongoose = {conn: null, promise: null}
}

export async function ConnectoDatabase() {
    //if there is connection in cache then return it
    if(cached.conn){
        return cached.conn;
    }

    //if there promise is not present then create a new connection
    if(!cached.promise){
        const opts = {
            bufferCommands: true,
            maxPoolSize: 10,
        }

        cached.promise = mongoose.connect(MONGOURI, opts).then(() => mongoose.connection);
    }

    //if there is already a promise then do something
    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error
    }

    console.log("Database connected successfully");
    

    return cached.conn;
}