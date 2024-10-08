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
import Database from './utils/clientSideDB';
import { v4 as uuidv4 } from 'uuid';


const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: 'rgb(109, 255, 150)',
        },
    },
});

darkTheme.typography.h2 = {
    fontSize: '2.5rem',
    '@media (min-width:600px)': {
        fontSize: '3rem',
    },
};

darkTheme.typography.h3 = {
    fontSize: '1.7rem',
    '@media (min-width:600px)': {
        fontSize: '2.4rem',
    },
};

darkTheme.typography.h4 = {
    fontSize: '1.5rem',
    '@media (min-width:600px)': {
        fontSize: '2.2rem',
    },
};

export default function App() {
    const [user, setUser] = useState(null);

    async function uploadFile(file, name, type, teamId, messageId) {
        let uploadedUrl = await Database.uploadFile(file, `teams/${teamId}/protected/attachments/${uuidv4()}-${name}`);

        await Database.TeamManager.MessageManager.addMessageAttachments(messageId, uploadedUrl, name, type);
    }

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            setUser({ user: user });
        });
    }, []);

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