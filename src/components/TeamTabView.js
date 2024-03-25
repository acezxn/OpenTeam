
import { Box, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { TaskBoard } from './TaskBoard';
import { Chatbox } from './Chatbox';
import { auth } from '../utils/firebase';
import { TeamView } from './TeamView';

export const TeamTabView = (props) => {
    const [selectedTab, setSelectedTab] = useState(0);

    const TabPanel = (props) => {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                {...other}
            >
                {value === index && (
                    <Box>
                        {children}
                    </Box>
                )}
            </div>
        );
    }

    const handleChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    return (
        <Box>
            {
                auth.currentUser !== null && (((props.participants && props.participants.includes(auth.currentUser.uid)) ||
                    (props.data && auth.currentUser.uid === props.data.ownerUID))) ? (
                        <Tabs value={selectedTab} onChange={handleChange}>
                            <Tab label="Home" />
                            <Tab label="Tasks" />
                            <Tab label="Chat" />
                        </Tabs> 
                    ) : (
                        <Tabs value={selectedTab} onChange={handleChange}>
                            <Tab label="Home" />
                        </Tabs> 
                    )
            }
            <TabPanel value={selectedTab} index={0}>
                <TeamView
                    teamId={props.teamId}
                    participants={props.participants}
                    data={props.data} />
            </TabPanel>
            <TabPanel value={selectedTab} index={1}>
                <TaskBoard teamId={props.teamId} />
            </TabPanel>
            <TabPanel value={selectedTab} index={2}>
                <Chatbox teamId={props.teamId} />
            </TabPanel>
        </Box>
    )
}