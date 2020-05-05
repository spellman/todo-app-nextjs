// Quick and dirty validation.
// I ported (an older version of)
// https://package.elm-lang.org/packages/rtfeldman/elm-validate/4.0.1/
// to TypeScript in a previous job. That was nice to work with.
// I've also seen https://github.com/jquense/yup used in some tutorials.
import * as util from "./util";
import dateFnsIsDate from "date-fns/isDate";
import dateFnsFormat from "date-fns/format";

export const task = (values) => {
    console.log("values", values);

    const errors = {};

    if (values.name == undefined) {
        errors.name = "Required";
    }
    else if (!util.isString(values.name)) {
        errors.name = "Must be a string.";
    }
    else if (values.name.trim() === "") {
        errors.name = "Required";
    }

    if (values.description != undefined && !util.isString(values.description)) {
        errors.description = "Optional but must be a string if given.";
    }

    if (values.targetCompletionDate != undefined && !dateFnsIsDate(values.targetCompletionDate)) {
        errors.targetCompletionDate = "Optional but must be a date if given.";
    }

    if (values.completionDate != undefined && !dateFnsIsDate(values.completionDate)) {
        errors.completionDate = "Optional but must be a date if given.";
    }
    else if (values.completionDate != undefined && util.isDateInFuture(values.completionDate)) {
        const msg = "A task can't be completed in the future. Must be "
                    + dateFnsFormat(new Date(), "MM-dd-yyyy")
                    + " or earlier.";
        errors.completionDate = msg;
    }

    console.log("errors", errors);

    return errors;
};
