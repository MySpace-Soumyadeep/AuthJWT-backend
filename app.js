const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
const AuthRoute = require('./Routes/Auth.route')
const { verifyAccessToken } = require('./Helpers/jwtHelper')
const redisClient = require('./Helpers/initRedis')


//we will just require the dotenv package and call config function which will thae env from .env file
require("dotenv").config();
require('./Helpers/initMongoDB')

const app = express();
app.use(morgan('dev'));
// to parse the json body
app.use(express.json());
// if url is formurl encoded 
app.use(express.urlencoded({extended: true}))


app.get('/', verifyAccessToken, async(req, res, next) => {

    res.send("Helllo from express")     
})

app.use('/auth', AuthRoute);

app.use(async(req, res, next) => {
    // const error = new Error("Not Found");
    // error.status = 404;
    // //whenever there is a next function with error as first parameter, it will call the error handler function below
    // next(error);

    next(createError.NotFound("This path does not exist"))
})

// the above error will be handled by the error handler here

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error:{
            status: err.status || 500,
            msg: err.message
        }
    })
})

const PORT  = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serer is running ${PORT}`)
});
