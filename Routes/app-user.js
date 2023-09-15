import { usermodel } from "../mongoose/model.js";
import express, { json } from "express";
import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import bcrypt from "bcrypt"
import { transporter, mailOptions } from "./mail.js";

const userRoutes = express.Router();

userRoutes.use(json());

userRoutes.post("/register", async (req, res) => {
    try {
        const payload = req.body
        const isUser = await usermodel.findOne({ email: payload.email }, { id: 1, email: 1, name: 1, role: 1, isVerified: 1, _id: 0 })
        if (isUser) {
            return res.send("user already exist")

        }
        bcrypt.hash(payload.password, 10, async (err, hash) => {
            if (err) {
                res.status(401).send(err.message)
            } else {
                const user = new usermodel({ ...payload, id: v4(), role: "admin", password: hash, isVerified: false })
                await user.save();

                res.send("user registered successfully")
            }
        })
    } catch (err) {
        console.log(err)
    }
})

userRoutes.post('/resetPass', async (req, res) => {
    try {
        const payload = req.body
        const isUser = await usermodel.findOne({ email: payload.email });
        if (isUser) {
            const token = jwt.sign({ email: payload.email }, process.env.JWT_KEY, { expiresIn: "1hr" });
            const link = `${process.env.HOST}verifypass?token=${token}`;
            
            // Update the user document with the token
            const addLink = await usermodel.updateOne({ email: payload.email }, { $set: { verify_link: token } });

            // Send the email with the verification link
            transporter.sendMail({ ...mailOptions, to: payload.email, text: `Please verify your email ${link}` }, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            res.send(isUser);
        } else {
            res.status(500).send("No email registered");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});



userRoutes.get("/userInfo/:email", async (req, res) => {
    try {
        const { email } = req.params
        const userInfo = await usermodel.findOne({ email }, { id: 1, name: 1, email: 1, role: 1, _id: 0 ,token:1 })
        res.send(userInfo)
    } catch (err) {
        res.status(500).send(err.message)
    }
})



userRoutes.post("/login", async (req, res) => {
    try {
        const payload = req.body;
        console.log(payload)
        const isUser = await usermodel.findOne({ email:payload.email }, { id: 1, name: 1, email: 1, role: 1, password: 1, _id: 0 })
        if (isUser) {
            bcrypt.compare(payload.password, isUser.password, async (err, result) => {
                if (!result) {
                    res.status(401).send("invalid password")
                } else {
                    const response = isUser.toObject();
                    delete res.password;
                    const jwtToken = jwt.sign({ role: res.role }, process.env.JWT_KEY, { expiresIn: "1d" })
                    res.send({ ...response, jwtToken })
                }
            })
        }
        else{
            res.status(401).send("invalid email or password")
        }
    } catch (err) {
        res.status(401).send("invalid email or password")
    }
})

userRoutes.put("/updateUser", async (req, res) => {
    try {
        const payload = req.body;
        const isUser = await usermodel.findOne({ email: payload.email }, { id: 1, name: 1, email: 1, password: 1 })
        if (isUser) {
            bcrypt.hash(payload.password, 10, async (err, hash) => {
                if (err) {
                    console.log(err)
                } else {
                    const user = await usermodel.updateOne({ email: payload.email }, { $set: { password: hash } })
                    res.send("password changed")
                }
            })
        }
    } catch (err) {
        res.status(500).send(err.message)
    }
})

export default userRoutes;