import mongoose from "mongoose";

const appUserSchema = new mongoose.Schema({
    id: {
        type: "string",
        required: true
    },
    name: {
        type: "string",
        required: true
    },
    email: {
        type: "string",
        required: true
    },
    password: {
        type: "string",
        required: true
    },
    role: {
        type: "string",
        required: true
    },
    isVerified:{
        type:"boolean",
        required:true
    }
})

export const usermodel=mongoose.model("login-user",appUserSchema)