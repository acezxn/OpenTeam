import { Button, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import ClientSideDB from "../../utils/clientSideDB"
import { AddRepositoryModal } from "./modals/AddRepositoryModal";
import { Modal } from "@material-ui/core";
import RingLoader from "react-spinners/RingLoader";
import { StatisticChart } from "./StatisticCharts";
import { CommitLog } from "./CommitLog";
import "../../css/StatisticBoard.css"
import 'chartjs-adapter-moment';
import DatabaseManager from "../../utils/databaseManager";
import { auth } from "../../utils/firebase";

export const StatisticBoard = (props) => {
    const [loading, setLoading] = useState(false);
    const [repositoryURL, setRepositoryURL] = useState("");
    const [repositoryUser, setRepositoryUser] = useState("");
    const [repositoryName, setRepositoryName] = useState("");

    const [contributorData, setContributorData] = useState([]);
    const [contribCharts, setContribCharts] = useState([]);

    const [addRepositoryModalOpen, setAddRepositoryModalOpen] = useState(false);
    const handleAddRepositoryModalOpen = () => setAddRepositoryModalOpen(true);
    const handleAddRepositoryModalClose = () => setAddRepositoryModalOpen(false);

    const getProtectedTeamData = async () => {
        setLoading(true);
        const protectedTeamData = (await ClientSideDB.TeamManager.getProtectedTeamData(props.teamId)).data();
        setRepositoryURL(protectedTeamData.repositoryURL);

        // expecting html URL
        if (protectedTeamData.repositoryURL !== "") {
            const url = new URL(protectedTeamData.repositoryURL);
            setRepositoryUser(url.pathname.split("/")[1]);
            setRepositoryName(url.pathname.split("/")[2]);
        }
        setLoading(false);
    }
    const initializeOctokit = async () => {
        await DatabaseManager.initializeOctokit(await DatabaseManager.UserManager.getGithubAccessToken(auth.currentUser.uid));
    }

    const refresh = async () => {
        await initializeOctokit();
        await getProtectedTeamData();
    }

    useEffect(() => {
        refresh();
    }, [props]);

    return (
        <>
            {
                loading ? (
                    <RingLoader
                        color={"rgb(109, 255, 211)"}
                        loading={loading}
                        cssOverride={{
                            position: "absolute",
                            top: "calc(50vh - 50px)",
                            left: "calc(50vw - 50px)"
                        }}
                        size={100}
                    />
                ) : (
                    <>
                        <Modal
                            open={addRepositoryModalOpen}
                            onClose={handleAddRepositoryModalClose}>
                            <AddRepositoryModal teamId={props.teamId} onClose={() => {
                                handleAddRepositoryModalClose();
                                getProtectedTeamData();
                            }} />
                        </Modal>
                        {
                            repositoryURL === "" ? (
                                <div style={{ margin: 10 }}>
                                    <Typography>Repository not specified</Typography>
                                    <Button variant="outlined" onClick={handleAddRepositoryModalOpen}>Add repository</Button>
                                </div>
                            ) : (
                                <>
                                    <div style={{ textAlign: "center" }}>
                                        <Typography variant="h5" style={{ display: "inline-block", verticalAlign: "middle" }}>
                                            {repositoryUser}/{repositoryName}
                                        </Typography>
                                        <Button
                                            sx={{ marginLeft: 1, verticalAlign: "middle" }}
                                            onClick={handleAddRepositoryModalOpen}>Change</Button>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: 10, padding: 10 }}>
                                        <StatisticChart
                                            repositoryName={repositoryName}
                                            repositoryUser={repositoryUser} />
                                        <CommitLog
                                            repositoryName={repositoryName}
                                            repositoryUser={repositoryUser} />
                                    </div>
                                </>
                            )
                        }
                    </>
                )
            }
        </>
    )
}