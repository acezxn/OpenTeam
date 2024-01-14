
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { TaskBoard } from './TaskBoard';
import { Chatbox } from './Chatbox';

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
        <Box p={2}>
            <Tabs value={selectedTab} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Tasks" />
                <Tab label="Chat" />
            </Tabs>
            <TabPanel value={selectedTab} index={0}>
                <TaskBoard teamId={props.teamId} />
            </TabPanel>
            <TabPanel value={selectedTab} index={1}>
                <Chatbox teamId={props.teamId} />
            </TabPanel>
        </Box>
    )
}