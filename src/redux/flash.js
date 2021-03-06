import * as tasks from "./tasks";
import * as util from "../util";

export const EXTERNAL_CHANGE_TO_TASK_BEING_EDITED = "EXTERNAL_CHANGE_TO_TASK_BEING_EDITED";

export const isMessageForExternalChangeToTaskBeingEdited = (message) =>
    message.type && (new Set(message.type.split("/")).has(EXTERNAL_CHANGE_TO_TASK_BEING_EDITED));

export const isMessageForTask = (message, taskId) => message.taskId === taskId;

const TASK_COMPLETEDNESS_CHANGED_EXTERNALLY = "TASK_COMPLETEDNESS_CHANGED_EXTERNALLY";

export const taskCompletednessChangedExternally = (taskId, isComplete) => ({
    type: TASK_COMPLETEDNESS_CHANGED_EXTERNALLY,
    taskId,
    isComplete
});

const TASK_CHANGED_EXTERNALLY = "TASK_CHANGED_EXTERNALLY";

export const taskChangedExternally = (taskId) => ({
    type: TASK_CHANGED_EXTERNALLY,
    taskId
});

const TASK_DELETED_EXTERNALLY = "TASK_DELETED_EXTERNALLY";

export const taskDeletedExternally = (taskId) => ({
    type: TASK_DELETED_EXTERNALLY,
    taskId
});

const DISMISS_MESSAGE = "DISMISS_MESSAGE";

export const dismissMessage = () => ({
    type: DISMISS_MESSAGE
});

const initialState = [];

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case TASK_COMPLETEDNESS_CHANGED_EXTERNALLY:
            return (() => {
                // Drop any leading TASK_COMPLETEDNESS_CHANGED_EXTERNALLY
                // messages. We just got another one and we know whether it
                // represents complete or incomplete so let's show the most
                // recent change immediately instead of letting each snackbar
                // display for the autoHideDuration.
                const otherMessages = util.dropWhile(
                    (message) => message
                                 && message.type === `${EXTERNAL_CHANGE_TO_TASK_BEING_EDITED}/${TASK_COMPLETEDNESS_CHANGED_EXTERNALLY}`
                                 && isMessageForTask(message, action.taskId),
                    state);

                return [
                    ...otherMessages,
                    {
                        type: `${EXTERNAL_CHANGE_TO_TASK_BEING_EDITED}/${TASK_COMPLETEDNESS_CHANGED_EXTERNALLY}`,
                        taskId: action.taskId,
                        // TODO: Use a time provider so that you can test easily.
                        id: new Date(),
                        severity: "info",
                        title: `This task has been marked ${action.isComplete
                                                            ? "complete"
                                                            : "incomplete"}.`,
                        autoHideDuration: 5000 // milliseconds
                    }
                ];
            })();

        case TASK_CHANGED_EXTERNALLY:
            return [
                ...state,
                {
                    type: `${EXTERNAL_CHANGE_TO_TASK_BEING_EDITED}/${TASK_CHANGED_EXTERNALLY}`,
                    taskId: action.taskId,
                    // TODO: Use a time provider so that you can test easily.
                    id: new Date(),
                    severity: "warning",
                    title: "This task has been changed. Updating will overwrite.",
                    actions: [
                        {
                            key: "cancelEditing",
                            buttonText: "Cancel",
                            reduxAction: tasks.cancelEditTask(action.id)
                        },
                        {
                            key: "noOp",
                            buttonText: "Continue"
                        }
                    ]
                }
            ];

        case TASK_DELETED_EXTERNALLY:
            return [
                ...state,
                {
                    type: `${EXTERNAL_CHANGE_TO_TASK_BEING_EDITED}/${TASK_DELETED_EXTERNALLY}`,
                    taskId: action.taskId,
                    // TODO: Use a time provider so that you can test easily.
                    id: new Date(),
                    severity: "warning",
                    title: "This task has been deleted but you still have the information here, in this browser tab. Cancel editing to accept deletion or continue editing to create a new task from this information.",
                    actions: [
                        {
                            key: "cancelEditing",
                            buttonText: "Cancel",
                            reduxAction: tasks.cancelEditTask(action.id)
                        },
                        {
                            key: "noOp",
                            buttonText: "Continue"
                        }
                    ]
                }
            ]

        case DISMISS_MESSAGE:
            return state.slice(1);

        case tasks.CANCEL_EDIT_TASK:
            return util.dropWhile(
                (message) => message
                             && isMessageForExternalChangeToTaskBeingEdited(message)
                             && isMessageForTask(message, action.taskId),
                state);

        default:
            return state;
    }
};
