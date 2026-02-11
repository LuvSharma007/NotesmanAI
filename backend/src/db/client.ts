import * as mongoose from 'mongoose'

import {MongoClient} from 'mongodb'



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
    
    try {
        const conn = await mongoose.connect(`${mongoUri}/${mongodbName}`,{
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