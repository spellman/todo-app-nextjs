import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import React from "react";

const DeleteIconButton = ({color = "inherit", deleteFn}) => (
    <IconButton
        aria-label="delete task"
        onClick={deleteFn}
    >
        <DeleteIcon color={color}/>
    </IconButton>
);

export default DeleteIconButton;
