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
  lastName: {
    type: String
    },
  birthDate: {
    type: Date 
  } ,
  deathDate: {
  type: Date
},
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
  partnerId: [{
    type: Schema.Types.ObjectId,
    ref: 'person'
  }],
  childId: [{
    type: Schema.Types.ObjectId,
    ref: 'person'
  }],
  biography: String,
  photoUrl: String
}, {
  timestamps: true
});

const PersonModel = mongoose.model('person', personSchema);

module.exports = PersonModel;