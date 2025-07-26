// models/Person.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('../connections/mongoConnection');

const personSchema = new Schema({
  treeId: {
    type: Schema.Types.ObjectId,
    ref: 'Tree',
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: String,
  birthDate: Date,
  deathDate: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  momId: {
    type: Schema.Types.ObjectId,
    ref: 'Person'
  },
  dadId: {
    type: Schema.Types.ObjectId,
    ref: 'Person'
  },
  partnerIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Person'
  }],
  childrenIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Person'
  }],
  biography: String,
  photoUrl: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Person', personSchema);