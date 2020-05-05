import TaskAddForm from "./TaskAddForm";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import React from "react";

const TaskAdd = () => (
    <Paper elevation={4}>
        <Box p={1}>
            <TaskAddForm />
        </Box>
    </Paper>
);

export default TaskAdd;
