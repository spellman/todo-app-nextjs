import * as validation from "../formValidation";
import * as tasks from "../redux/tasks";
import * as util from "../util";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import dateFnsFormat from "date-fns/format";
import * as formik from "formik";
import * as formikMUI from "formik-material-ui";
import * as formikMUIPickers from "formik-material-ui-pickers";
import React from "react";

const TaskEditForm = ({dispatch, id, task}) => (
    <formik.Formik
        initialValues={{
            name: task.name,
            description: task.description,
            targetCompletionDate: task.targetCompletionDate || null,
            completionDate: task.completionDate || null
        }}
        validate={validation.task}
        onSubmit={(values, {setSubmitting}) => {
            const xformedValues = util.xformValues(values, [util.trim,
                                                            util.truncateDateToDay]);
            setSubmitting(false);
            dispatch(tasks.updateTask(id, {...task, ...xformedValues}));
        }}
    >
        {({submitForm, isSubmitting}) =>(
            <formik.Form
                autoComplete="off"
                style={{flex: 1}}
            >
                <Grid
                    container
                    direction="row"
                    wrap="wrap"
                    spacing={1}
                >
                    <Grid item xs={12}>
                        <formik.Field
                            name="name"
                            type="text"
                            required
                            aria-required={true}
                            component={formikMUI.TextField}
                            variant="filled"
                            label="Name"
                            style={{display: "flex"}}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <formik.Field
                            name="description"
                            type="text"
                            component={formikMUI.TextField}
                            multiline
                            variant="filled"
                            label="Description"
                            style={{display: "flex"}}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <formik.Field
                            name="targetCompletionDate"
                            component={formikMUIPickers.KeyboardDatePicker}
                            format="MM-dd-yyyy"
                            autoOk
                            clearable
                            inputVariant="filled"
                            label="Target completion date"
                            style={{display: "flex"}}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <formik.Field
                            name="completionDate"
                            component={formikMUIPickers.KeyboardDatePicker}
                            format="MM-dd-yyyy"
                            disableFuture
                            aria-valuemax={dateFnsFormat(new Date(), "MM-dd-yyyy")}
                            maxDateMessage={"A task can't be completed in the future. Must be " + dateFnsFormat(new Date(), "MM-dd-yyyy") + " or earlier."}
                            autoOk
                            clearable
                            inputVariant="filled"
                            label="Actual completion date"
                            style={{display: "flex"}}
                        />
                    </Grid>
                    <Grid
                        item
                        container
                        justify="space-between"
                    >
                        <Grid item>
                            <Box pt={1} pb={1}>
                                <Button
                                    onClick={() => {dispatch(tasks.hideEditTask())}}
                                    disabled={isSubmitting}
                                    color="default"
                                    variant="contained"
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item>
                            <Box pt={1} pb={1}>
                                <Button
                                    onClick={submitForm}
                                    disabled={isSubmitting}
                                    color="primary"
                                    variant="contained">
                                    Update Task
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            </formik.Form>
        )}
    </formik.Formik>
);

export default TaskEditForm;
