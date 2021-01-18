//App requires local host database, remote repo on Github does not have db/sql database file present

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
const {BookMarksService}= require("./bookmark-service");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());


const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "info.log" })],
});

//INSERT API KEY MIDDLEWEAR HERE
//ALSO IMPLEMENT LOGGER
app.use(function validateAPIBearer(req, res, next) {
  const apiKEY = process.env.API_TOKEN;
  const apiTOKEN = req.get("Authorization");

  if (!apiKEY || apiTOKEN.split(" ")[1] !== apiKEY) {
    logger.error(`Unauthorized request to path ${req.path}`);
    return res.status(401).send(`Unauthorized request`);
  }
  next();
});

app.use(bookRouter);

//ROUTE HANDLERS 

// GET single bookmark
bookRouter
.route("/bookmarks/:id")
.get((req, res, next) => {
  const knexInstance = req.app.get("db");
  const {id} = req.params;
  BookMarksService.getById(knexInstance, id)
    .then((bookmarks) => {
      res.json(bookmarks);
    })
    .catch(next);
});

// GET all bookmarks
bookRouter
  .route("/bookmarks")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    BookMarksService.getAllBookmarks(knexInstance)
      .then((bookmarks) => {
        res.json(bookmarks);
      })
      .catch(next);
  })

// POST request for new bookmark
  bookRouter
   .route('/bookmarks')
   .post(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const {bookmark_name} = req.body;
    const bookmark = {bookmark_name}
    const book_id = uuid();
    console.log(book_id)

    BookMarksService.addBookmark(knexInstance, bookmark, book_id)
      .then((bookmarks) =>{
        res.status(201);
        res.json(bookmarks)
      })
      .catch(next)
  });
   
// DELETE /bookmarks/:id
bookRouter
.route("/bookmarks/:id")
.delete((req, res, next) => {
  const knexInstance = req.app.get("db");
  const { id } = req.params;
  
  BookMarksService.removeBookmark(knexInstance, id)
    .then((bookmarks) => {
      res.status(204);
      res.json(bookmarks)
    })
    .catch(next) 
  
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
