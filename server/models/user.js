const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config').get(process.env.NODE_ENV);

const SALT_I = 10;

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        required: true,
        minlegth: 6
    },
    name: {
        type: String,
        maxlength: 100
    },
    lastname: {
        type: String,
        maxlength: 100
    },
    role: {
        type: Number,
        default: 0
    },
    token: {
        type: String
    }
});

//Hash Password//
userSchema.pre('save', function(next){
    //This 'user' alias is a document since save is called by an instance of a model(document) and
    //not the model itself.
    var user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(SALT_I, function(err, salt){
            if(err) return next(err);
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err);
                user.password = hash;
                next();
            });
        });
    }else{
        next();
    }
});

//METHODS//
//Compare a candidate password with a stored hashed password//
userSchema.methods.comparePassword = function(candidatePassword, cb){
    //'this' is a user document.
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    });
}

//Generate and store a token for a user
userSchema.methods.generateToken = function(cb){
    //'user' is an alias for a document which calls generateToken
    var user = this;
    var token = jwt.sign(user._id.toHexString(), config.SECRET);
    user.token = token;
    user.save(function(err, user){
        if(err) return cb(err);
        cb(null, user)
    });
}

userSchema.methods.deleteToken = function(token, cb){
    var user = this;
    user.update({$unset:{token:1}}, (err,user)=>{
        if(err) return cb(err);
        cb(null, user);
    });
}

//STATICS//
//Find if a given token exists in the database for a valid user
userSchema.statics.findByToken = function(token, cb){
    //'User' is a schema model. In this case the user model calling this static function
    const User = this;
    jwt.verify(token, config.SECRET, function(err, decode){
        User.findOne({"_id":decode, "token":token}, function(err,user){
            if(err) return cb(err);
            cb(null, user);
        });
    });
}

const User = mongoose.model('User', userSchema);

module.exports = {User};
