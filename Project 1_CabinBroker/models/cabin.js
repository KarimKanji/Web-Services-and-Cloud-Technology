const mongoose = require('mongoose')

const cabinSchema = new mongoose.Schema({
  cabin: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  archived: Boolean

}, {
  timestamps: true
})

module.exports = mongoose.model('cabin', cabinSchema)