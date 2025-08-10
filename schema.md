const mongoose = require('mongoose);
require()

const UserSchema = new mongoose.Schema({
    name: { type: String, require: true }
    last: { type: String, require: true }
    middle: { type: String }
    dob: { type: String }
    profileImage: { type: Object }    
})

const FotoModel = mongoose.model('mytree", UserSchema)

module.exports = UserSchema 