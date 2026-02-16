import * as mongoose from 'mongoose'

import {MongoClient} from 'mongodb'

const DB = async ()=>{
    const mongodbConnectionString = process.env.MONGODB_CONNECTION_STRING    
    const mongoDBName = process.env.MONGODB_NAME
    
    if(!mongodbConnectionString){
        throw new Error('Missing MongoDB Environment variables')
    }

    // mongoDB client instance
    const mongoClient = new MongoClient(mongodbConnectionString);
    await mongoClient.connect();
    console.log(`MongoDb client connected with Better Auth`);
    
    try {
        await mongoose.connect(`${mongodbConnectionString}/${mongoDBName}`,{
            dbName:process.env.MONGODB_NAME,
            autoIndex:true
        })
        console.log(`Database connected`);

        console.log(`MongoDb client connected with Better Auth`);
        return {mongoose,mongoClient}
        
    } catch (error:any) {
        console.error(`Database not Connected:${error.message}`);
        process.exit(1);
    }
}

export { DB , MongoClient,};