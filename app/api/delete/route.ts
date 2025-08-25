import { NextResponse } from "next/server";
import { client } from "@/lib/qdrantDb";
import { auth } from "@/lib/auth";
import File from "@/models/File.Model";


export async function DELETE(request:Request){
    try {

        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session?.user.id

        const {fileName} = await request.json();
        console.log("Filename:",fileName);       
        

        if(!fileName){
            return NextResponse.json({
                success:false,
                message:"FileName is Required"
            },{status:400})
        }

        // Match your uploaded logic -> collection name per file 
        const collectionName = `${fileName.split(".")[0]}_Collection`;
        console.log("CollectionName:",collectionName);        

        // Delete collection from Qdrant
        const deletedCollection = await client.deleteCollection(collectionName);
        console.log("DeletedCollection from qdrant DB:",deletedCollection);        
        
        // Delete File info from Mongodb
        const fileInfo = await File.deleteOne({userId})
        console.log("Deleted File Info from MongoDB :",fileInfo);        

        return NextResponse.json({
            success:true,
            message:`Collection '${collectionName}' deleted Successfully` 
        },{status:200})
        
    } catch (error) {
        console.log("Error Deleting Collection:",error);
        
        return NextResponse.json({
            success:false,
            message:`Error deleting collection`,
            error:String(error) 
        },{status:500}) 
    }    
}