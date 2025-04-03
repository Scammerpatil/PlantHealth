import mongoose, { Schema } from "mongoose";

const UserScheme = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  photo: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model("User", UserScheme);
export default User;
