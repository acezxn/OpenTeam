import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import './css/App.css';
import Login from './pages/Login';
import React, { useEffect, useState } from 'react';
import { auth } from './utils/firebase';
import Teams from './pages/Teams';
import Protected from './components/Protected';
import { TeamsPage } from './pages/TeamsPage';
import Explore from './pages/Explore';
import { SearchPage } from './pages/SearchPage';
import Database from './utils/database';
import { v4 as uuidv4 } from 'uuid';


const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: 'rgb(109, 255, 211)',
        },
    },
});

export default function App() {
    const [user, setUser] = useState(null);
    async function uploadFilesFromLocalStorage() {
        const messageFilesPendingUpload = JSON.parse(localStorage.getItem("messageFilesPendingUpload"));

        if (messageFilesPendingUpload) {
            for (let id of Object.keys(messageFilesPendingUpload)) {
                for (let index = 0; index < messageFilesPendingUpload[id].length; index++) {
                    const fileData = messageFilesPendingUpload[id][index];
                    const { url, name, type, teamId } = fileData;
                    const response = await fetch(url);
                    const data = await response.blob();
                    let metadata = {
                        type: type
                    };
                    let file = new File([data], name, metadata);
                    let uploadedUrl = await Database.uploadFile(file, `teams/${teamId}/protected/attachments/${uuidv4()}-${name}`);
                    await Database.TeamManager.MessageManager.addMessageAttachments(id, uploadedUrl, name, type);
                    messageFilesPendingUpload[id].splice(index, 1);
                    localStorage.setItem("messageFilesPendingUpload", JSON.stringify(messageFilesPendingUpload));
                    index--;
                }
            }
        }
        localStorage.removeItem("messageFilesPendingUpload");
    }

    async function removeFilesFromLocalStorage() {
        const messageFilesPendingRemoval = JSON.parse(localStorage.getItem("messageFilesPendingRemoval"));
        if (messageFilesPendingRemoval) {
            for (let id of Object.keys(messageFilesPendingRemoval)) {
                for (let url of messageFilesPendingRemoval[id]) {
                    await Database.removeFile(url);
                }
            }
        }
        localStorage.removeItem("messageFilesPendingRemoval");
    }

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            setUser({ user: user });
        });
    }, []);

    useEffect(() => {
        if (auth.currentUser) {
            uploadFilesFromLocalStorage();
            removeFilesFromLocalStorage();
            window.addEventListener("uploadFromStorage", uploadFilesFromLocalStorage);
            window.addEventListener("removeFromStorage", removeFilesFromLocalStorage);
        }
    }, [auth.currentUser]);

    return (
        <ThemeProvider theme={darkTheme}>
            <Routes>
                <Route exact path="/" element={<Home />} />
                <Route path="explore" element={<Explore />} />
                <Route path="search/:teamName" element={
                    <SearchPage />
                } />
                {/* <Route path="about" element={<About />} /> */}
                <Route path="login" element={<Login />} />
                <Route path="teams" element={
                    <Protected isLoggedIn={user}>
                        <Teams />
                    </Protected>
                } />
                <Route path="teams-page/:teamId" element={
                    <TeamsPage />
                } />
                {/* <Route path="editor/:graphId" element={
            <Protected isLoggedIn={user}>
              <Editor />
            </Protected>
          } /> */}
                <Route path="*" element={<NoPage />} />
            </Routes>
        </ThemeProvider>
    );
}