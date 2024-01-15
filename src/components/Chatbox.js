import { Button, TextField, Typography } from "@mui/material"
import { useEffect, useRef, useState } from "react";
import { auth } from "../utils/firebase";
import "../css/Chatbox.css"
import Database from "../utils/database";
import { onSnapshot } from "firebase/firestore";


export const Chatbox = (props) => {
    const [message, setMessage] = useState("");
    const [messageHistory, setMessageHistory] = useState([]);
    const inputScroll = useRef();
    const messageScroll = useRef();
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
        messageScroll.current.scrollIntoView({ behavior: "smooth" });
        inputScroll.current.scrollIntoView({ behavior: "smooth" });
        console.log(messageScroll.current.offsetTop);
    };

    useEffect(() => {
        if (props) {
            const snapshot = Database.TeamManager.MessageManager.getMessages(props.teamId);
            const unsubscribe = onSnapshot(snapshot, (querySnapshot) => {
                const messages = [];
                querySnapshot.forEach((doc) => {
                    messages.push({ ...doc.data(), id: doc.id });
                });
                const sortedMessages = messages.sort(
                    (a, b) => a.createTime - b.createTime
                );
                setMessageHistory(sortedMessages);
            });
            messageScroll.current.scrollIntoView({ behavior: "smooth" });
            return () => unsubscribe;
        }
    }, [props]);

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
                <span ref={messageScroll}></span>
            </div>
            <form
                className="message_form"
                style={{ display: "flex", alignItems: "center" }}
                onSubmit={(event) => sendMessage(event)}
                ref={inputScroll}>
                <TextField
                    style={{ width: "calc(100% - 80px)" }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type message here" />
                <Button type="submit">Send</Button>
            </form>
        </div>
    )
}