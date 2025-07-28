// models/Tree.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('../connections/mongoConnection');

const treeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  description: String
}, {
  timestamps: true
});

module.exports = mongoose.model('tree', treeSchema);