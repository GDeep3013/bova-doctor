const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  shop: String,
  state: String,
  isOnline: { type: Boolean, default: false },
  scope: String,
  expires: Date,
  accessToken: String,
  userId: Number,
  firstName: String,
  lastName: String,
  email: String,
  accountOwner: { type: Boolean, default: false },
  locale: String,
  collaborator: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
