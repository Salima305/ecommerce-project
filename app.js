require("dotenv").config();
const express=require ("express")
const session=require("express-session")
const bcrypt=require("bcrypt")
const mongoose=require("mongoose")
const {MongoStore}=require("connect-mongo")
const app=express()
 const connectDB=require("./config/db")
 connectDB();
 app.set("view engine","ejs")
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(session({
    secret:"mysecretekey ",
    resave:false,
    saveUninitialized:false,
     store: MongoStore.create({
         mongoUrl: "mongodb://127.0.0.1:27017/emprtz",
        collectionName: "sessions"
}),
}))
app.use(express.static('public'));
 
app.use((req,res,next)=>{

   res.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, private'
    )
 next()
})

const adminRoutes=require("./routes/adminRoutes")
app.use("/admin",adminRoutes)

const authRoutes=require("./routes/authRoutes")
app.use("/",authRoutes)

app.listen(3000,()=>{
    console.log("server is running on the port 3000")
})