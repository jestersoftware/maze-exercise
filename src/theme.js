import getMuiTheme from 'material-ui/styles/getMuiTheme'

import {
  cyan500,
  grey100,
  grey300,
  grey400,
  grey500,
  white,
  darkBlack,
  fullBlack
} from 'material-ui/styles/colors'

import { fade } from 'material-ui/utils/colorManipulator'

import spacing from 'material-ui/styles/spacing'

const myThemeObj = {
  spacing: spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: '#0194d3',
    primary2Color: '#0194d3',
    primary3Color: grey400,
    accent1Color: '#0194d3',
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: cyan500,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack
  },
}

const myTheme = getMuiTheme(myThemeObj)

export default myTheme
