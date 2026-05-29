const mongoose=require("mongoose")
const lineItemSchema=new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    name:{
        type:String,
        required:true
    },
    image:{ 
        type:[String],
        default:[]
        },
        
    price:{
        type:Number,
         required:true
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    },
    subtotal:{
         type:Number,
         required:true
    },
 }, {_id:false
})

const addressSchema=new mongoose.Schema({
     fullName: {
         type: String,
         default: '' 
        },
    line1:{
        type:String,
        required:true
    },
    line2:{
        type:String,
        default:''
    },
    city:{
        type:String,
        required:true
    },
     state:{
        type:String,
        required:true
    },
     pincode:{
        type:String,
        required:true
    },
},{_id:false})

const orderSchema=new mongoose.Schema({
    customer:{
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            lowercase:true
        },
        phone:{
            type:String,
            default:''
        },},

        items:{type:[lineItemSchema],
            required:true
        },


        pricing:{
            subtotal:{
                type:Number,
                required:true
            }
        ,
        shipping:{
            type:Number,
                required:true
        },
        
        discount:{
            type:Number,
            default:0
        },
        total:{
            type:Number,
            required:true
        },
    },
        couponCode:{
            type:String,
            default:null,

        },
        shippingAddress:{type:addressSchema,required:true},
       
       
        status: {
  type: String,
  enum: [
    'pending',
    'paid',
    'confirmed',
    'shipped',
    'out-for-delivery',
    'delivered',
    'cancelled',
    'return-requested',
    'returned',
    'failed',
  ],
  default: 'pending',
},

        razorpayOrderId:{
            type:String,
            unique:true,
           sparse:true
        },
        notes:{type:String,default:''},

cancellationReason: { type: String, default: null },
returnReason:       { type: String, default: null },
returnRequestedAt:  { type: Date,   default: null },
cancelledAt:        { type: Date,   default: null },
    },{timestamps:true})
   
    orderSchema.index({'customer.email':1,createdAt:-1})

    module.exports=mongoose.model('Order',orderSchema);