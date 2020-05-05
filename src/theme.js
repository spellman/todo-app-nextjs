import { createMuiTheme } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";

// Create a theme instance.
const theme = createMuiTheme({
    palette: {
        primary: {
            main: "#5881D8",
        },
        secondary: {
            main: "#63B132",
        },
        error: {
            main: red.A400,
        },
        background: {
            default: "#ffffff",
        },
    },
});

export default theme;
