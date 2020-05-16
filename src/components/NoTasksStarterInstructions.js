import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import React from "react";

const NoTasksStarterInstructions = () => (
    <Container>
        <Box paddingBottom={5}>
            <Typography
                align="center"
                variant="h5"
            >
                Who doesn't like listing tasks?
            </Typography>
        </Box>
        <Box paddingBottom={4}>
            <Typography>
                When you start making tasks, they'll display here.
            </Typography>
        </Box>
        <Box paddingBottom={4}>
            <Typography>
                You can give your task
            </Typography>
            <ul>
                <li><Typography component="span">a name</Typography></li>
                <li><Typography component="span">a description</Typography></li>
                <li><Typography component="span">a target completion date</Typography></li>
                <li><Typography component="span">a completion date</Typography></li>
            </ul>
            <Typography>
                and check it off to mark it complete.
            </Typography>
        </Box>
        <Box paddingBottom={4}>
            <Typography>
                Work with your tasks from any web browser, on multiple devices or browser tabs at once if you want.
            </Typography>
        </Box>
        <Box paddingBottom={4}>
            <Typography
                variant="h6"
                align="center"
            >
                Pitter patter &mdash; click "ADD TASK" in the top right corner to get started.
            </Typography>
        </Box>
    </Container>
);

export default NoTasksStarterInstructions;
