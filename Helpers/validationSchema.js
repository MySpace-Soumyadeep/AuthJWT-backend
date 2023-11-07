const joi = require("joi");

const authSchema = joi.object({
    email: joi.string()
    .email()
    .lowercase()
    .required(),

    password: joi.string()
    .min(8)
    .required()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
})

module.exports = {
    authSchema: authSchema
}