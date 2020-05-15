import "../firebase/clientApp";
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



export const HIDE_EDIT_TASK = "HIDE_EDIT_TASK";

export const hideEditTask = (id) => ({
    type: HIDE_EDIT_TASK,
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



export const updateTaskInFirestore = (id, taskUpdate) =>
    (dispatch, getState, tasksCollection) => {
        console.log("updateTaskInFirestore task:", taskUpdate);
        console.log("updateTaskInFirestore taskDoc:", taskToDocTask(taskUpdate));
        return tasksCollection.doc(id)
                              .update(taskToDocTask(taskUpdate))
                              .then(() => console.log("update task success:", id, "taskUpdate:", taskUpdate, "doc task:", taskToDocTask(taskUpdate)))
                              .catch((error) => console.log("update task failure:", id, "taskUpdate:", taskUpdate, "doc task:", taskToDocTask(taskUpdate), "\nerror:", error));
    };

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
const setUnion = (a, b) => {
    const union = new Set(a);
    for (let element of b) {
        union.add(element);
    }
    return union;
}

const taskDiff = (initial, final) => {
    // intial and final are each either a task or an object with a subset of the
    // keys and values of a task.
    // NOTE: This is NOT a general or recursive diff function.

    console.log("initial", initial);
    console.log("final", final);

    const allKeys = setUnion(Object.keys(initial), Object.keys(final));
    return [...allKeys.values()].reduce(
        (taskDiffAcc, k) => {
            const initial_v = initial[k];
            const final_v = final[k];

            if (initial_v == undefined && final_v == undefined) {
                return taskDiffAcc;
            }
            else if (initial_v == undefined && final_v != undefined) {
                return {...taskDiffAcc, [k]: final_v};
            }
            else if (initial_v != undefined && final_v == undefined) {
                return {...taskDiffAcc, [k]: firebase.firestore.FieldValue.delete()};
            }
            else if (initial_v != undefined && final_v != undefined) {
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

export const updateTask = (id, updatedTask) =>
    (dispatch, getState) => {
        const existingTask = getState().tasks.tasksById[id];
        const diff = taskDiff(existingTask, updatedTask);
        const updatedTaskToCommitToReduxStore = {...updatedTask};
        const diffToCommitToFirestore = {...diff};

        // If isComplete has changed to false, then delete completionDate.
        if (diff.isComplete === false) {
            delete updatedTaskToCommitToReduxStore.completionDate;
            diffToCommitToFirestore.completionDate = firebase.firestore.FieldValue.delete();
        }

        // If completionDate has been added, then ensure isComplete to true.
        if (dateFnsIsDate(diff.completionDate) && !existingTask.isComplete) {
            updatedTaskToCommitToReduxStore.isComplete = true;
            diffToCommitToFirestore.isComplete = true;
        }

        dispatch(upsertTask(id, updatedTaskToCommitToReduxStore));
        dispatch(updateTaskInFirestore(id, diffToCommitToFirestore));
        dispatch(hideEditTask());
    };

export const updateTaskCompletedness = (id, task, isComplete) => updateTask(id, {...task, isComplete});

export const deleteTaskInFirestore = (id) =>
    (dispatch, getState, tasksCollection) =>
        tasksCollection.doc(id)
                       .delete()
                       .then(() => console.log("delete task success:", id))
                       .catch((error) => console.log("delete task failure:", id, "\nerror:", error));

export const deleteTask = (id) =>
    (dispatch) => {
        dispatch(deleteTaskInFirestore(id));
        dispatch(removeTask(id));
    };

const isEditingTask = (id, state) => id === state.tasks.taskToEdit;

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
            dispatch(flash.taskDeletedExternally(id));
        }

        dispatch(removeTask(id));
    };



const exampleState = {
    showAddTask: false,
    tasksById: {
        "QpafsQGA9G7EK69my8gl": {
            "createdDate": new Date(2020, 5, 7, 12, 0, 0, 0),
            "name": "test name",
            "description": "test description",
            "targetCompletionDate": new Date(2020, 5, 8, 12, 0, 0, 0),
            "isComplete": false
        },
        "lBTUUgsarb1Pzjsc35hY": {
            "createdDate": new Date(2020, 5, 8, 12, 0, 0, 0),
            "name": "super fun thing!",
            "description": "like this!",
            "targetCompletionDate": new Date(2020, 5, 8, 13, 0, 0, 0),
            "isComplete": false
        },
        "m1KipbmuM64JvgG4tdTv": {
            "createdDate": new Date(2020, 5, 8, 13, 0, 0, 0),
            "name": "race",
            "description": "Mario Kart Wii CTGP",
            "targetCompletionDate": new Date(2020, 5, 9, 12, 0, 0, 0),
            "isComplete": false
        }
    },
    taskToEdit: null
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
                taskToEdit: action.id
            };

        case HIDE_EDIT_TASK:
            return {
                ...state,
                taskToEdit: null
            };

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
