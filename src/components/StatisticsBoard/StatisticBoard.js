import { Button, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import Database from "../../utils/database"
import { AddRepositoryModal } from "./modals/AddRepositoryModal";
import { Modal } from "@material-ui/core";
import RingLoader from "react-spinners/RingLoader";
import Chart from 'chart.js/auto';
import 'chartjs-adapter-moment';
import "../../css/StatisticBoard.css"

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
        const protectedTeamData = (await Database.TeamManager.getProtectedTeamData(props.teamId)).data();
        setRepositoryURL(protectedTeamData.repositoryURL);

        // expecting html URL
        if (protectedTeamData.repositoryURL !== "") {
            const url = new URL(protectedTeamData.repositoryURL);
            setRepositoryUser(url.pathname.split("/")[1]);
            setRepositoryName(url.pathname.split("/")[2]);
        }
    }

    const getRepositoryData = async () => {
        if (repositoryUser !== "" && repositoryName !== "") {
            while (true) {
                const result = await Database.getOctokit().request(`/repos/${repositoryUser}/${repositoryName}/stats/contributors`);
                if (Array.isArray(result.data)) {
                    setContributorData(result.data);
                    setLoading(false);
                    break;
                }
            }
        }
    }

    useEffect(() => {
        setLoading(true);
        getProtectedTeamData();
    }, [props]);

    useEffect(() => {
        getRepositoryData();
    }, [repositoryName, repositoryUser]);

    useEffect(() => {
        if (contributorData.length !== 0) {
            var charts = [];
            for (let chart of contribCharts) {
                chart.destroy();
            }
            for (let data of contributorData) {
                var additionData = data.weeks.map((week) => (
                    {
                        x: new Date(week.w * 1000),
                        y: week.a
                    }
                ));
                var deletionData = data.weeks.map((week) => (
                    {
                        x: new Date(week.w * 1000),
                        y: week.d
                    }
                ));
                var commitData = data.weeks.map((week) => (
                    {
                        x: new Date(week.w * 1000),
                        y: week.c
                    }
                ));
                const ctx = document.getElementById(`contrib_${data.author.id}`).getContext('2d');
                charts.push(new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [
                            {
                                data: additionData,
                                label: "Additions",
                                borderColor: "#aadd55",
                                fill: false
                            },
                            {
                                data: deletionData,
                                label: "Deletions",
                                borderColor: "#ff5555",
                                fill: false
                            },
                            {
                                data: commitData,
                                label: "Commits",
                                borderColor: "#00cc00",
                                fill: false
                            }
                        ]
                    },
                    options: {
                        scales: {
                            x: {
                                type: "time"
                            }
                        },
                    }
                }));
            }
            setContribCharts(charts);
        }
    }, [contributorData]);
    return (
        <div style={{ marginLeft: 10, marginRight: 10 }}>
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
                                <>
                                    <Typography>Repository not specified</Typography>
                                    <Button variant="outlined" onClick={handleAddRepositoryModalOpen}>Add repository</Button>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h5" align="center">{repositoryUser}/{repositoryName}</Typography>
                                    <Typography variant="h6">Contributors</Typography>
                                    <div className="contributor_board">
                                        {
                                            contributorData.map((data, index) => (
                                                <div className="contributor_card">
                                                    <Typography>{data.author.login}</Typography>
                                                    <div class="contributor_chart">
                                                        <canvas id={`contrib_${data.author.id}`}></canvas>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </>
                            )
                        }
                    </>
                )
            }
        </div>
    )
}