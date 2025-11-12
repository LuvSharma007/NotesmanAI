import * as mongoose from 'mongoose'
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import {MongoClient} from 'mongodb'
import { MemorySaver } from "@langchain/langgraph";
import type { BaseCheckpointSaver } from "@langchain/langgraph-checkpoint";

let checkpointer: BaseCheckpointSaver = new MemorySaver();


const DB = async ()=>{
    const mongoUri = process.env.MONGODB_URI
    const mongodbName = process.env.MONGODB_NAME
    console.log(`MonogDBUri:${process.env.MONGODB_URI}`);
    console.log(`MonogDBName:${process.env.MONGODB_NAME}`);
    
    if(!mongoUri || !mongodbName){
        throw new Error('Missing MongoDB Environment variables')
    }

    // mongoDB client instance
    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    console.log(`MongoDb client connected with Better Auth`);

    // checkpointer with connected client
    checkpointer = new MongoDBSaver({
      client:mongoClient,
      dbName:process.env.MONGODB_NAME,
      checkpointCollectionName:"checkpoints",
      checkpointWritesCollectionName:"checkpoints_writes"
    })
    
    try {
        const conn = await mongoose.connect(`${mongoUri}/${mongodbName}`,{
            autoIndex:true
        })
        console.log(`Database connected:${conn.connection.host}`);

        console.log(`MongoDb client connected with Better Auth`);
        return {mongoose,mongoClient,checkpointer}
        
    } catch (error:any) {
        console.error(`Database not Connected:${error.message}`);
        process.exit(1);
    }
}

export { DB , MongoClient, checkpointer};