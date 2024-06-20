import artModel from "../models/art.js";
import { ObjectId } from "mongodb";


export const UploadArt = async (req, res) => {
  let titleOfArt = req.body.title;
  let nameOfArtist = req.body.artist;
  let typeOfArt = req.body.type;
  let artFile = req.body.file;
  let price = req.body.price;
  let artistId = req.body.artistId;

  
  
  if (!titleOfArt) {
    return res.status(400).json({
      Status: "Failed",
      message: "title required!",
    });
  }

  if (!artistId) {
    return res.status(400).json({
      Status: "Failed",
      message: "artistId required!",
    });
  }

  if (!nameOfArtist) {
    return res.status(400).json({
      Status: "Failed",
      message: "artist required!",
    });
  }

  if (!typeOfArt) {
    return res.status(400).json({
      Status: "Failed",
      message: "type required!",
    });
  }

  if (!artFile) {
    return res.status(400).json({
      Status: "Failed",
      message: "art file required!",
    });
  }

  if (!price) {
    return res.status(400).json({
      Status: "Failed",
      message: "price required!",
    });
  }
  try {
    const newArtPiece = new artModel({
      titleOfArt,
      nameOfArtist,
      typeOfArt,
      artFile,
      price,
      artistId
    });

    await newArtPiece.save();
    res.status(200).json({
      Status: "Success",
      message: "ArtPiece Uploaded successfully!",
      artPiece: newArtPiece,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const fetchArt = async (req, res) => {
  let userType = req.body.userType;
  let nameOfArtist = req.body.nameOfArtist;

  let match = {};

  if (userType === "artist") {
    if (!nameOfArtist) {
      return res.status(400).json({
        Status: "Failed",
        message: "artist required!",
      });
    }

    match = {
      nameOfArtist,
    };
  }

  try {
    await artModel
      .aggregate([
        {
          $match: match,
        },
        {
          $project: {
            id: "$_id",
            _id: 0,
            titleOfArt: 1,
            nameOfArtist: 1,
            typeOfArt: 1,
            artFile: 1,
            price: 1,
          },
        },
      ])
      .then((response) => {
        if (response) {
          res.status(200).json({
            Status: "Success",
            message: "Fetched Art successfully!",
            noOfArtPieces: response.length,
            art: response,
          });
        } else {
          res
            .status(500)
            .json({ Status: "FAILED", message: "Could not find art" });
        }
      });
  } catch (e) {
    console.log(e);
  }
};


export const EditArt = async (req, res) => {
  let titleOfArt = req.body.title;
  let typeOfArt = req.body.type;
  let price = req.body.price;
  let artId = req.body.id;

  if (!artId) {
    return res.status(400).json({
      Status: "Failed",
      message: "art Id required!",
    });
  }
  
  if (!titleOfArt) {
    return res.status(400).json({
      Status: "Failed",
      message: "title required!",
    });
  }

  if (!typeOfArt) {
    return res.status(400).json({
      Status: "Failed",
      message: "type required!",
    });
  }

  if (!price) {
    return res.status(400).json({
      Status: "Failed",
      message: "price required!",
    });
  }
  try {
    // const artPiece = await artModel.findById(artId);
    //   if (!artPiece) {
    //       return res.status(404).json({
    //           Status: "Failed",
    //           message: "ArtPiece with that id not found!",
    //       });
    //   }

    //   if (titleOfArt) artPiece.titleOfArt = titleOfArt;
    //   if (typeOfArt) artPiece.typeOfArt = typeOfArt;
    //   if (price) artPiece.price = price;


    //   await artPiece.save();
    //   res.status(200).json({
    //       Status: "Success",
    //       message: "artPiece updated successfully!",
    //       artPiece: artPiece
    //   });

    await artModel
      .findOneAndUpdate(
        { _id: ObjectId(artId) },
        { $set: { titleOfArt, typeOfArt, price } },
        { returnOriginal: false }
      )
      .then((artPiece) => {
        if (artPiece) {
          res.status(200).json({
            Status: "SUCCESS",
            message: "artPiece updated successfully!",
            artPiece
          });
        } else {
          res.status(500).json({
            Status: "FAILED",
            message: "Could not update artPiece!",
          });
        }
      });
   
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};