const User = require('../Models/User.model')
const {authSchema} = require('../Helpers/validationSchema')
const { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } = require('../Helpers/jwtHelper')
const client = require('../Helpers/initRedis')
const createError = require('http-errors');

module.exports = {
    register: async (req, res, next) => {

        try {

            const result = await authSchema.validateAsync(req.body)

            const doesExist = await User.findOne({ email: result.email })


            if (doesExist) throw createError.Conflict(`${result.email} is already been registered`);

            const user = new User(result);
            const savedUser = await user.save();
            const accessToken = await signAccessToken(savedUser.id)
            const refreshToken = await signRefreshToken(savedUser.id)
            res.send(accessToken);

            // res.send(savedUser);

        } catch (error) {
            if (error.isJoi === true) error.status = 422;
            next(error);
        }
    },

    login: async (req, res, next) => {

        try {
            const result = await authSchema.validateAsync(req.body)
            const user = await User.findOne({ email: result.email })

            if (!user) throw createError.NotFound(`User not registered`)

            const isMatch = await user.isValidPassword(result.password)
            if (!isMatch) throw createError.Unauthorized("Username/password  not valid")

            const accessToken = await signAccessToken(user.id);
            const refreshToken = await signRefreshToken(user.id);

            res.send({ accessToken, refreshToken })
        } catch (error) {
            if (error.isJoi === true) return next(createError.BadRequest("Invalid Username/password"))
            next(error)
        }
    },

    refreshToken: async (req, res, next) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) throw createError.BadRequest();

            const userid = await verifyRefreshToken(refreshToken);
            const accessToken = await signAccessToken(userid);
            const refrshToken = await signRefreshToken(userid);

            res.send({ accessToken, refrshToken })

        } catch (error) {
            next(error);
        }
    },

    logout: async (req, res, next) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) throw createError.BadRequest();
            const userId = await verifyRefreshToken(refreshToken);
            client.DEL(userId).then(value => {
                console.log(value);
                res.sendStatus(204);
            }).catch(err => {
                console.log(err.message)
                throw createError.InternalServerError();
            })
        } catch (error) {
            next(error);
        }
    }
}