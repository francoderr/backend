import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    default: "",
  },
  userType: {
    type: String,
    default: "",
  },
});

const Users = mongoose.model("Users", userSchema);

export default Users;
