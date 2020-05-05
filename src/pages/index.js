import TaskAdd from "../components/TaskAdd";
import TaskList from "../components/TaskList";
import * as tasks from "../redux/tasks";
import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import React from "react";
import * as reactRedux from "react-redux";

const ToggleShowAddTaskButton = ({dispatch, showAddTask}) => (
    showAddTask
    ? <Button
        startIcon={<RemoveCircleIcon />}
        onClick={() => {dispatch(tasks.hideAddTask())}}
        color="inherit"
    >
        Hide Add Task Form
    </Button>
    : <Button
        startIcon={<AddCircleIcon />}
        onClick={() => {dispatch(tasks.addTask())}}
        color="inherit"
    >
        Add Task
    </Button>
);

const homePage = ({dispatch, showAddTask}) => (
    <React.Fragment>
        <AppBar>
            <Toolbar>
                <Typography
                    component="h1"
                    variant="h5"
                    style={{flex: 1}}
                >
                    Tasks
                </Typography>

                <ToggleShowAddTaskButton
                    dispatch={dispatch}
                    showAddTask={showAddTask}
                />
            </Toolbar>
        </AppBar>

        <Container>
            <Box marginTop={10}>
                {showAddTask && <TaskAdd />}
            </Box>

            <TaskList />
        </Container>
    </React.Fragment>
);

const HomePage = reactRedux.connect(
    (state) => ({
        showAddTask: state.showAddTask
    }),
    (dispatch) => ({dispatch})
)(homePage);

// Next.js uses this default export for the index page because this file is index.js.
export default HomePage;
