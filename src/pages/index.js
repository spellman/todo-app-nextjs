import Flash from "../components/Flash";
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

const homePage = ({dispatch, showAddTask, tasksPlusEditingTaskById, taskToEdit, flashMessages}) => (
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

            <TaskList tasksPlusEditingTaskById={tasksPlusEditingTaskById} taskToEdit={taskToEdit} />

            {0 < flashMessages.length &&
             <Flash dispatch={dispatch} flashMessage={flashMessages[0]} />}
        </Container>
    </React.Fragment>
);

const HomePage = reactRedux.connect(
    (state) => {
        // We want to re-render the taskList if tasks change UNLESS we are
        // editing that task.
        // During editing, the task is not displayed and we don't want the form
        // to re-render if the task is changed by another client.
        const taskToEdit = state.tasks.taskToEdit;
        const tasksPlusEditingTaskById = taskToEdit == null
                                         ? state.tasks.tasksById
                                         : {...state.tasks.tasksById, [taskToEdit.id]: taskToEdit.task};

        return {
            showAddTask: state.tasks.showAddTask,
            tasksPlusEditingTaskById: tasksPlusEditingTaskById,
            taskToEdit: taskToEdit,
            flashMessages: state.flashMessages
        };
    },
    (dispatch) => ({dispatch})
)(homePage);

// Next.js uses this default export for the index page because this file is index.js.
export default HomePage;
