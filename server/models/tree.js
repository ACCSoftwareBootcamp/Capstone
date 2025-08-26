// models/Tree.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("../connections/mongoConnection.js");

// Define node schema
const nodeSchema = new Schema({
  id: String,
  type: String,
  position: {
    x: Number,
    y: Number,
  },
  data: {
    label: String,
    onChange: { type: Schema.Types.Mixed }, // Function or other custom logic
  },
});

// Define edge schema
const edgeSchema = new Schema({
  id: String,
  source: String,
  target: String,
  sourceHandle: String,
  targetHandle: String,
  type: String,
});

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
    nodes: [nodeSchema], // Use nodeSchema for validation
    edges: [edgeSchema], // Use edgeSchema for validation
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
