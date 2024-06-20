import mongoose from "mongoose";

const artSchema = new mongoose.Schema({
  titleOfArt: {
    type: String,
    default: "",
  },
  nameOfArtist: {
    type: String,
    default: "",
  },
  artistId: {
    type: String,
    default: "",
  },
  typeOfArt: {
    type: String,
    default: "",
  },
  artFile: {
    type: String,
    default: ""
  },
  price: {
    type: String,
    price: ""
  }
});

const Art = mongoose.model("Art", artSchema);

export default Art;
