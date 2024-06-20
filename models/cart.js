import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: "",
  },
  userName: {
    type: String,
    default: "",
  },
  artId: {
    type: String,
    default: "",
  },
  artistId: {
    type: String,
    default: "",
  },
  isOrdered: {
    type: Boolean,
    default: false
  },
  isBought: {
    type: Boolean,
    default: false,
  },
 
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
