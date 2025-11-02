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
    
    try {
        const conn = await mongoose.connect(`${mongoUri}/${mongodbName}`,{
            autoIndex:true
        })
        console.log(`Database connected:${conn.connection.host}`);

        const mongoCLient = new MongoClient(mongoUri);
        await mongoCLient.connect()
        console.log(`MongoDb client connected with Better Auth`);
        return {mongoose,mongoCLient}
        
    } catch (error:any) {
        console.error(`Database not Connected:${error.message}`);
        process.exit(1);
    }
}

export { DB , MongoClient};