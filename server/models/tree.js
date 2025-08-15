// models/Tree.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("../connections/mongoConnection.js");

const treeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    nodes: {
      type: Array,
      default: [],
    },
    edges: {
      type: Array,
      default: [],
    },

    createdDate: {
      type: Date,
      default: Date.now,
    },
    description: String,
  },
  {
    timestamps: true,
  }
);

const TreeModel = mongoose.model("tree", treeSchema);

module.exports = TreeModel;
