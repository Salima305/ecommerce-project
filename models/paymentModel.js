const mongoose=require("mongoose");
const paymentSchema=new mongoose.Schema({
    order:{
        type:mongoose.Schema.Types.ObjectId,ref:'Order',required:true},

    razorpayOrderId:   { type: String, required: true },
  razorpayPaymentId: { type: String, default: null }, 
  razorpaySignature: { type: String, default: null },

  amount:{
    type:Number,
    required:true
  },
  currency:{
    type:String,
    default:'INR'
  },
  event:{
    type:String,
    enum:['captured','failed','refunded'],
    required:true,
  },
  rawPayload: { type: mongoose.Schema.Types.Mixed, default: {} },
  refundId:{ type: String, default: null },
  refundReason:{ type: String, default: null },
  refundInitiatedAt:{ type: Date,   default: null },

}, { timestamps: true });

paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });

module.exports=mongoose.model('Payment',paymentSchema)