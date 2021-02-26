const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const Day = require("../models/Day");
const router = express.Router();

const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

aws.config.update({
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  accessKeyId: process.env.ACCESS_KEY,
  region: process.env.REGION,
});

const s3 = new aws.S3({});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Invalid Mime Type, only JPEG and PNG"), false);
  }
};

const upload = multer({
  fileFilter,
  storage: multerS3({
    s3,
    bucket: "healthyweek-calendar",
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

const singleUpload = upload.single("image");

//Upload de imagem
router.post("/image-upload/:id", async (req, res) => {
  singleUpload(req, res, async (err) => {
    if (err) {
      return res.status(422).send({
        errors: [{ title: "File Upload Error", detail: err.message }],
      });
    }
    await Day.findOneAndUpdate(
      { _id: req.params.id },
      {
        image: req.file.location,
      }
    );

    return res.status(200).send({ imageUrl: req.file.location });
  });
});

//Chamado uma vez apenas para popular o banco de dados com os dias
router.post("/", async (req, res) => {
  await Day.create(req.body);
  return res.status(200).send({
    msg: { type: "success", data: "Data added" },
  });
});

//Recupera um dia do banco
router.get("/", async (req, res) => {
  const { month, day } = req.query;
  const dayFound = await Day.findOne({ month, day });
  if (!dayFound) {
    return res.status(404).send({
      msg: {
        type: "error",
        data: "Data not found",
      },
    });
  }
  return res.status(200).send({
    msg: {
      type: "success",
      data: "Data found",
    },
    data: dayFound,
  });
});

//Atualiza o dia
router.post("/:id", async (req, res) => {
  try {
    await Day.findByIdAndUpdate(req.params.id, req.body);
    return res.status(200).send({
      msg: {
        type: "success",
        data: "Data updated",
      },
    });
  } catch (err) {
    return res.status(404).send({
      msg: {
        type: "error",
        data: "Data could not be updated",
      },
    });
  }
});

//API status

router.get("/status", (req, res) => {
  return res.status(200).send({
    msg: "API Online",
  });
});

module.exports = (app) => app.use("/day", router);
