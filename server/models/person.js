// models/Person.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('../connections/mongoConnection.js');
const personSchema = new Schema(
  {
    treeId: {
      type: Schema.Types.ObjectId,
      ref: 'tree',
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    middleName: String,
    lastName: String,
    suffix: String,
    birth: Date,
    death: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    parents: String,
    children: String,
    momId: {
      type: Schema.Types.ObjectId,
      ref: 'person'
    },
    dadId: {
      type: Schema.Types.ObjectId,
      ref: 'person'
    },
    spouseName: String,
    partnerIds: [{
      type: Schema.Types.ObjectId,
      ref: 'person'
    }],
    childrenIds: [{
      type: Schema.Types.ObjectId,
      ref: 'person'
    }],
    biography: String,
    photoArray: Array,
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }
  },
  {
    timestamps: true
  }
);


const PersonModel = mongoose.model('person', personSchema);

module.exports = PersonModel;