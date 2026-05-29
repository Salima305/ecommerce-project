const mongoose=require("mongoose")
const cartSchema=new mongoose.Schema({
    items:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
        },
    quantity:{
        type:Number,
        default:1
    },
    }
]
,
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true})

const Cart=mongoose.model("Cart",cartSchema)
module.exports=Cart