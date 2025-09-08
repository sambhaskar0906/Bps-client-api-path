import mongoose from "mongoose";

const contactSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    contactNumber:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true

    },
    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
},
    {timestamps:true})

export const Contact = mongoose.model("Contact",contactSchema);