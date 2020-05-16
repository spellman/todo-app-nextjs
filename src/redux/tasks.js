import "../firebase/clientApp";
import * as fbTasks from "../firebase/tasks";
import * as flash from "./flash";
import * as util from "../util";
import dateFnsIsDate from "date-fns/isDate";
import dateFnsIsEqual from "date-fns/isEqual";
import firebase from 'firebase/app'
import "firebase/firestore";

export const ADD_TASK = "ADD_TASK";

export const addTask = () => ({
    type: ADD_TASK
});



export const HIDE_ADD_TASK = "HIDE_ADD_TASK";

export const hideAddTask = () => ({
    type: HIDE_ADD_TASK
});



export const EDIT_TASK = "EDIT_TASK";

export const editTask = (id) => ({
    type: EDIT_TASK,
    id
});



export const CANCEL_EDIT_TASK = "CANCEL_EDIT_TASK";

export const cancelEditTask = (id) => ({
    type: CANCEL_EDIT_TASK,
    id
});



export const MARK_TASK_BEING_EDITED_AS_DELETED = "MARK_TASK_BEING_EDITED_AS_DELETED";

export const markTaskBeingeditedAsDeleted = (id) => ({
    type: MARK_TASK_BEING_EDITED_AS_DELETED,
    id
});



export const UPSERT_TASK = "UPSERT_TASK";

export const upsertTask = (id, task) => ({
    type: UPSERT_TASK,
    id,
    task
});



export const REMOVE_TASK = "REMOVE_TASK";

export const removeTask = (id) => ({
    type: REMOVE_TASK,
    id
});



export const taskToDocTask = (task) =>
    util.xformValues(task, [util.undefinedToDeletionMarker,
                            util.dateToTimestamp]);

export const docTaskToTask = (docTask) =>
    util.xformValues(docTask, [util.timestampToDate]);



export const createTaskInFirestore = (id, task) =>
    (dispatch, getState, tasksCollection) => {
        console.log("createTaskInFirestore task:", task);
        console.log("createTaskInFirestore taskDoc:", taskToDocTask(task));
        return tasksCollection.doc(id)
                              .set(taskToDocTask(task))
                              .then(() => console.log("create task success:", id, "task:", task, "doc task:", taskToDocTask(task)))
                              .catch((error) => console.log("create task failure:", id, "task:", task, "doc task:", taskToDocTask(task), "\nerror:", error));
    };

export const createTask = (makeId, task) =>
    (dispatch) => {
        console.log("createTask task:", task);
        const id = makeId();
        // TODO: Use a time provider so that you can test easily.
        const augmentedTask = {...task, createdDate: new Date(), isComplete: dateFnsIsDate(task.completionDate)};
        dispatch(upsertTask(id, augmentedTask));
        dispatch(createTaskInFirestore(id, augmentedTask));
    };



export const updateTaskInFirestore = (id, taskDiff, updatedTask) =>
    (dispatch, getState, tasksCollection) => {
        console.log("updateTaskInFirestore task:", taskDiff);
        console.log("updateTaskInFirestore taskDoc:", taskToDocTask(taskDiff));
        return tasksCollection.doc(id)
                              .update(taskToDocTask(taskDiff))
                              .then(() => console.log("update task success:", id, "taskDiff:", taskDiff, "doc task:", taskToDocTask(taskDiff)))
                              .catch((error) => {
                                  console.log("update task failure:", id, "taskDiff:", taskDiff, "doc task:", taskToDocTask(taskDiff), "\nerror:", error);
                                  if (error.name === "FirebaseError" && error.code === "not-found") {
                                      dispatch(removeTask(id));
                                      dispatch(createTask(fbTasks.taskId, updatedTask));
                                  }
                              });
    };

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
const setUnion = (a, b) => {
    const union = new Set(a);
    for (let element of b) {
        union.add(element);
    }
    return union;
}

export const taskDiff = (initial, final, keysToDiff) => {
    // initial and final are each objects with a subset  of the keys and values
    // of a task. (Not necessarily the same subsets.)
    // NOTE: This is NOT a general or recursive diff function.
    keysToDiff = keysToDiff || [...setUnion(Object.keys(initial), Object.keys(final)).values()];

    console.log("keysToDiff", keysToDiff);
    console.log("initial", initial);
    console.log("final", final);

    return keysToDiff.reduce(
        (taskDiffAcc, k) => {
            const initial_v = initial[k];
            const final_v = final[k];

            if (initial_v == null && final_v == null) {
                return taskDiffAcc;
            }
            else if (initial_v == null && final_v != null) {
                return {...taskDiffAcc, [k]: final_v};
            }
            else if (initial_v != null && final_v == null) {
                return {...taskDiffAcc, [k]: firebase.firestore.FieldValue.delete()};
            }
            else if (initial_v != null && final_v != null) {
                if (dateFnsIsDate(initial_v)
                    && dateFnsIsDate(final_v)
                    && dateFnsIsEqual(initial_v, final_v)) {
                    return taskDiffAcc;
                }
                else if (initial_v === final_v) {
                    return taskDiffAcc;
                }
                else {
                    return {...taskDiffAcc, [k]: final_v};
                }
            }
        },
        {}
    );
};

export const updateTask = (id, task, diff) =>
    (dispatch, getState) => {
        const updatedTaskToCommitToReduxStore = {...task, ...diff};
        const diffToCommitToFirestore = {...diff};

        // If isComplete has changed to false, then delete completionDate.
        if (diff.isComplete === false) {
            delete updatedTaskToCommitToReduxStore.completionDate;
            diffToCommitToFirestore.completionDate = firebase.firestore.FieldValue.delete();
        }

        // If completionDate is a date, then ensure isComplete is true.
        if (dateFnsIsDate(diff.completionDate) && !task.isComplete) {
            updatedTaskToCommitToReduxStore.isComplete = true;
            diffToCommitToFirestore.isComplete = true;
        }

        dispatch(upsertTask(id, updatedTaskToCommitToReduxStore));
        dispatch(updateTaskInFirestore(id, diffToCommitToFirestore, updatedTaskToCommitToReduxStore));
        dispatch(cancelEditTask(id));
    };

export const updateTaskCompletedness = (id, task, isComplete) =>
    updateTask(id, task, taskDiff(task, {isComplete}, ["isComplete"]));

export const deleteTaskInFirestore = (id) =>
    (dispatch, getState, tasksCollection) =>
        tasksCollection.doc(id)
                       .delete()
                       .then(() => console.log("delete task success:", id))
                       .catch((error) => console.log("delete task failure:", id, "\nerror:", error));

const isEditingTask = (id, state) => state.tasks.taskToEdit && id === state.tasks.taskToEdit.id;

export const deleteTask = (id) =>
    (dispatch) => {
        dispatch(cancelEditTask(id));
        dispatch(removeTask(id));
        dispatch(deleteTaskInFirestore(id));
    };

const isChangeToTaskCompletednessOnly = (taskDiff) => {
    const diffKeys = Object.keys(taskDiff);
    console.log("taskDiff", taskDiff);
    console.log("diffKeys", diffKeys);
    console.log("diffKeys.length", diffKeys.length);
    console.log("diffKeys[0]", diffKeys[0]);
    console.log("isChangeToTaskCompletednessOnly", (diffKeys.length === 1 && diffKeys[0] === "isComplete"));
    return (diffKeys.length === 1 && diffKeys[0] === "isComplete");
};

export const receiveTaskAdditionFromFirestore = (id, docTask) =>
    (dispatch) => {
        dispatch(upsertTask(id, docTaskToTask(docTask)));
    };

export const receiveTaskModificationFromFirestore = (id, docTask) =>
    (dispatch, getState) => {
        const modifiedTask = docTaskToTask(docTask);
        const state = getState();
        const existingTask = state.tasks.tasksById[id];

        console.log("modified task", modifiedTask);
        console.log("state", state);
        console.log("existing task", existingTask);
        console.log("task id:", id);
        console.log("taskToEdit,", state.tasks.taskToEdit);
        console.log("editing task?", isEditingTask(id, state));

        if (isEditingTask(id, state)) {
            if (isChangeToTaskCompletednessOnly(taskDiff(existingTask, modifiedTask))) {
                dispatch(flash.taskCompletednessChangedExternally(id, modifiedTask.isComplete));
            }
            else {
                dispatch(flash.taskChangedExternally(id));
            }
        }

        dispatch(upsertTask(id, modifiedTask));
    };

export const receiveTaskDeletionFromFirestore = (id) =>
    (dispatch, getState) => {
        if (isEditingTask(id, getState())) {
            dispatch(markTaskBeingeditedAsDeleted(id));
            dispatch(flash.taskDeletedExternally(id));
        }

        dispatch(removeTask(id));
    };



const initialState = {
    showAddTask: false,
    tasksById: {},
    taskToEdit: null
}

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_TASK:
            return {
                ...state,
                showAddTask: true
            };

        case HIDE_ADD_TASK:
            return {
                ...state,
                showAddTask: false
            };

        case EDIT_TASK:
            return {
                ...state,
                taskToEdit: {
                    id: action.id,
                    task: state.tasksById[action.id]
                }
            };

        case CANCEL_EDIT_TASK:
            return {
                ...state,
                taskToEdit: null
            };

        case MARK_TASK_BEING_EDITED_AS_DELETED:
            return state.taskToEdit
                   ? {
                    ...state,
                    taskToEdit: {
                        ...state.taskToEdit,
                        isDeleted: true
                    }
                }
                   : state;

        case UPSERT_TASK:
            return {
                ...state,
                tasksById: {
                    ...state.tasksById,
                    [action.id]: action.task
                }
            };

        case REMOVE_TASK:
            return (() => {
                const newTasksById = {...state.tasksById};
                delete newTasksById[action.id];
                return {
                    ...state,
                    tasksById: newTasksById
                };
            })();

        default:
            return state;
    }
};
