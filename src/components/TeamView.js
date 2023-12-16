import { Typography } from "@mui/material";
import ReactLoading from "react-loading";
import "../css/TeamView.css"
import { useEffect, useState } from "react";

export const TeamView = (props) => {
    const [loading, setLoading] = useState(true);
    const previewMode = props.previewMode;

    useEffect(() => {
        if (props.teamTitle) {
            setLoading(false);
        }
    }, [props]);

    return (
        <>
            {loading ? (
                <ReactLoading
                    type={"bars"}
                    color={"#ffffff"}
                    height={50}
                    width={100}
                />
            ) : (
                <>
                    <div className="banner">
                        <img
                            src="https://lh3.googleusercontent.com/a/ACg8ocLPxHSXGieHGPRCtziYc0vXyqw1rHF2T1JRCig4BKV3YGw=s96-c">
                        </img>
                    </div>
                    <div style={{ margin: 10 }}>
                        <div style={{ height: 100 }}></div>
                        <Typography variant="h2" className="team_title">{props.teamTitle}</Typography>
                        <div style={{ height: 30 }}></div>
                        <Typography variant="h6">About:</Typography>
                        <Typography>
                            {props.teamDescription === "" ?
                                <i style={{ color: "var(--placeholder-color)" }}>No description provided</i>
                                : props.teamDescription}
                        </Typography>
                    </div>
                </>
            )}


        </>
    )
}