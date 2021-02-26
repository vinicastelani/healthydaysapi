const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);



require("./controller/DayController")(app);

app.listen(process.env.PORT || 4000, () =>
  console.log(`server listening at port ${process.env.PORT}`)
);
