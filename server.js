const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const MazeService = require('./src/service-maze')
const FileSystem = require('./service-file')

const app = express();

// app.use(bodyParser.json());
var jsonParser = bodyParser.json()

app.use(express.static(path.join(__dirname, 'build')));

app.get(
  '/',
  function (req, res) {
    res.sendFile(
      path.join(__dirname, 'build', 'index.html')
    );
  }
);

app.get(
  '/api/maze/:id',
  function (req, res) {
    const mazeContent = FileSystem().getFile(req.params.id, __dirname)

    res.json(
      {
        mazeName: req.params.id,
        mazeContent: mazeContent
      }
    );
  }
);

app.get(
  '/api/mazes',
  function (req, res) {
    const mazes = FileSystem().getFiles(__dirname).map(f => {
      return {
        mazeName: f
      }
    })

    res.json(mazes);
  }
);

app.post(
  '/api/maze',
  jsonParser,
  function (req, res) {
    const { mazeName, mazeContent } = req.body;

    try {
      FileSystem().saveFile(mazeName, __dirname, mazeContent)
    }
    catch (e) {
      console.error('Could not save file on server')
    }

    const parseObj = MazeService().parseMaze(req.body)

    const start = parseObj.start
    const end = parseObj.end

    const { pathways, bestPathway } = MazeService().solveMaze(parseObj.maze)

    res.json(
      {
        mazeName: mazeName,
        mazeContent: mazeContent,
        start: start,
        end: end,
        pathways: pathways,
        bestPathway: bestPathway
      }
    );
  }
);

app.listen(9000);