// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('../connections/mongoConnection');

const userSchema = new Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  personId: {
    type: Schema.Types.ObjectId,
    ref: 'person'
  },
  trees: [{
    type: Schema.Types.ObjectId,
    ref: 'tree'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('user', userSchema);