import React, { Component } from 'react'

const MazeService = require('./service-maze.js')

class AppMaze extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.avoidRender)
      return false

    return true
  }

  render() {
    const getColumns = (mazeColumns, mazeRowIndex) => {
      const mazeWidth = MazeService().getMazeWidth(this.props.maze)
      const mazeHeight = MazeService().getMazeHeight(this.props.maze)

      const sizeFactor = Math.min(50, parseInt(1600 / mazeWidth))

      return mazeColumns.map((mazeColumn, mazeColumnIndex) => {
        const partsIndex = `x${mazeColumnIndex}y${mazeRowIndex}`

        const isStart = mazeColumnIndex === this.props.start.x && mazeRowIndex === this.props.start.y
        const isEnd = mazeColumnIndex === this.props.end.x && mazeRowIndex === this.props.end.y

        let backgroundColor = null

        let bestPathwayIn = null

        if (isEnd || isStart) {
          backgroundColor = 'rgba(0, 0, 228, .3)'
        }
        else {
          if (mazeColumn.label === '.') {
            const pathwaysIn = this.props.pathways.filter(pathway => {
              return pathway.partsIndex.indexOf(partsIndex) > - 1
            })

            const solvedPathwaysIn = pathwaysIn.filter(pathway => {
              const lastPathway = pathway.parts[pathway.parts.length - 1]

              return lastPathway.x === this.props.end.x && lastPathway.y === this.props.end.y
            })

            bestPathwayIn = this.props.bestPathway.partsIndex && this.props.bestPathway.partsIndex.indexOf(partsIndex) > -1

            backgroundColor = 'rgba(255, 0, 0, '

            if (bestPathwayIn)
              backgroundColor = 'rgba(0, 255, 0, '
            else if (solvedPathwaysIn.length)
              backgroundColor = 'rgba(255, 255, 0, '

            backgroundColor = backgroundColor + (pathwaysIn.length / 10) + ')'
          }
        }

        const style = {
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: sizeFactor,
          height: sizeFactor,
          margintop: 1,
          marginLeft: 1,
          border: '1px solid transparent',
          backgroundColor: backgroundColor
        }

        let imageUrl = '/images/tree.svg'
        let imageStyle = { width: '100%', height: '100%' }

        if (isEnd || isStart) {
          imageUrl = '/images/flag.png'
          imageStyle = { position: 'absolute', width: 50, height: 50, top: (sizeFactor / 2) - 50, left: (sizeFactor - 25) / 2 }
        }
        else if (mazeColumnIndex === 0 || mazeColumnIndex === mazeWidth - 1 || mazeRowIndex === 0 || mazeRowIndex === mazeHeight - 1) {
          imageUrl = '/images/wall2.png'
        }
        else if (mazeColumn.label === '.') {
          imageUrl = '/images/white-sand.png'
        }

        return (
          <div
            key={mazeColumnIndex}
            style={style}
          >
            <img
              src={imageUrl}
              style={imageStyle}
              alt={imageUrl}
            />
            {bestPathwayIn &&
              <img
                src='/images/truck.png'
                style={{ position: 'absolute', width: '100%', height: '100%', top: 0, bottom: 0, left: 0, right: 0 }}
                alt='/images/truck.png'
              />
            }
          </div>
        )
      })
    }

    const getRows = () => {
      const mazeRows = this.props.maze.mazeRows.map((mazeRow, mazeRowIndex) => {
        const mazeColumnsJsx = getColumns(mazeRow.columns, mazeRowIndex)

        return (
          <div key={mazeRowIndex} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {mazeColumnsJsx}
          </div>
        )
      })

      return mazeRows
    }

    const mazeRowsJsx = getRows()

    return (
      <div style={{ display: 'inline-block', margin: '0 auto', maxWidth: '90%', boxShadow: '0 1px 8px 2px rgba(0, 0, 0, .25)' }}>
        {mazeRowsJsx}
      </div>
    )
  }
}

export default AppMaze
