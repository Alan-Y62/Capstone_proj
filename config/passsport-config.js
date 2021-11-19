const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const User = require('../model/user');

//LOGS USER IN
module.exports = function(passport) {
    passport.use(
        new LocalStrategy({
            usernameField: 'email'
        }, (email, password, done) => {
            // Match user
            User.findOne({
                email: email
            }).then(user => {
                console.log(user)
                if (!user) {
                    return done(null, false, {
                        message: 'That email is not registered'
                    });
                }
                if(!user.verified) {
                    return done(null,false, {
                        message: 'Check Email for Verification'
                    })
                }
                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, {
                            message: 'Password incorrect'
                        });
                    }
                });
            });
        })
    )
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};