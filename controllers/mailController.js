const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN *
          24 *
          60 *
          60 *
          1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production')
    cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.makeBroadcast = catchAsync(
  async (req, res, next) => {
    let audience = [];
    const { message } = req.body;

    //Query DB for user emails
    const users = await User.find({}, { email: 1 });

    console.log(users);
    //Generate an array of all registered emails

    for (let i = users.length; i >= 0; --i) {
      audience.push(users[i]);
    }

    //filter all undefined values from the array
    audience = audience.filter(e => e !== undefined);
    console.log(audience);
    //Actually Broadcast the message to the audience
    audience.forEach(async e => {
      try {
        await sendEmail({
          email: e,
          subject: 'CLASS ANNOUNCEMENT!!!',
          message
        });
        res.status(200).json({
          status: 'success',
          message: `Announcement broadcasted to ${audience.length} entities!`
        });
      } catch (err) {
        return 'There was an error sending this email. Please try again later!';
      }
    });
  }
);
