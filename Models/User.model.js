const mongoose = require('mongoose');
const  schema = mongoose.Schema
const bycrypt = require('bcrypt')

const userSchema = new schema({
    email:{
        type: String,
        required: true,
        lowerCase: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    }
});

userSchema.pre('save', async function (next){
    try {
        console.log("pre save");
        const salt = await bycrypt.genSalt(10);
        const hashedPassword = await bycrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    } catch (error) {
     next(error)   
    }
})

userSchema.methods.isValidPassword = async function(password) {
    try {
        return await bycrypt.compare(password, this.password)
    } catch (error) {
        next(error)
    }
} 

const User = mongoose.model('user', userSchema);
module.exports = User;