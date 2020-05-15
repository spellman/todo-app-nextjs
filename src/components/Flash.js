import * as reduxFlash from "../redux/flash";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import CloseIcon from "@material-ui/icons/Close";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import React from "react";

const Flash = ({dispatch, flashMessage}) => {
    const handleClose = (fn) =>
        (event, reason) => {
            if (reason === 'clickaway') {return;}
            if (typeof fn === "function") {fn();}
            dispatch(reduxFlash.dismissMessage());
        };
    const alertAction = <React.Fragment>
        {Array.isArray(flashMessage.actions)
         ? flashMessage.actions.map(({key, buttonText, reduxAction}) =>
                <Button
                    key={key}
                    color="inherit"
                    onClick={handleClose(
                        () => {
                            if (reduxAction != undefined) {
                                dispatch(reduxAction);
                            }
                        }
                    )}
                >
                    {buttonText}
                </Button>
            )
         : <IconButton
             size="small"
             aria-label="close"
             color="inherit"
             onClick={handleClose()}>
             <CloseIcon fontSize="small" />
         </IconButton>}
    </React.Fragment>;

    return <Snackbar
        key={flashMessage.id}
        open={true}
        onClose={handleClose()}
        autoHideDuration={flashMessage.autoHideDuration || null}
    >
        <Alert
            severity={flashMessage.severity}
            variant="filled"
            elevation={6}
            action={alertAction}
        >
            <React.Fragment>
                {flashMessage.title
                 && <AlertTitle>
                     {flashMessage.title}
                 </AlertTitle>}
                {flashMessage.message}
            </React.Fragment>
        </Alert>
    </Snackbar>;
};

export default Flash;
