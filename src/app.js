require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const { v4: uuid } = require("uuid");
const winston = require("winston");
const bookRouter = express.Router();
const bodyParser = express.json();

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());


const bookmarks = [
  {
    bookmark: "bookmark one",
    bookID: "6d131c20-336c-4f77-8a34-fdf117e927ef",
  },
  {
    bookmark: "bookmark two",
    bookID: "gd251d55-336c-4f77-8a34-fdf117e927ef",
  },

];

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "info.log" })],
});

//INSERT API KEY MIDDLEWEAR HERE
//ALSO IMPLEMENT LOGGER
app.use(function validateAPI(req, res, next) {
  const apiKEY = process.env.API_TOKEN;
  const apiTOKEN = req.get("Authorization");

  if (!apiKEY || apiKEY !== apiTOKEN) {
    logger.error(`Unauthorized request to path ${req.path}`);
    return res.status(401).send(`Unauthorized request`);
  }
  next();
});


app.use(bookRouter);

bookRouter
  .route("/")
  .get((req, res) => {
  return res.send("Hello, world!");
  });

//ROUTE HANDLER GET /bookmarks/:id

// GET METHOD NOT WORKING FOR UNIQUE ID
bookRouter
  .route("/bookmarks/:id")
  .get((req, res) => {
    const { id } = req.params;
    const bookmarker = bookmarks.find((bookmark) => bookmark.bookID == id);

    if (!bookmarker) {
      return res.status(404).send("Could not retrieve bookmark");
    }
    return res.json(bookmarker);

    /* Returns single bookmark with given id
    Returns 404 Not Found if ID is not valid */
  });

//ROUTE HANDLER GET /bookmarks
/*Returns list of books*/
bookRouter
  .route(path = "/bookmarks/")
  //GET method works 
  .get((req, res) => {
    //validate if book list present
    if (!bookmarks) {
      return res.status(404).send("Could not retrieve bookmark list");
    }
    return res.json(bookmarks);
  })
  //POST method works
  .post(bodyParser, (req, res) => {
    const { bookmark } = req.body;

    if (!bookmark) {
      return res.status(400).send("invalid request");
    }

    // get an id
    const bookID = uuid();

    const bookmarker = {
      bookmark,
      bookID,
    };

    bookmarks.push(bookmarker);
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${bookID}`)
      .json({ bookID });

    /* accepts a JSON object representing a bookmark and adds it to the list of bookmarks after validation.*/
  });

//ROUTE HANDLER DELETE /bookmarks/:id

//DELETE method NOT WORKING
bookRouter
  .route("/bookmarks/:id").delete((req, res) => {
    
  const { id } = req.params;

  const listIndex = bookmarks.findIndex((b) => b.bookID == id);

  if (listIndex === -1) {
    logger.error(`List with id ${id} not found.`);
    return res.status(404).send("Not Found");
  }

  lists.splice(listIndex, 1);

  logger.info(`List with id ${id} deleted.`);
  res.status(204).end();
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    ~console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
