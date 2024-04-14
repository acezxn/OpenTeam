import { Box, Button, TextField, ThemeProvider, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Database from "../../../utils/database";
import { auth } from "../../../utils/firebase";
import { IconButton, Menu, MenuItem, Modal } from "@material-ui/core";
import { onSnapshot } from "firebase/firestore";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ConfirmationModal } from "../../modals/ConfirmationModal";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "max(70vw, 340px)",
    height: "80vh",
    backgroundColor: 'var(--background-color)',
    padding: 10,
    borderRadius: 4,
    overflow: "hidden",
    overflowY: "scroll",
    zIndex: 1,
};


export const DiscussionDetailsModal = (props) => {
    const [anchorElement, setAnchorElement] = useState(null);
    const [commentInputVisible, setCommentInputVisible] = useState(false);
    const [commentHistory, setCommentHistory] = useState([]);
    const [selectedCommentIndex, setSelectedCommentIndex] = useState(-1);
    const [comment, setComment] = useState("");
    const menuExpanded = Boolean(anchorElement);
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const handleDeleteConfirmModalOpen = () => setDeleteConfirmModalOpen(true);
    const handleDeleteConfirmModalClose = () => setDeleteConfirmModalOpen(false);
    const handleMenuClose = () => setAnchorElement(null);

    const handleSubmitComment = (e) => {
        e.preventDefault();
        setCommentInputVisible(false);
        const { uid, email, photoURL } = auth.currentUser;
        Database.TeamManager.DiscussionManager.createComment({
            uid: uid,
            email: email,
            photoURL: photoURL,
            teamId: props.data.teamId,
            discussionId: props.data.id,
            content: comment,
        });
        setComment("");
    }
    useEffect(() => {
        if (props) {
            const snapshot = Database.TeamManager.DiscussionManager.getComments(props.data.id);
            const unsubscribe = onSnapshot(snapshot, (querySnapshot) => {
                const comments = [];
                querySnapshot.forEach((doc) => {
                    comments.unshift({ ...doc.data(), id: doc.id });
                });
                const sortedComments = comments.sort(
                    (a, b) => {
                        if (a.createTime === null) return -1;
                        if (b.createTime === null) return 1;
                        return b.createTime - a.createTime;
                    }
                );
                setCommentHistory(sortedComments);
            });
            return () => unsubscribe;
        }
    }, [props]);

    const handleCommentDeletion = () => {
        Database.TeamManager.DiscussionManager.deleteComment(commentHistory[selectedCommentIndex].id);
        handleDeleteConfirmModalClose();
        handleMenuClose();
    }
    return (
        <>
            <Modal open={deleteConfirmModalOpen} onClose={handleDeleteConfirmModalClose}>
                <ConfirmationModal onAccept={handleCommentDeletion} onDecline={handleDeleteConfirmModalClose}/>
            </Modal>
            <Menu
                PaperProps={{
                    style: {
                        backgroundColor: "var(--board-color)",
                        color: "var(--foreground-color)"
                    }
                }}
                anchorEl={anchorElement}
                open={menuExpanded}
                onClose={handleMenuClose}>
                <MenuItem onClick={handleDeleteConfirmModalOpen} disableRipple>
                    Delete
                </MenuItem>
            </Menu>
            <Box style={modalStyle}>
                <br />
                <Typography variant="h5" align="center">{props.data.title}</Typography>
                <img className="profile_image" style={{ width: 40, verticalAlign: "top" }} src={props.data.photoURL}></img>
                <div style={{ paddingLeft: 10, display: "inline-block" }}>
                    <Typography>{props.data.email}</Typography>
                    <Typography variant="body2" style={{ color: "var(--placeholder-color)", fontStyle: "italic" }}>
                        {
                            props.data.createTime && (
                                new Date(props.data.createTime.seconds * 1000).toLocaleDateString(
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
                <Typography sx={{ wordBreak: "break-word" }}>
                    <pre style={{ fontFamily: 'inherit' }}>
                        {props.data.content}
                    </pre>
                </Typography>
                {
                    commentInputVisible ? (
                        <form onSubmit={handleSubmitComment}>
                            <TextField
                                inputProps={{ maxLength: 400 }}
                                rows={6}
                                placeholder="Enter comment"
                                value={comment}
                                onInput={(e) => { setComment(e.target.value) }}
                                fullWidth multiline required />
                            <br />
                            <br />
                            <Button type="submit" variant="outlined">Post</Button>
                            <div style={{ display: "inline-block", width: 10 }}></div>
                            <Button variant="outlined" color="warning" onClick={() => setCommentInputVisible(false)}>Cancel</Button>
                        </form>
                    ) : (
                        <Button variant="outlined" onClick={() => setCommentInputVisible(true)}>Add comment</Button>
                    )
                }
                <br />
                <br />
                {
                    commentHistory.length === 0 ? (
                        <Typography align="center" style={{ color: "var(--placeholder-color)", fontStyle: "italic" }}>No responses</Typography>
                    ) : (
                        <>
                            {
                                commentHistory.length === 1 ? (
                                    <Typography style={{ color: "var(--placeholder-color)", fontStyle: "italic" }}>1 Response</Typography>
                                ) : (
                                    <Typography style={{ color: "var(--placeholder-color)", fontStyle: "italic" }}>{`${commentHistory.length} Responses`}</Typography>
                                )
                            }
                            <br />
                            {
                                commentHistory.map((comment, index) => (
                                    <>
                                        <img
                                            src={comment.photoURL}
                                            className="profile_image"
                                            alt="profile_image"
                                            style={{ verticalAlign: "top" }} />
                                        <div style={{ paddingLeft: 10, display: "inline-block" }} key={index}>
                                            <Typography>{comment.email}</Typography>
                                            <Typography variant="body2" style={{ color: "var(--placeholder-color)", fontStyle: "italic" }}>
                                                {
                                                    comment.createTime && (
                                                        new Date(comment.createTime.seconds * 1000).toLocaleDateString(
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
                                        {
                                            (auth.currentUser.uid === comment.uid || auth.currentUser.uid === props.teamOwnerUid) && (
                                                <IconButton style={{ float: "right" }} color="inherit" onClick={(e) => {
                                                    setAnchorElement(e.target);
                                                    setSelectedCommentIndex(index);
                                                }}>
                                                    <MoreVertIcon color="inherit" />
                                                </IconButton>
                                            )
                                        }
                                        <Typography sx={{ paddingLeft: 6, paddingTop: 2, paddingBottom: 2, wordBreak: "break-word" }}>
                                            {comment.content}
                                        </Typography>
                                    </>
                                ))
                            }
                            <br />
                        </>
                    )
                }
            </Box>
        </>
    )
}