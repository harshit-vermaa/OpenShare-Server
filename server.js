import express from 'express'
import mongoose from "mongoose";
import dotenv from "dotenv"
import router from './routers/auth.js';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';


const app = express();

dotenv.config({ path: './config.env' })

mongoose.connect(process.env.DATABASE)
    .then(() => { console.log("DataBase Connection stablish successfuly") })
    .catch(() => { console.log("connection failed with database") })

app.use(cookieParser())
app.use(express.json());
app.use(router)
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.get('/', (req, res) => {
    res.send('hello')
})

app.listen(process.env.PORT, () => {
    console.log("app is listing in " + process.env.PORT)
})