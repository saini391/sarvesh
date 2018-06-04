var express = require('express');
var router = express.Router();
var Util = require('../lib/util');
var User = require('../models/user');
const Joi = require('joi');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

var secretkey = "myfirstapp";
var token;
const userSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
});
/*
 * POST register
 */
router.post('/register', function (req, res) {

    var name = req.body.name;
    var email = req.body.email.toLowerCase();
    var password = req.body.password;
    var password2 = req.body.password2;

    const ret = Joi.validate(req.body, userSchema, {
        // return an error if body has an unrecognised property
        allowUnknown: true,
        // return all errors a payload contains, not just the first one Joi finds
        abortEarly: false
    });

    if (ret.error) {
        res.status(400).send({ error: ret.error.toString() });

    } else {

        User.findOne({ email: email }, function (err, user) {
            if (user) {
                res.status(200).send({ message: "User Exist. Please use forget password option to reset password." });
            }
            else {
                var user = new User({
                    name: name,
                    email: email,
                    password: password
                });

                user.save(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.status(200).send({ message: "Successfully Inserted" });
                    }
                });
            }
        });
    }

});

/*
 * POST login
 */
router.post('/login', function (req, res) {
    var email1 = req.body.email.toLowerCase();
    var password1 = req.body.password.toLowerCase();

    const ret = Joi.validate(req.body, userSchema, {
        // return an error if body has an unrecognised property
        allowUnknown: false,
        // return all errors a payload contains, not just the first one Joi finds
        abortEarly: false
    });

    if (ret.error) {
        res.status(400).send({ error: ret.error.toString() });

    } else {

        User.findOne({ email: email1, password: password1 }, function (err, sin) {
            if (err) {
                res.send(err);
            }
            if (!sin) {
                res.status(400).send({ message: "Invalid email and password!" });
            }
            else {
                token = jwt.sign({ id: sin._id }, secretkey, {
                    expiresIn: 86400 // expires in 24 hours
                });

                res.status(200).send({ auth: true, token: token, details: sin });
            }
        });
    }

});


router.post('/forgot-password', (req, res) => {
    var email = req.body.email.toLowerCase();
    User.findOne({ email: email }, (err, user) => {
        if (err) console.log(err);
        if (user) {
            var randomString = Math.random().toString(36).substring(7);
            user.resetCode = randomString;
            user.save(function (err) {
                if (err) console.log(err);
                Util.sendMail(user.email, 'Forgot Password', 'forgot-password', { user: user });
                res.status(400).send({ error: "Email Sent. Please check your mailbox. If not found then check in spam." });
            });
        } else {
            res.status(400).send({ error: "Invalid Email Id!" });
        }
    })
});

router.post('/change-password', (req, res) => {
    var user_id = req.body.user_id;
    var password = req.body.password;
    var new_pass = req.body.new_pass;


    User.findById(user_id, (err, user) => {
        if (err) console.log(err);
        if (user) {
            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err)
                    console.log(err);

                if (isMatch) {
                    res.status(400).send({ msg: "Password is updated." })
                } else {
                    res.status(400).send({ msg: "Wrong Password." });
                }
            });
        }
    })

});


module.exports = router;