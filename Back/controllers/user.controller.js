const UserModel = require("../models/user.model");
// to verify each time if the id's are existing in our database
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  // select() to select all the propyoritise except password
  const users = await UserModel.find().select("-password");
  res.status(200).json(users);
};
module.exports.userInfo = (req, res) => {
  console.log(req.params);
  // the function is valid will test if the id existe on the data base if not it will exit the function
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("Id unknown : " + req.params.id);
  } else {
    UserModel.findById(req.params.id)
      .populate("kickers")
      .exec((err, data) => {
        if (!err) {
          res.send(data);
        } else {
          console.error;
        }
      })
      .select("-password");
  }
};
module.exports.updateUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).json("Id unknown : " + req.params.id);

  try {
    await UserModel.findOneAndUpdate(
      {
        _id: req.params.id
      },
      {
        $set: {
          bio: req.body.bio
        }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      },
      (err, data) => {
        if (!err) return res.json(data);
        if (err) return res.status(500).json(err);
      }
    );
  } catch (err) {
    return res.status(500).json(err);
  }
};
module.exports.deleteUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).json("Id unknown : " + req.params.id);
  try {
    await UserModel.remove({ _id: req.params.id }).exec();
    res.status(200).json("deleted!");
  } catch (err) {
    return res.status(500).json(err);
  }
};
module.exports.kicker = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToKicker)
  )
    return res.status(400).json("Id unknown : " + req.params.id);
  try {
    // add to the kickers list
    await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { kicked: req.body.idToKicker } },
      { new: true, upsert: true },
      (err, data) => {
        if (!err) res.status(201).json(data);
        else return res.status(400).json(err);
      }
    );
    // add to kicked list
    await UserModel.findByIdAndUpdate(
      req.body.idToKicker,
      { $addToSet: { kickers: req.params.id } },
      { new: true, upsert: true },
      (err, data) => {
        // if(!err) res.status(201).json(data);
        if (err) return res.status(400).json(err);
      }
    );
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports.deskicked = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToDeskicked)
  )
    return res.status(400).json("Id unknown : " + req.params.id);

  try {
    await UserModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { kicked: req.body.idToDeskicked } },
      { new: true, upsert: true },
      (err, data) => {
        if (!err) res.status(201).json(data);
        else return res.status(400).json(err);
      }
    );
    // add to kicked list
    await UserModel.findByIdAndUpdate(
      req.body.idToDeskicked,
      { $pull: { kickers: req.params.id } },
      { new: true, upsert: true },
      (err, data) => {
        // if(!err) res.status(201).json(data);
        if (err) return res.status(400).json(err);
      }
    );
  } catch (err) {
    return res.status(500).json(err);
  }
};
