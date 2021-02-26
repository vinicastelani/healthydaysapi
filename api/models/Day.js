const mongoose = require("../database");

const DaySchema = new mongoose.Schema({
  month: {
    type: Number,
    require: true,
  },
  day: {
    type: Number,
    require: true,
  },
  data: {
    type: String,
    require: true,
  },
  image: {
    type: String,
    default: "",
  },
  delivery: {
    type: Boolean,
    require: true,
  },
  water: {
    type: Boolean,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Day = mongoose.model("Day", DaySchema);

module.exports = Day;
