const mongoose=require("mongoose")
const bcrypt=require("bcrypt")
const admin=require("./models/adminModels")
mongoose.connect("mongodb://localhost:27017/emprtz")
async function addAdmin() {
    const email="admin@gmail.com"
    const password="1234"
    const hashedPassword=await bcrypt.hash(password,10)
    await admin.create({
        email:email,
        password:hashedPassword
    })
    console.log("admin added")
    process.exit()
    const existing = await Admin.findOne({ email })
}

addAdmin()