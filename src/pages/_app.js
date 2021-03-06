// import UserProvider from "../context/userContext";
import * as fbTasks from "../firebase/tasks";
import * as middleware from "../redux/middleware";
import * as tasks from "../redux/tasks";
import * as flash from "../redux/flash";
import theme from "../theme";
import DateFnsUtils from "@date-io/date-fns";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import Head from "next/head";
import React from "react";
import * as reactRedux from "react-redux";
import * as redux from "redux";
import * as reduxDevtools from "redux-devtools-extension";
import thunkMiddleware from "redux-thunk";

const rootReducer = redux.combineReducers({
    tasks: tasks.reducer,
    flashMessages: flash.reducer
});

const middlewares = [
    // middleware.logger,
    thunkMiddleware.withExtraArgument(fbTasks.tasksCollection)
];
const middlewareEnhancer = redux.applyMiddleware(...middlewares);

const enhancer = reduxDevtools.composeWithDevTools(middlewareEnhancer);

const store = redux.createStore(rootReducer, undefined, enhancer);

// Since this is a single-screen app, there is no need to begin listening when a
// component is mounted and stop listening when it is unmounted; the app should
// be listening while it is in existence.
// FIXME: Not true -- if it stopped on unmount, then I wouldn't have multiple
// subscribers at once because of hot-reloading in development.
const tasksChangesUnsubscribe = fbTasks.tasksCollection.onSnapshot(
    function(snapshot) {
        snapshot.docChanges().map((change) => {
            switch (change.type) {
                case "added":
                    return (() => {
                        store.dispatch(tasks.receiveTaskAdditionFromFirestore(change.doc.id, change.doc.data()));
                    })();

                case "modified":
                    return (() => {
                        store.dispatch(tasks.receiveTaskModificationFromFirestore(change.doc.id, change.doc.data()));
                    })();

                case "removed":
                    return (() => {
                        store.dispatch(tasks.receiveTaskDeletionFromFirestore(change.doc.id));
                    })();
            }
        })
    });

// From https://github.com/mui-org/material-ui/blob/0cd5819e5c84a0d7ed079209824fc74f94109312/examples/nextjs/pages/_app.js
export default function MyApp(props) {
    const { Component, pageProps } = props;

    React.useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector("#jss-server-side");
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }
    }, []);

    return (
        <reactRedux.Provider store={store}>
            <React.Fragment>
                <Head>
                    <title>Tasks For Fun And Profit</title>
                    <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
                </Head>
                <ThemeProvider theme={theme}>
                    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                    <CssBaseline />
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <Component {...pageProps} />
                    </MuiPickersUtilsProvider>
                </ThemeProvider>
            </React.Fragment>
        </reactRedux.Provider>
    );
}
