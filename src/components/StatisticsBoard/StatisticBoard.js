import { Button, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import Database from "../../utils/database"
import { AddRepositoryModal } from "./modals/AddRepositoryModal";
import { Modal } from "@material-ui/core";

export const StatisticBoard = (props) => {
    const [repositoryURL, setRepositoryURL] = useState("");
    const [repositoryUser, setRepositoryUser] = useState("");
    const [repositoryName, setRepositoryName] = useState("");

    const [addRepositoryModalOpen, setAddRepositoryModalOpen] = useState(false);
    const handleAddRepositoryModalOpen = () => setAddRepositoryModalOpen(true);
    const handleAddRepositoryModalClose = () => setAddRepositoryModalOpen(false);

    const getProtectedTeamData = async () => {
        const protectedTeamData = (await Database.TeamManager.getProtectedTeamData(props.teamId)).data();
        setRepositoryURL(protectedTeamData.repositoryURL);

        // expecting html URL
        if (protectedTeamData.repositoryURL !== "") {
            const url = new URL(protectedTeamData.repositoryURL);
            setRepositoryUser(url.pathname.split("/")[1]);
            setRepositoryName(url.pathname.split("/")[2]);
        }
    }

    useEffect(() => {
        getProtectedTeamData();
    }, [props])
    return (
        <div style={{ marginLeft: 10, marginRight: 10 }}>
            <Modal
                open={addRepositoryModalOpen}
                onClose={handleAddRepositoryModalClose}>
                <AddRepositoryModal teamId={props.teamId} onClose={() => {
                    handleAddRepositoryModalClose();
                    getProtectedTeamData();
                }}/>
            </Modal>
            {
                repositoryURL === "" ? (
                    <>
                        <Typography>Repository not specified</Typography>
                        <Button variant="outlined" onClick={handleAddRepositoryModalOpen}>Add repository</Button>
                    </>
                ) : (
                    <Typography variant="h6">Statistics of repository {repositoryUser}/{repositoryName}</Typography>
                )
            }
        </div>
    )
}