import express from "express"
import mongoose from "mongoose"
import 'dotenv/config'

const app=express()
const connectDb = async () => {
     
    try {
        console.log('initiating to connect to DB');
        
        await mongoose.connect(`${process.env.MONGO_URI}`)
        // console.log(dbRes);
    }
    catch (error) {
     console.log('error connecting to db');
     
    }
}


export{connectDb}

