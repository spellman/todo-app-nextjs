import * as tasks from "./tasks";

const TASK_COMPLETEDNESS_CHANGED_EXTERNALLY = "TASK_COMPLETEDNESS_CHANGED_EXTERNALLY";

export const taskCompletednessChangedExternally = (isComplete) => ({
    type: TASK_COMPLETEDNESS_CHANGED_EXTERNALLY,
    isComplete
});

const TASK_CHANGED_EXTERNALLY = "TASK_CHANGED_EXTERNALLY";

export const taskChangedExternally = () => ({
    type: TASK_CHANGED_EXTERNALLY
});

const TASK_DELETED_EXTERNALLY = "TASK_DELETED_EXTERNALLY";

export const taskDeletedExternally = () => ({
    type: TASK_DELETED_EXTERNALLY
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
                const messages = [...state];
                while (messages[0] && messages[0].type === TASK_COMPLETEDNESS_CHANGED_EXTERNALLY) {
                    messages.shift();
                }

                return [
                    ...messages,
                    {
                        type: TASK_COMPLETEDNESS_CHANGED_EXTERNALLY,
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
                    type: TASK_CHANGED_EXTERNALLY,
                    id: new Date(),
                    severity: "warning",
                    title: "This task has been changed. Updating will overwrite.",
                    actions: [
                        {key: "noOp", buttonText: "Continue"},
                        {key: "cancelEditing", buttonText: "Cancel", reduxAction: tasks.hideEditTask()}
                    ]
                }
            ];

        case TASK_DELETED_EXTERNALLY:
            return [
                ...state,
                {
                    type: TASK_DELETED_EXTERNALLY,
                    id: new Date(),
                    severity: "warning",
                    title: "This task has been deleted. Updating will also resurrect.",
                    actions: [
                        {key: "noOp", buttonText: "Continue"},
                        {key: "cancelEditing", buttonText: "Cancel", reduxAction: tasks.hideEditTask()}
                    ]
                }
            ]

        case DISMISS_MESSAGE:
            return state.slice(1);

        default:
            return state;
    }
};
