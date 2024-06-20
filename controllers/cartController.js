import cartModel from "../models/cart.js";
import artModel from "../models/art.js";
import { ObjectId } from "mongodb";

export const addToCart = async (req, res) => {
  let userName = req.body.userName;
  let userId = req.body.userId;
  let artId = req.body.artId;

  if (!userName) {
    return res.status(400).json({
      Status: "Failed",
      message: "userName required!",
    });
  }

  if (!artId) {
    return res.status(400).json({
      Status: "Failed",
      message: "artId required!",
    });
  }

  if (!userId) {
    return res.status(400).json({
      Status: "Failed",
      message: "userId required!",
    });
  }

  let artistId;
  try {
    artistId = await fetchArtistId(artId);
    if (!artistId) {
      return res.status(400).json({
        Status: "Failed",
        message: "Could not get the artist's id",
      });
    }
  } catch (error) {
    return res.status(500).json({
      Status: "Failed",
      message: "An error occurred while fetching the artist's id",
    });
  }

  try {
    const existingCartItem = await cartModel.findOne({ userId, artId });
    if (existingCartItem) {
      return res.status(409).json({
        Status: "Failed",
        message: "Item already added to cart",
      });
    }

    const newCartItem = new cartModel({
      userName,
      artId,
      userId,
      artistId,
    });

    await newCartItem.save();
    return res.status(200).json({
      Status: "Success",
      message: "Item added to cart successfully!",
      item: newCartItem,
    });
  } catch (error) {
    return res.status(500).json({
      Status: "Failed",
      message: "An error occurred while adding the item to the cart",
      error: error.message,
    });
  }
};

const fetchArtistId = async (artId) => {
  let artistId = "";
  try {
    await artModel
      .aggregate([
        {
          $match: {
            _id: ObjectId(artId),
          },
        },
      ])
      .then((response) => {
        if (response) {
          // console.log('response')
          // console.log(response)
          artistId = response[0].artistId;
        } else {
          return "could not get the artist's id";
        }
      });
  } catch (e) {
    console.log(e);
  }
  return artistId;
};

export const removeFromCart = async (req, res) => {
  const userId = req.body.userId;
  const artId = req.body.id;

  if (!userId || !artId) {
    return res.status(400).send("userId and artId are required");
  }

  try {
    const result = await cartModel.deleteOne({ userId: userId, artId: artId });

    if (result.deletedCount === 0) {
      return res.status(500).json({
        Status: "Failed",
        message: "No document found with the given userId and artId",
        error: error.message,
      });
    }

    res.status(200).json({
      Status: "Success",
      message: "Item deleted from cart successfully!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      Status: "Failed",
      message: "An error occurred while deleting the item to the cart",
      error: error.message,
    });
  }
};

export const makeOrder = async (req, res) => {
  const userId = req.body.userId;

  if (!userId) {
    return res.status(400).send("userId required to make order");
  }

  try {
    await cartModel
      .updateMany({ userId: userId }, { $set: { isOrdered: true } })
      .then((response) => {
        if (response.modifiedCount > 0) {
          res.status(200).json({
            Status: "Success",
            message: "Made the order successfuly!",
            data: response,
          });
        } else {
          res
            .status(500)
            .json({
              Status: "FAILED",
              message: "Could not make order ...user has no items in cart",
            });
        }
      });
  } catch (error) {
    res.status(500).json({
      Status: "Failed",
      message: "An error occurred while making order",
      error: error.message,
    });
  }
};

export const fetchCartItems = async (req, res) => {
  let userId = req.body.userId;

  if (!userId) {
    return res.status(400).json({
      Status: "Failed",
      message: "userId required!",
    });
  }

  let artIds = await fetchArtIds(userId);

  const objectIds = artIds.map((id) => ObjectId(id));

  try {
    await artModel
      .aggregate([
        {
          $match: {
            _id: {
              $in: objectIds,
            },
          },
        },
        {
          $project: {
            id: "$_id",
            _id: 0,
            titleOfArt: 1,
            nameOfArtist: 1,
            price: 1,
            artFile: 1,
          },
        },
      ])
      .then((response) => {
        if (response) {
          res.status(200).json({
            Status: "Success",
            message: "Fetched Cart Items successfully!",
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

const fetchArtIds = async (userId) => {
  let artIds = [];
  try {
    await cartModel
      .aggregate([
        {
          $match: {
            userId: userId,
          },
        },
      ])
      .then((response) => {
        if (response) {
          response.map((obj) => {
            artIds.push(obj.artId);
          });
        } else {
          return "no art with those ids";
        }
      });
  } catch (e) {
    console.log(e);
  }
  return artIds;
};

export const fetchOrders = async (req, res) => {
  let artistId = req.body.userId;

  try {
    await cartModel
      .aggregate([
        {
          $match: {
            artistId: artistId,
            isOrdered: true,
          },
        },
        {
          $addFields: {
            artId: { $toObjectId: "$artId" },
          },
        },
        {
          $lookup: {
            from: "arts",
            localField: "artId",
            foreignField: "_id",
            as: "artDetails",
          },
        },
        {
          $unwind: "$artDetails",
        },
        {
          $project: {
            id: "$_id",
            _id: 0,
            userName: 1,
            artId: 1,
            artistId: 1,
            title: "$artDetails.titleOfArt",
            file: "$artDetails.artFile",
            price: "$artDetails.price",
          },
        },
      ])
      .then((response) => {
        if (response) {
          res.status(200).json({
            Status: "Success",
            message: "Fetched Orders successfully!",
            noOfOrders: response.length,
            orders: response,
          });
        } else {
          res
            .status(500)
            .json({ Status: "FAILED", message: "Could not get orders" });
        }
      });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ Status: "FAILED", message: "Internal Server Error" });
  }
};
