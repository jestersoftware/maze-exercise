# Maze Solver

## Table of Contents

- [How To Run Maze Solver](#how-to-run-maze-solver)
- [Notes](#notes)

## How To Run Maze Solver

`npm install`

`npm start jesse`

Go to `localhost:9000` in your browser

Follow on-screen instructions

Cheers!

\- Jesse

## Notes

- Maze upload input is not validated. Please make sure **uploaded mazes are properly formatted** (like the 3 samples), and that **maze names are simple and unique**.
- The MazeService is intentionally isomorphic.
- Mazes are solved either with the `Solve Maze` button, which displays an animation, or with the `Upload Maze` button, which solves the maze on the server, but does not show an animation, until you use the `Solve Maze` button on the uploaded. I thought about implementing sockets but sadly ran out of time.