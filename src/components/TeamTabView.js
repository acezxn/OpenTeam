
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { TaskBoard } from './Taskboard/TaskBoard';
import { Chatbox } from './Chatbox/Chatbox';
import { auth } from '../utils/firebase';
import { TeamView } from './TeamView/TeamView';
import { DiscussionBoard } from './DiscussionBoard/DiscussionBoard';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ForumIcon from '@mui/icons-material/Forum';
import BarChartIcon from '@mui/icons-material/BarChart';
import { StatisticBoard } from './StatisticsBoard/StatisticBoard';

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
                            <Tab style={{ minWidth: 60 }} icon={<HomeIcon />} />
                            <Tab style={{ minWidth: 60 }} icon={<DashboardIcon />} />
                            <Tab style={{ minWidth: 60 }} icon={<ChatBubbleIcon />} />
                            <Tab style={{ minWidth: 60 }} icon={<ForumIcon />} />
                            <Tab style={{ minWidth: 60 }} icon={<BarChartIcon />} />
                        </Tabs> 
                    ) : (
                        <Tabs value={selectedTab} onChange={handleChange}>
                            <Tab style={{ minWidth: 60 }} icon={<HomeIcon />} />
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
                <Chatbox teamId={props.teamId} data={props.data} />
            </TabPanel>
            <TabPanel value={selectedTab} index={3}>
                <DiscussionBoard teamId={props.teamId} data={props.data} />
            </TabPanel>
            <TabPanel value={selectedTab} index={4}>
                <StatisticBoard teamId={props.teamId} data={props.data} />
            </TabPanel>
        </Box>
    )
}