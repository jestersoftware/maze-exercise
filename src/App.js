import React, { Component } from 'react'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Dialog from 'material-ui/Dialog'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import AppBar from 'material-ui/AppBar'
import Snackbar from 'material-ui/Snackbar'

import './App.css'

import AppMaze from './App-Maze'

import myTheme from './theme'

const MazeService = require('./service-maze.js')

class App extends Component {
  state = {
    mazes: [{ mazeName: 'maze1' }, { mazeName: 'maze2' }, { mazeName: 'maze3' }],
    maze: { mazeName: '', mazeRows: [] },
    start: {},
    end: {},
    pathways: [],
    bestPathway: {},
    form: { mazeName: '', mazeContent: '' },
    errors: { mazeName: '', mazeContent: '' },
    iterations: 0
  }

  componentWillMount = () => {
    this.getMazes()
  }

  parseMaze = (data) => {
    const newState = Object.assign({}, MazeService().parseMaze(data), { iterations: 0 })

    this.setState(newState)
  }

  handleResponseMazeGet = (res) => {
    res.json().then((data) => {
      this.parseMaze(data)
    })
  }

  handleResponseMazesGet = (res) => {
    res.json().then((data) => {
      this.setState({ mazes: data })
    })
  }

  handleResponseMazePost = (res) => {
    this.avoidRender = false

    if (res.status !== 200) {
      this.setState({ fetchError: res.status + ': ' + res.statusText })

      return
    }

    res.json().then((data) => {
      this.parseMaze(data)

      setTimeout(() => { this.setState({ uploading: false }) }, 200)
    })
  }

  getMaze = (mazeName) => {
    return fetch(
      `/api/maze/${mazeName}`,
      {
        accept: 'application/json',
      }
    ).then(this.handleResponseMazeGet)
  }

  getMazes = () => {
    return fetch(
      `/api/mazes`,
      {
        accept: 'application/json',
      }
    ).then(this.handleResponseMazesGet)
  }

  uploadMaze = () => {
    const newErrors = Object.assign(
      {},
      this.state.errors,
      {
        mazeName: this.state.form.mazeName && this.state.form.mazeName.length > 0 ? '' : 'Maze Name is required',
        mazeContent: this.state.form.mazeContent && this.state.form.mazeContent.length > 0 ? '' : 'Maze Content is required'
      }
    )

    this.setState({ errors: newErrors })

    if (newErrors.mazeName || newErrors.mazeContent)
      return

    const mazes = this.state.mazes.slice()

    mazes.push({ mazeName: this.state.form.mazeName })

    this.avoidRender = false

    this.setState({ showUpload: false, mazes: mazes, uploading: true })

    this.parseMaze({ mazeName: this.state.form.mazeName, mazeContent: this.state.form.mazeContent })

    const payload = Object.assign({}, this.state.form)

    return fetch(
      `/api/maze`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(payload)
      }).then(this.handleResponseMazePost)
  }

  solveMaze = () => {
    const maze = this.state.maze

    if (!maze) {
      this.setState({ fetchError: 'Unable to solve a maze that does not exist' })

      return
    }

    const callback = (iterations, pathways, bestPathway) => {
      this.setState({ iterations: iterations, pathways: pathways || [], bestPathway: bestPathway || {} })
    }

    MazeService().solveMaze(maze, callback)
  }

  showUpload = () => {
    this.avoidRender = true

    this.setState({ showUpload: true })
  }

  hideUpload = () => {
    this.avoidRender = false

    this.setState({ showUpload: false })
  }

  onChangeMazeName = (event, newValue) => {
    let newForm = Object.assign({}, this.state.form, { mazeName: newValue })

    this.setState({ form: newForm })
  }

  onChangeMazeContent = (event, newValue) => {
    let newForm = Object.assign({}, this.state.form, { mazeContent: newValue })

    this.setState({ form: newForm })
  }

  onChangeMazeDropdown = (event, key, value) => {
    if (value !== 'Choose maze')
      this.getMaze(value)
  }

  onRequestCloseSnackbar = () => {
    this.setState({ fetchError: '' })
  }

  renderDialog = () => {
    const actions = [
      <RaisedButton
        label="Cancel"
        onClick={this.hideUpload}
      />,
      <RaisedButton
        label="Upload"
        primary={true}
        style={{ marginLeft: 20 }}
        onClick={this.uploadMaze}
      />
    ]

    return (
      <div>
        <Dialog
          title="Upload Maze"
          actions={actions}
          modal={false}
          open={this.state.showUpload}
          onRequestClose={this.hideUpload}
        >
          <div>
            <TextField
              hintText="Maze Name"
              errorText={this.state.errors.mazeName}
              fullWidth={true}
              onChange={this.onChangeMazeName}
            />
          </div>
          <div>
            <TextField
              hintText="Maze Content"
              errorText={this.state.errors.mazeContent}
              fullWidth={true}
              multiLine={true}
              rows={10}
              rowsMax={15}
              inputStyle={{ fontFamily: 'monospace' }}
              onChange={this.onChangeMazeContent}
            />
          </div>
        </Dialog>
      </div>
    )
  }

  renderMazes = () => {
    const mazeList = this.state.mazes.slice()

    mazeList.unshift({ mazeName: 'Choose maze' })

    const items = mazeList.map((maze, i) => {
      return (
        <MenuItem
          key={i}
          value={maze.mazeName}
          primaryText={maze.mazeName}
        />
      )
    }) || []

    return (
      <DropDownMenu
        maxHeight={300}
        value={this.state.maze.mazeName || 'Choose maze'}
        style={{ marginTop: -5, marginRight: 0, width: 200 }}
        autoWidth={false}
        onChange={this.onChangeMazeDropdown}
      >
        {items}
      </DropDownMenu>
    )
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={myTheme}>
        <div className="App">
          <AppBar
            title="Maze Solver"
          />
          <p className="App-intro">
            Choose a maze, then press <span style={{ padding: '2px 4px', border: '1px solid lightgray' }}>Solve Maze</span> to solve maze and show pathways.
          </p>
          <p className="App-intro">
            Or, press <span style={{ padding: '2px 4px', border: '1px solid lightgray' }}>Upload Maze</span> to upload your own maze.
          </p>
          <div style={{ padding: 10, width: 800, margin: '0 auto' }}>
            <Toolbar
              style={{ backgroundColor: 'transparent', border: '1px solid lightgray' }}
            >
              <ToolbarGroup firstChild={true}>
                {this.renderMazes()}
                <RaisedButton
                  label="Solve Maze"
                  primary={true}
                  onClick={this.solveMaze}
                />
              </ToolbarGroup>
              <ToolbarGroup>
                <ToolbarTitle text={'Iterations: ' + (this.state.iterations || '0')} />
              </ToolbarGroup>
              <ToolbarGroup lastChild={true}>
                <RaisedButton
                  label={this.state.uploading ? 'Solving...' : 'Upload Maze'}
                  onClick={this.showUpload}
                  disabled={this.state.uploading}
                />
              </ToolbarGroup>
            </Toolbar>
          </div>
          <div>
            <AppMaze
              avoidRender={this.avoidRender}
              maze={this.state.maze}
              pathways={this.state.pathways}
              bestPathway={this.state.bestPathway}
              start={this.state.start}
              end={this.state.end}
            />
          </div>
          {this.renderDialog()}
          <Snackbar
            open={this.state.fetchError}
            message={this.state.fetchError}
            autoHideDuration={8000}
            onRequestClose={this.onRequestCloseSnackbar}
          />
        </div>
      </MuiThemeProvider>
    )
  }
}

export default App
