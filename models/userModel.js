const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({

  firstName:{
    type:String,
    trim:true
  },

  lastName:{
    type:String,
    trim:true
  },

 email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  phone:{
    type:String
  },

  dob:{
    type:Date
  },

  gender:{
    type:String
  },

  password: {
    type: String,
    required: true
  },

  isBlocked: {
    type: Boolean,
    default: false
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }

}, {
  timestamps: true
})

const User = mongoose.model("User", userSchema)

module.exports = User