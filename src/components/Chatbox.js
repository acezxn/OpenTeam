import { Button, IconButton, TextField, Typography } from "@mui/material"
import { useEffect, useRef, useState } from "react";
import { auth, db } from "../utils/firebase";
import "../css/Chatbox.css"
import Database from "../utils/database";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import SendIcon from '@mui/icons-material/Send';


export const Chatbox = (props) => {
    const [message, setMessage] = useState("");
    const [messageHistory, setMessageHistory] = useState([]);
    const messageBox = useRef();

    const sendMessage = async (event) => {
        event.preventDefault();
        if (message.trim() === "") {
            return;
        }
        const { uid, email, photoURL } = auth.currentUser;
        Database.TeamManager.MessageManager.createMessage({
            uid: uid,
            email: email,
            photoURL: photoURL,
            message: message,
            teamId: props.teamId
        });
        setMessage("");
    };

    useEffect(() => {
        if (props) {
            const snapshot = Database.TeamManager.MessageManager.getMessages(props.teamId);
            const unsubscribe = onSnapshot(snapshot, (querySnapshot) => {
                const messages = [];
                
                querySnapshot.forEach(async (messageDoc) => {
                    // const userDocData = (await getDoc(doc(db, "public_user_data", messageDoc.data().uid))).data();
                    messages.push({ ...messageDoc.data(), id: messageDoc.id });
                });
                const sortedMessages = messages.sort(
                    (a, b) => a.createTime - b.createTime
                );
                setMessageHistory(sortedMessages);
                if (messageBox.current) {
                    messageBox.current.scrollTop = messageBox.current.scrollHeight;
                }
            });
            return () => unsubscribe;
        }
    }, [props]);

    useEffect(() => {
        if (messageBox.current) {
            messageBox.current.scrollTop = messageBox.current.scrollHeight;
        }
    }, [messageBox.current]);
    return (
        <div className="chatbox">
            <div className="messages" ref={messageBox}>
                {messageHistory.map((message, index) => (
                    <>
                        {
                            message &&
                            (
                                <div key={index} className="message">
                                    <img
                                        src={message.photoURL}
                                        className="profile_image"
                                        alt="profile_image"
                                        style={{ verticalAlign: "top" }} />
                                    <div className="message_body">
                                        <div className="message_sender">
                                            <Typography sx={{ fontWeight: 600 }}>{message.email}</Typography>
                                        </div>
                                        <div className="message_create_time">
                                            <Typography sx={{ color: "var(--placeholder-color)", fontStyle: 'italic' }}>
                                                {
                                                    message.createTime && (
                                                        new Date(message.createTime.seconds * 1000).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                year: 'numeric',
                                                                month: '2-digit',
                                                                day: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            }
                                                        )
                                                    )
                                                }
                                            </Typography>
                                        </div>
                                        <div className="message_content">
                                            <Typography sx={{ wordBreak: "break-word" }}>{message.message}</Typography>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </>
                ))}
            </div>
            <form
                className="message_form"
                style={{ display: "flex", alignItems: "center" }}
                onSubmit={(event) => sendMessage(event)}>
                <TextField
                    style={{ width: "calc(100% - 50px)" }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    size="small"
                    placeholder="Type message here" />
                <IconButton type="submit" size="medium">
                    <SendIcon />
                </IconButton>
            </form>
        </div>
    )
}