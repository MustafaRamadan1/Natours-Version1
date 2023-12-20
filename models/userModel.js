import crypo from "crypto";
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your Name '],
  },
  email: {
    type: String,
    unique: true,
    required: [true, ' Please provide us your email address '],
    lowerCase: true,
    validate: [validator.isEmail, 'please provide a valid email address'],
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minLength: 8,
    trim: true,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    trim: true,
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type:  Boolean,
    default: false,
  }
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();


  this.passwordChangedAt = Date.now() - 1000;


  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  const state = await bcrypt.compare(candidatePassword, userPassword);
  return state;
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};


userSchema.methods.createResetPasswordToken = function (){

  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + (10 * 60 * 1000);

  return resetToken;
  

}

userSchema.pre(/^find/, function (next){
  
  this.find({active: {$ne: false}});

  next();
})
const User = mongoose.model('User', userSchema);


export default User;
