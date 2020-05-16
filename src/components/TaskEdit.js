import DeleteIconButton from "./DeleteIconButton";
import * as tasks from "../redux/tasks";
import TaskEditForm from "./TaskEditForm";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import React from "react";
import * as reactRedux from "react-redux";

const taskEdit = ({dispatch, taskToEdit}) => (
    <Grid
        container
        wrap="nowrap"
        justify="space-between"
        alignItems="center"
        style={{flex: "1 0 100%"}}
    >
        <Box marginLeft={7}>
            <TaskEditForm
                dispatch={dispatch}
                taskToEdit={taskToEdit}
            />
        </Box>
        <Grid item>
            <DeleteIconButton
                color="error"
                deleteFn={() => {dispatch(tasks.deleteTask(taskToEdit.id));}}
            />
        </Grid>
    </Grid>
);

const TaskEdit = reactRedux.connect(
    null,
    (dispatch) => ({dispatch})
)(taskEdit);

export default TaskEdit;
