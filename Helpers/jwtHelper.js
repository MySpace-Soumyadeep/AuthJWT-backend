const JWT = require('jsonwebtoken');
const createError = require('http-errors');
const client = require('./initRedis')


module.exports = {
    signAccessToken: (userId) => {
        console.log("access");
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.ACCESS_TOKEN_KEY;
            const options = {
                expiresIn: "15s",
                issuer: "yourwebsite.com",
                audience: userId,
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message);
                    // return reject(err);
                    return reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },

    verifyAccessToken: (req, res, next) => {
        if (!req.headers['authorization']) next(createError.Unauthorized());
        const authHeader = req.headers['authorization'];
        const bearerToken = authHeader.split(' ');
        const token = bearerToken[1];
        JWT.verify(token, process.env.ACCESS_TOKEN_KEY, {}, (err, payload) => {
            if (err) {
                if (err.name === 'JsonWebTokenError') {
                    return next(createError.Unauthorized());
                }
                return next(createError.Unauthorized(err.message));
            }
            req.payload = payload;
            next();
        })
    },

    signRefreshToken: (userId) => {
        console.log("refresh");
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.REFRESH_TOKEN_KEY;
            const options = {
                expiresIn: "1y",
                issuer: "yourwebsite.com",
                audience: userId,
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message);
                    // return reject(err);
                    return reject(createError.InternalServerError())
                }
                client.SET(userId, token, 'EX', 365 * 24 * 60 * 60)
                .then((value) => {
                     resolve(token)})
                .catch(err => {
                    console.log(err)
                    return reject(createError.InternalServerError());
                })
                // client.SET(userId,token, (err, reply) => {
                //     if(err) {
                //         console.log(err.message);
                //         return reject(createError.InternalServerError());
                //     }
                //     resolve(token)
                // })
                // resolve(token)
            })
        })
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, payload) => {
                if(err) return reject(createError.Unauthorized());
                const userid = payload.aud;

                client.GET(userid,(err,result) => {
                    if(err) {
                        console.log(err);
                        reject(createError.InternalServerError());
                        return;
                    }
                    if(refreshToken === result) return resolve(userid);
                    reject(createError.Unauthorized());
                })

                resolve(userid);
            })
        })
    }

}