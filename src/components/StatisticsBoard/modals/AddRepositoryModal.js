import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import Database from "../../../utils/database";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "max(50vw, 340px)",
    height: "60vh",
    backgroundColor: 'var(--background-color)',
    padding: 10,
    borderRadius: 4,
    overflow: "hidden",
    overflowY: "scroll",
    zIndex: 1,
};


export const AddRepositoryModal = (props) => {
    const [repositoryUser, setRepositoryUser] = useState("");
    const [repositoryName, setRepositoryName] = useState("")
    const [repositoryURL, setRepositoryURL] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        var url;
        try {
            url = new URL(repositoryURL);
        } catch (exception) {
            console.log(exception);
            setErrorMessage("Invalid repository URL");
            setInfoMessage("");
        }
        if (url.hostname !== "github.com") {
            setErrorMessage("Only github repository is supported");
            setInfoMessage("");
        }
        if (url.pathname.split("/").length <= 2) {
            setErrorMessage("Invalid repository URL");
            setInfoMessage("");
        } else if (url.pathname.split("/")[2] === "") {
            setErrorMessage("Invalid repository URL");
            setInfoMessage("");
        } else {
            try {
                const user = url.pathname.split("/")[1];
                const repo = url.pathname.split("/")[2];
                const data = await Database.getOctokit().request(`/repos/${user}/${repo}`);
                if (data.status === 200) {
                    setRepositoryUser(user);
                    setRepositoryName(repo);
                    setInfoMessage("Repository exists");
                    setErrorMessage("");
                }
            } catch (exception) {
                setErrorMessage("Repository not found");
                setInfoMessage("");
            }
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Box style={modalStyle}>
                <br />
                <Typography variant="h6" align="center">Add repository</Typography>
                <br />
                <Typography>Enter repository URL</Typography>
                <TextField
                    style={{ width: "max(50vw, 340px)" }}
                    size="small"
                    value={repositoryURL}
                    onInput={(e) => { setRepositoryURL(e.target.value) }}
                    placeholder="https://github.com/USER/REPO"
                    required />
                <br />
                {
                    infoMessage !== "" && (
                        <Typography color="success.main">{infoMessage}</Typography>
                    )
                }
                {
                    errorMessage !== "" && (
                        <Typography color="error">{errorMessage}</Typography>
                    )
                }
                <Button type="submit" variant="outlined" disableElevation>Add</Button>
            </Box>
        </form>
    )
}