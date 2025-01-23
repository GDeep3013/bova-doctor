const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
    {
        token: { type: String, unique: true },
    },
    { timestamps: true }
);

// Use `mongoose.models` to prevent overwriting the model
module.exports = mongoose.models.InviteToken || mongoose.model('InviteToken', tokenSchema);
