import dateFnsCompareAsc from "date-fns/compareAsc";
import firebase from "firebase";
import dateFnsIsDate from "date-fns/isDate";

const _truncateDateToDay = (date) => {
    date.setHours(0, 0, 0, 0);
    return date;
}

export const today = () => _truncateDateToDay(new Date());

export const isDateInFuture = (date) =>
    (0 < dateFnsCompareAsc(_truncateDateToDay(date), today()));

// https://stackoverflow.com/a/9436948
export const isString = (x) => (typeof x === "string" || x instanceof String);

export const xformValues = (values, xforms) => {
    const result = {...values};

    for (const k of Object.keys(result)) {
        const v = result[k];

        // Conceptually, this is the application of a transducer defined by
        // * filtering the xforms for those where pred(v) is truthy
        // * reducing operation of function application
        // * initial value v
        // to the xforms.
        for (const {pred, xform} of xforms) {
            if (pred(v)) {
                xform(result, k, v);
            }
        }
    }

    return result;
}

export const removeUndefined = {
    pred: (v) => v == undefined,
    xform: (obj, k, v) => {delete obj[k];}
};

export const trim = {
    pred: isString,
    xform: (obj, k, v) => {obj[k] = v.trim();}
};

export const removeBlank = {
    pred: (v) => isString(v) && v.length === 0,
    xform: (obj, k, v) => {delete obj[k];}
};

export const truncateDateToDay = {
    pred: dateFnsIsDate,
    xform: (obj, k, v) => {obj[k] = _truncateDateToDay(v);}
};

export const undefinedToDeletionMarker = {
    pred: (v) => v == undefined,
    xform: (obj, k, v) => {obj[k] = firebase.firestore.FieldValue.delete();}
};

export const dateToTimestamp = {
    pred: dateFnsIsDate,
    xform: (obj, k, v) => {obj[k] = firebase.firestore.Timestamp.fromDate(v);}
};

export const timestampToDate = {
    pred: (v) => v instanceof firebase.firestore.Timestamp,
    xform: (obj, k, v) => {obj[k] = v.toDate();}
};

export const dropWhile = (pred, coll) => {
    const newColl = [...coll];
    while (pred(newColl[0])) {
        newColl.shift();
    }
    return newColl;
};
