import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser"
import { createServer } from "http"
import { engine } from 'express-handlebars';
import exphbs from 'express-handlebars';
// import { Server } from "socket.io";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSocketIO from './utils/io.js';

export const app = express();

export const server = new createServer(app)

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

const helpers = exphbs.create({
      eq: function(arg1, arg2) {
        return arg1 === arg2;
      },
      includes: function(array, value) {
        return (array && array.includes(value)) ? true : false;
      },
      get: function(array, index) {
        return array[index];
    }
  });

//app.use('/frontend/public', express.static('frontend/public'));

app.use(express.static(path.dirname(fileURLToPath(import.meta.url)) + '/../frontend/public'));
//Crud operations on cookies
app.use(cookieParser());


// Create Handlebars engine with helpers
const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: './frontend/views/layouts/',
  partialsDir: './frontend/views/partials/',
  helpers: helpers
});

// Set Handlebars engine
app.engine('hbs', hbs.engine);

// console.log('Views directory:', app.get('views'));

app.set('views', './frontend/views');
app.set('view engine', 'hbs');


//-----------------------------------------------------------------------//

initSocketIO(server);

//------------------------------------------------------------------------------//





//extra routes import
import indexRouter from './routes/index.routre.js';
app.use('/', indexRouter);


//user routes import
import userRouter from './routes/user.route.js';
import groupRouter from './routes/group.route.js'
app.use('/api/v1/users', userRouter);
app.use('/api/v1/groups', groupRouter);


//chat routes import 

import chatRouter from './routes/chat.route.js'
app.use('/api/v1/chats', chatRouter);


//swipe routes
import swipeRouter from './routes/swipe.route.js'
app.use('/api/v1', swipeRouter);

