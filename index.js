import express, { json } from 'express';
import DBclient from './mongoose/connect.js';
import userRoutes from './Routes/app-user.js';
import cors from "cors"



const app = express();
app.use(cors({origin:"*"}))

await DBclient();

app.use("/api",userRoutes)
app.use(json())

const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
    res.json({ status: true, message: "Our node.js app works" })
});

app.listen(PORT, () => console.log(`App listening at port ${PORT}`));