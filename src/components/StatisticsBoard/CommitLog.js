import { IconButton, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import RefreshIcon from '@mui/icons-material/Refresh';
import RingLoader from "react-spinners/RingLoader";
import DatabaseManager from "../../utils/databaseManager";

export const CommitLog = (props) => {
    const [loading, setLoading] = useState(false);
    const [commits, setCommits] = useState([]);
    const defaultPhotoURL = "https://github.githubassets.com/images/gravatars/gravatar-user-420.png?size=32";
    const getCommits = async () => {
        setLoading(true);
        const result = await DatabaseManager.getOctokit().request(
            `/repos/${props.repositoryUser}/${props.repositoryName}/commits`
        );
        setCommits(result.data);
        setLoading(false);
    }

    useEffect(() => {
        if (props.repositoryName && props.repositoryUser) {
            getCommits();
        }
    }, [props]);

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
                            left: "calc((50vw - 20px) / 2 + 50vw - 50px)"
                        }}
                        size={100}
                    />
                ) : (
                    <>
                        <IconButton style={{ float: "right" }} onClick={getCommits}><RefreshIcon /></IconButton>
                        <Typography style={{ margin: 10 }} variant="h6">Commit log</Typography>
                        {
                            commits.map((commitItem) => (
                                <div style={{ margin: 10 }}>
                                    <img
                                        className="profile_image"
                                        src={commitItem.author === null ? defaultPhotoURL : commitItem.author.avatar_url}
                                        style={{ display: "inline-block" }}></img>
                                    <Typography sx={{ fontWeight: 600, display: "inline-block", padding: 1 }}>{commitItem.commit.author.name}</Typography>
                                    <Typography sx={{ display: "inline-block", float: "right", padding: 1 }}>{commitItem.commit.author.date}</Typography>

                                    <Typography>{commitItem.commit.message}</Typography>
                                </div>
                            ))
                        }
                        {
                            commits.length === 0 ? (
                                <Typography align="center">No commits available</Typography>
                            ) : (
                                <Typography align="center">
                                    <a
                                        href={`https://github.com/${props.repositoryUser}/${props.repositoryName}/commits/main`}
                                        style={{ color: "white", textDecoration: 'none' }}>
                                        View more commits
                                    </a>
                                </Typography>
                            )
                        }
                    </>
                )
            }
        </div >
    )
}