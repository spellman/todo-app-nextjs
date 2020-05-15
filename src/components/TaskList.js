import Task from "./Task";
import TaskEdit from "./TaskEdit";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import dateFnsCompareAsc from "date-fns/compareAsc";
import React from "react";
import * as reactRedux from "react-redux";

const taskCompareFn = (key) => (a, b) => {
    // This comparison could certainly be made type-specific and separated from
    // anything that knows about tasks and keys but these comparisons
    // (especially the isComplete boolean) are what make sense in the context of
    // tasks. This doesn't aim to be a general comparison function.
    const aVal = a[key];
    const bVal = b[key];

    switch (key) {
        // Date comparison
        case "createdDate":
        case "targetCompletionDate":
        case "completionDate":
            return dateFnsCompareAsc(aVal, bVal);

        // string comparison
        case "name":
        case "description":
            return aVal.localeCompare(bVal);

        // boolean comparison
        case "isComplete":
            switch (true) {
                case (!aVal && bVal):
                    return 1;
                case (aVal && !bVal):
                    return -1;
                default:
                    return 0;
            }
    }
};

const taskList = ({tasksById, taskToEdit}) => (
    <List>
        {
            Object.entries(tasksById)
                  .sort(([aId, aTask], [bId, bTask]) => taskCompareFn("createdDate")(aTask, bTask))
                  .map(([id, task]) =>
                      <ListItem
                          key={id}
                          divider={true}
                          disableGutters
                      >
                          {
                              id === taskToEdit
                              ? <TaskEdit id={id} task={task} />
                              : <Task id={id} task={task} />
                          }
                      </ListItem>
                  )
        }
    </List>
);

const TaskList = reactRedux.connect(
    (state) => ({
        tasksById: state.tasks.tasksById,
        taskToEdit: state.tasks.taskToEdit
    })
)(taskList);

export default TaskList;
