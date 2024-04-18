import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser"


export const app = express();


app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({
    limit : "16kb",
}));

//handling data from url 
app.use(express.urlencoded(
    {
        // can give nested objects
        extended : true,
        limit : "16kb"
    }
));


app.use(express.static("public"));

//Crud operations on cookies
app.use(cookieParser());


//routes import
import userRouter from './routes/user.route.js';
app.use('/api/v1/users', userRouter);

