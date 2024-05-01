import { useEffect, useState } from "react"
import Chart from 'chart.js/auto';
import 'chartjs-adapter-moment';
import "../../css/StatisticBoard.css"
import { IconButton, Typography } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import RingLoader from "react-spinners/RingLoader";
import Database from "../../utils/database";


export const StatisticChart = (props) => {
    const [loading, setLoading] = useState(false);
    const [contributorData, setContributorData] = useState([]);
    const [contribCharts, setContribCharts] = useState([]);

    const getRepositoryData = async () => {
        setLoading(true);
        if (props.repositoryUser !== "" && props.repositoryName !== "") {
            while (true) {
                const result = await Database.getOctokit().request(`/repos/${props.repositoryUser}/${props.repositoryName}/stats/contributors`);
                if (Array.isArray(result.data)) {
                    setContributorData(result.data);
                    break;
                }
            }
        }
        setLoading(false);
    }

    const updateCharts = () => {
        if (contributorData.length !== 0) {
            Chart.defaults.borderColor = "rgba(255, 255, 255, 0.2)";
            Chart.defaults.color = "rgba(255, 255, 255, 0.7)";
            var charts = [];
            var additionSum = {};
            var deletionSum = {};
            var commitSum = {}
            for (let chart of contribCharts) {
                chart.destroy();
            }
            for (let data of contributorData) {
                var additionData = data.weeks.map((week) => {
                    const date = new Date(week.w * 1000);
                    if (!(date in additionSum)) {
                        additionSum[date] = { x: date, y: week.a };
                    } else {
                        let additions = additionSum[date].y;
                        additionSum[date] = { x: date, y: additions + week.a };
                    }
                    return (
                        {
                            x: date,
                            y: week.a
                        }
                    )
                });
                var deletionData = data.weeks.map((week) => {
                    const date = new Date(week.w * 1000);
                    if (!(date in deletionSum)) {
                        deletionSum[date] = { x: date, y: week.d };
                    } else {
                        let deletions = deletionSum[date].y;
                        deletionSum[date] = { x: date, y: deletions + week.d };
                    }
                    return (
                        {
                            x: date,
                            y: week.d
                        }
                    )
                });
                var commitData = data.weeks.map((week) => {
                    const date = new Date(week.w * 1000);
                    if (!(date in commitSum)) {
                        commitSum[date] = { x: date, y: week.c };
                    } else {
                        let commits = commitSum[date].y;
                        commitSum[date] = { x: date, y: commits + week.c };
                    }
                    return (
                        {
                            x: date,
                            y: week.c
                        }
                    )
                });
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
                        animation: {
                            duration: 500,
                            easing: 'easeOutExpo'
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                type: "time"
                            }
                        },
                    }
                }));
            }
            const ctx = document.getElementById(`contrib_total`).getContext('2d');
            charts.push(new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            data: Object.values(additionSum),
                            label: "Additions",
                            borderColor: "#aadd55",
                            fill: false
                        },
                        {
                            data: Object.values(deletionSum),
                            label: "Deletions",
                            borderColor: "#ff5555",
                            fill: false
                        },
                        {
                            data: Object.values(commitSum),
                            label: "Commits",
                            borderColor: "#00cc00",
                            fill: false
                        }
                    ]
                },
                options: {
                    animation: {
                        duration: 500,
                        easing: 'easeOutExpo'
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: "time"
                        }
                    },
                }
            }));
            setContribCharts(charts);
        }
    }

    useEffect(() => {
        if (props.repositoryName && props.repositoryUser) {
            getRepositoryData();
        }
    }, [props]);

    useEffect(() => {
        updateCharts();
    }, [contributorData]);

    return (
        <div className="contributor_board">
            {
                loading ? (
                    <RingLoader
                        color={"rgb(109, 255, 211)"}
                        loading={loading}
                        cssOverride={{
                            position: "absolute",
                            top: "calc((100vh - 20px) / 2)",
                            left: "calc((50vw - 20px) / 2 - 50px)"
                        }}
                        size={100}
                    />
                ) : (
                    <>
                        <IconButton style={{ float: "right" }} onClick={getRepositoryData}><RefreshIcon /></IconButton>
                        <div style={{ margin: 10 }}>
                            <Typography variant="h6"><a style={{ color: "white", textDecoration: 'none' }} href={props.repositoryURL}>The repository</a></Typography>
                            <div class="contributor_chart">
                                <canvas id={`contrib_total`}></canvas>
                            </div>
                        </div>
                        <Typography style={{ marginLeft: 10 }} variant="h6">Contributors</Typography>
                        {
                            contributorData.map((data, index) => (
                                <div className="contributor_card">
                                    <Typography style={{ padding: 10 }}>
                                        <a
                                            style={{ color: "white", textDecoration: 'none' }}
                                            href={data.author.html_url}>
                                            {data.author.login}
                                        </a>
                                    </Typography>
                                    <div class="contributor_chart">
                                        <canvas id={`contrib_${data.author.id}`}></canvas>
                                    </div>
                                </div>
                            ))
                        }
                    </>
                )
            }
        </div>
    )
}