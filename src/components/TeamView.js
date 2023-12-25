import { Typography } from "@mui/material";
import ReactLoading from "react-loading";
import { auth, db } from "../utils/firebase";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import "../css/TeamView.css"

export const TeamView = (props) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [participantData, setParticipantData] = useState([]);
    const previewMode = props.previewMode;

    const getParticipants = () => {
        props.data.participants.map((participantUID) => {
            getDoc(doc(db, "user_data", participantUID))
            .then((snapshot) => {
                setParticipantData([...participantData, snapshot.data()]);
            })
        });
        console.log(participantData);
    }

    useEffect(() => {
        if (props.data) {
            setData(props.data);
            getParticipants();
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
                        <Typography variant="h2" className="team_title">{data.title}</Typography>
                        <div style={{ height: 30 }}></div>
                        <Typography variant="h6">About:</Typography>
                        <Typography>
                            {data.description === "" ?
                                <i style={{ color: "var(--placeholder-color)" }}>No description provided</i>
                                : data.description}
                        </Typography>
                        {data.links.map((link, key) => (
                            <>
                                <a
                                    href={link}
                                    key={key}
                                    style={{ color: "var(--placeholder-color)", textDecoration: "none" }}>
                                    {link}
                                </a>
                                <br />
                            </>
                        ))}
                        <Typography variant="h6">Participants:</Typography>

                        {participantData.map((items, key) => (
                            <img className="profile_image" src={items.photoURL}></img>
                        ))}
                    </div>
                </>
            )}


        </>
    )
}