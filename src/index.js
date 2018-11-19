import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App/App";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import registerServiceWorker from "./registerServiceWorker";

const theme = createMuiTheme({
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
    <App />
  </MuiThemeProvider>,
  document.getElementById("root")
);

registerServiceWorker();
