import { Box, Button, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Modal } from "@material-ui/core";
import { GHTokenUpdateModal } from "../../modals/GHTokenUpdateModal";
import { auth } from "../../../utils/firebase";
import DatabaseManager from "../../../utils/databaseManager";

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
    const [tokenUpdateModalOpen, setTokenUpdateModalOpen] = useState(false);
    const handleTokenUpdateModalOpen = () => setTokenUpdateModalOpen(true);
    const handleTokenUpdateModalClose = () => setTokenUpdateModalOpen(false);

    const verifyReporitoryURL = async () => {
        setRepositoryUser("");
        setRepositoryName("");
        var url;
        try {
            url = new URL(repositoryURL);
        } catch (exception) {
            setErrorMessage("Invalid repository URL");
            setInfoMessage("");
            return;
        }
        if (url.hostname !== "github.com") {
            setErrorMessage("Only github repository is supported");
            setInfoMessage("");
            return;
        }
        if (url.pathname.split("/").length <= 2) {
            setErrorMessage("Invalid repository URL");
            setInfoMessage("");
            return;
        } else if (url.pathname.split("/")[2] === "") {
            setErrorMessage("Invalid repository URL");
            setInfoMessage("");
            return;
        } else {
            try {
                const user = url.pathname.split("/")[1];
                const repo = url.pathname.split("/")[2];
                const data = await DatabaseManager.getOctokit().request(`/repos/${user}/${repo}`);
                if (data.status === 200) {
                    setRepositoryUser(user);
                    setRepositoryName(repo);
                    setInfoMessage("Repository exists");
                    setErrorMessage("");
                }
            } catch (exception) {
                console.log(exception);
                setErrorMessage("Repository not found");
                setInfoMessage("");
            }
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (infoMessage === "Repository exists") {
            await DatabaseManager.TeamManager.updateRepositoryURL(props.teamId, repositoryURL);
        }
        props.onClose();
    }

    useEffect(() => {
        if (repositoryURL !== "") {
            verifyReporitoryURL();
        }
    }, [repositoryURL])

    return (
        <>
            <Modal
                open={tokenUpdateModalOpen}
                onClose={handleTokenUpdateModalClose}>
                <GHTokenUpdateModal onClose={async () => {
                    await DatabaseManager.initializeOctokit(await DatabaseManager.UserManager.getGithubAccessToken(auth.currentUser.uid));
                    handleTokenUpdateModalClose();
                    verifyReporitoryURL();
                }} />
            </Modal>
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
                    <Typography>Repository not found? Try updating your github access token.</Typography>
                    <Button color='secondary' variant="outlined" onClick={handleTokenUpdateModalOpen}>
                        Update access token
                    </Button>
                    <br />
                    <br />
                    <Button type="submit" variant="outlined" disableElevation>Add</Button>
                </Box>
            </form>
        </>
    )
}