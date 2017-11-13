/*
* MAZE SERVICE
*/

const getStartAndEnd = (maze) => {
  const start = { x: 0, y: 0 }
  const end = { x: 0, y: 0 }

  maze.mazeRows.forEach(mazeRow => {
    let foundStart = mazeRow.columns.find(mazeRowColumn => mazeRowColumn.label === 'A')

    let foundEnd = mazeRow.columns.find(mazeRowColumn => mazeRowColumn.label === 'B')

    if (foundStart) {
      start.x = foundStart.index
      start.y = mazeRow.index
    }

    if (foundEnd) {
      end.x = foundEnd.index
      end.y = mazeRow.index
    }
  })

  return {
    start: start,
    end: end
  }
}

const parseMaze = (data) => {
  let returnObj = {
    maze: { mazeName: '', mazeRows: [] },
    start: {},
    end: {},
    pathways: data.pathways || [],
    bestPathway: data.bestPathway || {}
  }

  if (data.mazeContent) {
    const mazesplit = data.mazeContent.split('\n')

    const mazeRows = mazesplit.filter(mazeRow => mazeRow && mazeRow.length)

    const maze = {
      mazeName: data.mazeName,
      mazeRows: mazeRows.map((mazeRow, mazeRowIndex) => {
        return {
          index: mazeRowIndex,
          columns: mazeRow.split('').map((column, columnIndex) => {
            return {
              index: columnIndex,
              label: column
            }
          })
        }
      })
    }

    returnObj.maze = maze

    if (data.start && data.end) {
      returnObj.start = data.start
      returnObj.end = data.end
    }
    else {
      const { start, end } = getStartAndEnd(maze)

      returnObj.start = start
      returnObj.end = end
    }
  }

  return returnObj
}

const getMazeHeight = (maze) => {
  return (maze.mazeRows && maze.mazeRows.length) || 0
}

const getMazeWidth = (maze) => {
  return (maze.mazeRows && maze.mazeRows[0] && maze.mazeRows[0].columns.length) || 0
}

const getCell = (maze, point) => {
  return maze.mazeRows[point.y].columns[point.x]
}

const getNeighbors = (maze, point) => {
  const neighbors = []

  // TOP
  if (point.y - 1 > -1) {
    neighbors.push({ x: point.x, y: point.y - 1 })
  }

  // BOTTOM
  if (point.y + 1 < getMazeHeight(maze)) {
    neighbors.push({ x: point.x, y: point.y + 1 })
  }

  // LEFT
  if (point.x - 1 > -1) {
    neighbors.push({ x: point.x - 1, y: point.y })
  }

  // RIGHT
  if (point.x + 1 < getMazeWidth(maze)) {
    neighbors.push({ x: point.x + 1, y: point.y })
  }

  return neighbors
}

const getBestPathway = (pathways, end) => {
  // console.log('Final pathways', pathways)
  // console.log('Iterations', iteration)

  const solvedPathways = pathways.filter(pathway => {
    const lastPathway = pathway.parts[pathway.parts.length - 1]

    return lastPathway.x === end.x && lastPathway.y === end.y
  })

  const bestPathway = (solvedPathways.length && solvedPathways.reduce((previousPathway, currentPathway) => {
    return previousPathway.parts.length < currentPathway.parts.length ? previousPathway : currentPathway
  })) || {}

  return bestPathway
}

const generatePathways = (maze, points, end, pathways) => {
  let validNeighbors = []
  let newPathways = []

  points.forEach(point => {
    const neighbors =
      getNeighbors(maze, point)
        .map(neighbor => Object.assign(neighbor, { isEnd: neighbor.x === end.x && neighbor.y === end.y }))
        .filter(neighbor => ['.', 'B'].indexOf(getCell(maze, neighbor).label) > -1)

    if (!neighbors.length)
      return

    // let newPathways = []
    // let validNeighbors = []

    let validPathways = pathways.filter(pathway => {
      const lastCell = pathway.parts[pathway.parts.length - 1]

      return lastCell.x === point.x && lastCell.y === point.y
    })

    validPathways.forEach(pathway => {
      let firstNeighbor = null
      let neighborCount = 0

      neighbors.forEach(neighbor => {
        const partsIndex = `x${neighbor.x}y${neighbor.y}`

        const neighborAlreadyInPath = pathways.filter(anyPathway => {
          const findIndex = anyPathway.partsIndex.indexOf(partsIndex)

          return findIndex > -1 && findIndex <= pathway.parts.length
        })

        if (neighborAlreadyInPath.length)
          return

        neighborCount++

        if (neighborCount > 1) {
          const newPathway = { parts: pathway.parts.map(p => Object.assign({}, p)), partsIndex: pathway.partsIndex.slice() }

          newPathway.parts.push(neighbor)
          newPathway.partsIndex.push(partsIndex)

          newPathways.push(newPathway)
        }
        else {
          firstNeighbor = neighbor
        }

        if (!neighbor.isEnd) {
          const existingValidNeighbor = validNeighbors.find(p => p.x === neighbor.x && p.y === neighbor.y)

          if (!existingValidNeighbor) {
            validNeighbors.push(neighbor)
          }
        }
      })

      if (firstNeighbor) {
        pathway.parts.push(firstNeighbor)
        pathway.partsIndex.push(`x${firstNeighbor.x}y${firstNeighbor.y}`)
      }
    })

    // pathways = pathways.concat(newPathways)
  })

  pathways = pathways.concat(newPathways)

  return {
    pathways: pathways,
    validNeighbors: validNeighbors
  }
}

const getPathways = (maze, start, end, callback) => {
  let iteration = 0
  let pathways = []

  pathways.push({ parts: [start], partsIndex: [`x${start.x}y${start.y}`], isEnd: false })

  let returnObj = generatePathways(maze, [start], end, pathways)

  let bestPathway = {}

  const doIt = (returnObj1) => {
    iteration++

    let mod = 1

    if (iteration > 300)
      mod = 100
    else if (iteration > 100)
      mod = 50
    else if (iteration > 50)
      mod = 25
    else if (iteration > 10)
      mod = 5

    const whatever = () => {
      returnObj = generatePathways(maze, returnObj1.validNeighbors, end, returnObj1.pathways)

      if (returnObj.validNeighbors.length && iteration < 2000) {
        doIt(returnObj)
      }
      else {
        bestPathway = getBestPathway(returnObj.pathways, end)

        callback && callback(iteration, returnObj.pathways, bestPathway)
      }
    }

    if (callback && iteration % mod === 0) {
      callback(iteration, returnObj1.pathways)

      setTimeout(() => {
        whatever()
      }, 200)
    }
    else {
      whatever()
    }
  }

  doIt(returnObj)

  return {
    iterations: iteration,
    pathways: returnObj.pathways,
    bestPathway: bestPathway
  }
}

const solveMaze = (maze, callback) => {
  if (!maze) {
    console.error('Unable to solve a maze that does not exist')

    return
  }

  const { start, end } = getStartAndEnd(maze)

  return getPathways(maze, start, end, callback)
}

module.exports = () => {
  return {
    parseMaze: parseMaze,
    getMazeWidth: getMazeWidth,
    getMazeHeight: getMazeHeight,
    solveMaze: solveMaze
  }
}
