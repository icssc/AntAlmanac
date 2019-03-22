import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App/App";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import{unregister} from "./registerServiceWorker";

const theme = createMuiTheme({
  typography: {
    htmlFontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size')),
    fontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size')) * 0.9,
  },
  palette: {
    primary: {
      light: "#5191d6",
      main: "#0064a4",
      dark: "#003a75",
      contrastText: "#fff"
    },
    secondary: {
      light: "#ffff52",
      main: "#ffd200",
      dark: "#c7a100",
      contrastText: "#000"
    }
  }
});

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <App style ={{height:"100%"}}/>
  </MuiThemeProvider>,
  document.getElementById("root")
);

unregister();
