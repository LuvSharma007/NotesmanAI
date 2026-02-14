import * as mongoose from 'mongoose'

import {MongoClient} from 'mongodb'

const DB = async ()=>{
    const mongodbConnectionString = process.env.MONGODB_CONNECTION_STRING    
    const mongoDBName = process.env.MONGODB_NAME
    console.log(mongoDBName);
    
    if(!mongodbConnectionString){
        throw new Error('Missing MongoDB Environment variables')
    }

    // mongoDB client instance
    const mongoClient = new MongoClient(mongodbConnectionString);
    await mongoClient.connect();
    console.log(`MongoDb client connected with Better Auth`);
    
    try {
        const conn = await mongoose.connect(`${mongodbConnectionString}`,{
            dbName:process.env.MONGODB_NAME,
            autoIndex:true
        })
        console.log(`Database connected:${conn.connection.host}`);

        console.log(`MongoDb client connected with Better Auth`);
        return {mongoose,mongoClient}
        
    } catch (error:any) {
        console.error(`Database not Connected:${error.message}`);
        process.exit(1);
    }
}

export { DB , MongoClient,};