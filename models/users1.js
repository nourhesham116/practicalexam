const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
  Firstname: {
    type: String,
    required: true,
  },
  Lastname: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true
  },
  Type: {
    type: String,
    required: true
  },
}, { timestamps: true });

userSchema.statics.isThisEmailInUse = async function (email) {
  if (!email) throw new Error('Invalid email');

  try {
    const user = await this.findOne({ Email: email });
    if (user) return false;

    return true;
  } catch (error) {
    console.log('Error inside isThisEmailInUse method', error.message);
    return false;
  }
};


const users = new mongoose.model('users1', userSchema);
module.exports = users;
