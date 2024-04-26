import { Button, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import Database from "../../utils/database"
import { AddRepositoryModal } from "./modals/AddRepositoryModal";
import { Modal } from "@material-ui/core";
import Chart from 'chart.js/auto';
import 'chartjs-adapter-moment';
import "../../css/StatisticBoard.css"

export const StatisticBoard = (props) => {
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

    useEffect(() => {
        getProtectedTeamData();
    }, [props]);

    useEffect(() => {
        if (repositoryUser !== "" && repositoryName !== "") {
            Database.getOctokit().request(`/repos/${repositoryUser}/${repositoryName}/stats/contributors`)
                .then((result) => {
                    setContributorData(result.data);
                });
        }
    }, [repositoryName, repositoryUser]);

    const csvToChartData = csv => {
        const lines = csv.trim().split('\n');
        lines.shift(); // remove titles (first line)
        return lines.map(line => {
            const [date, temperature] = line.split(',');
            return {
                x: date,
                y: temperature
            }
        });
    };

    useEffect(() => {
        if (contributorData.length !== 0) {
            var charts = [];
            for (let chart of contribCharts) {
                chart.destroy();
            }
            for (let data of contributorData) {
                const csv = `Time,Temperature
                2020-02-15 18:37:39,-8.25
                2020-02-15 19:07:39,-8.08
                2020-02-15 19:37:39,-8.41
                2020-02-15 20:40:39,-8.2`;
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
        </div>
    )
}