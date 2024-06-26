import { Box, Button, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "max(50vw, 340px)",
    height: "70vh",
    backgroundColor: 'var(--background-color)',
    padding: 10,
    borderRadius: 4,
    overflow: "hidden",
    overflowY: "scroll",
    zIndex: 1,
};


export const NewTaskModal = (props) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [availableCategories, setAvailableCategories] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        props.onNewTask({ title: title, description: description, category: category });
    }

    useEffect(() => {
        let columnNames = []
        Object.entries(props.columns).filter(([id, column], index) => {
            columnNames.push(column.name);
            return null;
        });
        setAvailableCategories(columnNames);
    }, [props]);
    return (
        <Box style={modalStyle}>
            <form onSubmit={handleSubmit}>
                <br />
                <Typography variant="h6" align="center">New task</Typography>
                <br />
                <Typography>Task title</Typography>
                <TextField style={{ width: "max(50vw, 340px)" }} onChange={(e) => { setTitle(e.target.value) }} required />
                <Typography>Task description</Typography>
                <TextField style={{ width: "max(50vw, 340px)" }} onChange={(e) => { setDescription(e.target.value) }} rows={4} multiline required />
                <Typography>Task category</Typography>
                {
                    availableCategories &&
                    <Select
                        onChange={(e) => { setCategory(e.target.value) }}
                        style={{ width: "max(50vw, 340px)" }}
                        required>
                        {availableCategories.map((category, index) => {
                            return (
                                <MenuItem key={index} value={category}>{category}</MenuItem>
                            )
                        })}
                    </Select>
                }
                <br />
                <br />
                <Button type="submit" variant="outlined" disableElevation>Create</Button>
            </form>
        </Box>
    )
}