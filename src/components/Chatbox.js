import { Button, IconButton, Menu, MenuItem, TextField, Typography } from "@mui/material"
import { useEffect, useRef, useState } from "react";
import { auth } from "../utils/firebase";
import "../css/Chatbox.css"
import Database from "../utils/database";
import { onSnapshot } from "firebase/firestore";
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';


export const Chatbox = (props) => {
    const [message, setMessage] = useState("");
    const [selectedMessageIndex, setSelectedMessageIndex] = useState(0);
    const [messageHistory, setMessageHistory] = useState([]);
    const [anchorElement, setAnchorElement] = useState(null);
    const userMenuExpanded = Boolean(anchorElement);

    const handleUserMenuClose = () => setAnchorElement(null);
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
    const selectMessage = (index, event) => {
        setSelectedMessageIndex(index);
        setAnchorElement(event.target);
    }
    const handleMessageDeletion = () => {
        handleUserMenuClose();
        console.log(selectedMessageIndex, messageHistory[selectedMessageIndex].id);
        Database.TeamManager.MessageManager.deleteMessage(messageHistory[selectedMessageIndex].id);
    }

    useEffect(() => {
        if (props) {
            const snapshot = Database.TeamManager.MessageManager.getMessages(props.teamId);
            const unsubscribe = onSnapshot(snapshot, (querySnapshot) => {
                const messages = [];
                querySnapshot.forEach((doc) => {
                    messages.unshift({ ...doc.data(), id: doc.id });
                });
                const sortedMessages = messages.sort(
                    (a, b) => {
                        if (a.createTime === null) return 1;
                        if (b.createTime === null) return -1;
                        return a.createTime - b.createTime;
                    }
                );
                console.log(sortedMessages);
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
                                                {
                                                    (auth.currentUser.uid === message.uid || auth.currentUser.uid === props.data.ownerUID) && (

                                                        <IconButton style={{ marginLeft: 10 }} onClick={(e) => { selectMessage(index, e) }}>
                                                            <MoreVertIcon />
                                                        </IconButton>

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
            <Menu
                anchorEl={anchorElement}
                open={userMenuExpanded}
                onClose={handleUserMenuClose}
            >
                <MenuItem onClick={handleMessageDeletion} disableRipple>
                    Delete message
                </MenuItem>
            </Menu>
        </div>
    )
}