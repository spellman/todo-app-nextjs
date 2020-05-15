import Task from "./Task";
import TaskEdit from "./TaskEdit";
import * as util from "../util";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import dateFnsCompareAsc from "date-fns/compareAsc";
import React from "react";
import * as reactRedux from "react-redux";
import dateFnsIsDate from "date-fns/isDate";

const compareWithEverythingBeforeUndefinedOrNull = (isOfType, compareFn) =>
    (a, b) => {
        if (a == undefined && b == undefined) {
            return 0;
        }
        else if (a == undefined && b != undefined) {
            return 1;
        }
        else if (a != undefined && b == undefined) {
            return -1
        }
        else if (isOfType(a) && isOfType(b)) {
            return compareFn(a, b);
        }
    };

const keyToCompareFn = (key) => {
    switch (key) {
        // Date | undefined comparison
        case "createdDate":
        case "targetCompletionDate":
        case "completionDate":
            return compareWithEverythingBeforeUndefinedOrNull(dateFnsIsDate, dateFnsCompareAsc);


        // string | undefined comparison
        case "name":
        case "description":
            return compareWithEverythingBeforeUndefinedOrNull(
                util.isString,
                (a, b) => a.localeCompare(b)
            );

        // boolean comparison
        case "isComplete":
            return compareWithEverythingBeforeUndefinedOrNull(
                util.isBoolean,
                (a, b) => {
                    if (!a && b) {
                        return 1;
                    }
                    else if (a && !b) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                });
    }
}

const taskCompareFn = ({key, direction}) => {
    const sortKeys = [
        key,
        "name",
        "description",
        "createdDate"
    ];

    const withSortDirection = direction === "desc"
                              ? (x) => -x
                              : (x) => x;

    const compareFns = Object.fromEntries(
        sortKeys.map((k) => [k, keyToCompareFn(k)])
    );

    return (a, b) => {
        for (const k of sortKeys) {
            const result = compareFns[k](a[k], b[k]);
            if (result !== 0) {
                return withSortDirection(result);
            }
        }
        return 0;
    };
};

const taskList = ({tasksPlusEditingTaskById, taskToEdit}) => {
    const compareFn = taskCompareFn({key: "createdDate", direction: "asc"});

    return <List>
        {Object.entries(tasksPlusEditingTaskById)
               .sort(([aId, aTask], [bId, bTask]) => compareFn(aTask, bTask))
               .map(([id, task]) =>
                   <ListItem
                       key={id}
                       divider={true}
                       disableGutters
                   >
                       {
                           taskToEdit && id === taskToEdit.id
                           ? <TaskEdit id={taskToEdit.id} task={taskToEdit.task} />
                           : <Task id={id} task={task} />
                       }
                   </ListItem>
               )}
    </List>;
};

const TaskList = reactRedux.connect(
    (state) => {
        // We want to re-render the taskList if tasks change UNLESS we are
        // editing that task.
        // During editing, the task is not displayed and we don't want the form
        // to re-render if the task is changed by another client.
        const tasksPlusEditingTaskById = state.tasks.taskToEdit == null
            ? state.tasks.tasksById
            : {...state.tasks.tasksById, [state.tasks.taskToEdit.id]: state.tasks.taskToEdit.task};

        return {
            tasksPlusEditingTaskById: tasksPlusEditingTaskById,
            taskToEdit: state.tasks.taskToEdit
        };
    }
)(taskList);

export default TaskList;
