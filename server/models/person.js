// models/Person.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('../connections/mongoConnection');

const personSchema = new Schema({
  treeId: {
    type: Schema.Types.ObjectId,
    ref: 'tree',
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
    ref: 'person'
  },
  dadId: {
    type: Schema.Types.ObjectId,
    ref: 'person'
  },
  partnerIds: [{
    type: Schema.Types.ObjectId,
    ref: 'person'
  }],
  childrenIds: [{
    type: Schema.Types.ObjectId,
    ref: 'person'
  }],
  biography: String,
  photoUrl: String
}, {
  timestamps: true
});

module.exports = mongoose.model('person', personSchema);