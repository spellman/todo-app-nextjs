import * as fb from "./clientApp";

export const tasksCollection = fb.db.collection("tasks");

export const taskId = () => tasksCollection.doc().id;
