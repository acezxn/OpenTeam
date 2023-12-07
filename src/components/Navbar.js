import React, { useState } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import Button from "@material-ui/core/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import { auth } from "../utils/firebase";

import {
    List,
    ListItem,
    ListItemText,
    Collapse,
    Menu,
    MenuItem,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

export default function Navbar() {
    const navigate = useNavigate();
    const small = useMediaQuery("(max-width:600px)");
    const full = useMediaQuery("(min-width:600px)");

    const [expanded, setExpanded] = useState(false);
    const [anchorElement, setAnchorElement] = useState(null);
    const userMenuExpanded = Boolean(anchorElement);
    const handleUserMenuClick = (event) => {
        setAnchorElement(event.currentTarget);
    };
    const handleUserMenuClose = () => {
        setAnchorElement(null);
    };

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleSignOut = () => {
        handleUserMenuClose();
        signOut(auth).then(() => {
            navigate("/");
        }).catch((error) => {
        });
    }

    let user = auth.currentUser;

    return (
        <>
            {user && <>
                <Menu
                    anchorEl={anchorElement}
                    open={userMenuExpanded}
                    onClose={handleUserMenuClose}
                >
                    <MenuItem onClick={() => {navigate("/teams")}} disableRipple>
                        Your teams
                    </MenuItem>
                    <MenuItem onClick={handleSignOut} disableRipple>
                        Sign out
                    </MenuItem>
                </Menu>
            </>}
            <AppBar position="static" elevation={0} style={{ backgroundColor: "#204538" }}>
                <Toolbar variant="dense">
                    {small && (
                        <>
                            <List>
                                <ListItem>
                                    <Button
                                        onClick={
                                            handleExpandClick
                                        }
                                    >
                                        <MenuIcon />
                                        {expanded ? (
                                            <ExpandLess />
                                        ) : (
                                            <ExpandMore />
                                        )}
                                    </Button>
                                    <Typography
                                        variant="h6"
                                        color="inherit"
                                        onClick={() => {
                                            setExpanded(false);
                                        }}
                                    >
                                        OpenTeam
                                    </Typography>
                                </ListItem>
                                <Collapse
                                    in={expanded}
                                    timeout="auto"
                                    unmountOnExit
                                >
                                    <List
                                        component="div"
                                        disablePadding
                                    >
                                        <ListItem>
                                            <ListItemText primary="Home" onClick={() => { navigate("/") }} />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText primary="About" onClick={() => { navigate("/about") }} />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText primary="Login" onClick={() => { navigate("/login") }} />
                                        </ListItem>
                                        {user && <>
                                            <ListItem color="inherit" onClick={handleUserMenuClick}>
                                                {user && user.email}
                                            </ListItem>
                                        </>}
                                    </List>
                                </Collapse>
                            </List>
                        </>
                    )}

                    {full && (
                        <>
                            <Typography
                                variant="h6"
                                color="inherit"
                            >
                                OpenTeam
                            </Typography>
                            <Button color="inherit" onClick={() => { navigate("/") }}>
                                Home
                            </Button>
                            <Button color="inherit" onClick={() => { navigate("/about") }}>
                                About
                            </Button>
                            <Button color="inherit" onClick={() => { navigate("/login") }}>
                                Login
                            </Button>
                            {user && <>
                                <Button color="inherit" onClick={handleUserMenuClick}>
                                    {user && user.email}
                                </Button>
                            </>}
                        </>
                    )}
                </Toolbar>
            </AppBar>
        </>
    );
}