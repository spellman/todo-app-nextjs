import DeleteIconButton from "./DeleteIconButton";
import * as tasks from "../redux/tasks";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import dateFnsFormat from "date-fns/format";
import React from "react";
import * as reactRedux from "react-redux";

const task = ({dispatch, id, task}) => (
    <Grid
        container
        justify="space-between"
        wrap="nowrap"
        style={{flex: 1}}
    >
        <Grid
            container
            wrap="nowrap"
            alignItems="center"
            style={{flexBasis: "100%"}}
        >
            <Grid item>
                <ListItemIcon>
                    <Checkbox
                        aria-label="mark task complete"
                        checked={task.isComplete}
                        edge="end"
                        onChange={(event) => {dispatch(tasks.updateTaskCompletedness(id, task, event.target.checked))}}
                    />
                </ListItemIcon>
            </Grid>
            <Grid container>
                <Button
                    aria-label="edit task"
                    onClick={() => {dispatch(tasks.editTask(id));}}
                    style={{
                        flex: 1,
                        textAlign: "left",
                        textTransform: "initial"
                    }}
                >
                    <ListItemText
                        aria-label="task display"
                        primary={task.name}
                        secondary={
                            <React.Fragment>
                                <Typography
                                    aria-label="task description"
                                    component="span"
                                    variant="body2"
                                    display="block"
                                >
                                    {task.description}
                                </Typography>
                                <Typography
                                    component="span"
                                    variant="caption"
                                    display="block"
                                >
                                    Target completion date: {
                                    task.targetCompletionDate
                                    && dateFnsFormat(
                                        task.targetCompletionDate,
                                        "MM-dd-yyyy (eee)"
                                    )}
                                </Typography>
                                <Typography
                                    component="span"
                                    variant="caption"
                                    display="block"
                                >
                                    Actual completion date: {
                                    task.completionDate
                                    && dateFnsFormat(
                                        task.completionDate,
                                        "MM-dd-yyyy (eee)"
                                    )}
                                </Typography>
                            </React.Fragment>
                        }
                    />
                </Button>
            </Grid>
        </Grid>
        <Grid
            container
            alignItems="center"
            style={{width: "initial"}}
        >
            <Grid item>
                <DeleteIconButton deleteFn={() => {dispatch(tasks.deleteTask(id));}} />
            </Grid>
        </Grid>
    </Grid>
);

const Task = reactRedux.connect(
    null,
    (dispatch) => ({dispatch})
)(task);

export default Task;
