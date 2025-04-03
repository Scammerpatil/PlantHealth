import mongoose, { Schema } from "mongoose";

const PredictSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  image: {
    type: String,
    required: true,
  },
  prediction: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Prediction =
  mongoose.models.Prediction || mongoose.model("Prediction", PredictSchema);
export default Prediction;
