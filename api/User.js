//Mongoose User Model
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    first_name: String,
    username: { type:String, default:''},
    id: Number,
    is_bot: Boolean,
    language_code: String,
    type: String,
    safeurl_wallet: String,
    pk_wallet: String,
    sk_wallet: String,
    date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);
module.exports = User