import { Box, Button, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "max(50vw, 340px)",
    height: "40vh",
    backgroundColor: 'var(--background-color)',
    padding: 10,
    borderRadius: 4,
    overflow: "hidden",
    overflowY: "scroll",
    zIndex: 1,
};


export const NewCategoryModal = (props) => {
    const [category, setCategory] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        props.onNewCategory(category);
    }

    useEffect(() => {

    }, [props]);
    return (
        <Box style={modalStyle}>
            <form onSubmit={handleSubmit}>
                <br />
                <Typography variant="h6" align="center">New category</Typography>
                <br />
                <Typography>Category name</Typography>
                <TextField
                    style={{ width: "max(50vw, 340px)" }}
                    onChange={(e) => { setCategory(e.target.value) }}
                    inputProps={{ maxLength: 50 }}
                    required />
                <br />
                <br />
                <Button type="submit" variant="outlined" disableElevation>Create</Button>
            </form>
        </Box>
    )
}