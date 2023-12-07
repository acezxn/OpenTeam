import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from './pages/Home';
import About from './pages/About';
import NoPage from './pages/NoPage';
import './css/App.css';
import Login from './pages/Login';
import React from 'react';
import PropTypes from 'prop-types';
import { auth } from './utils/firebase';
import Teams from './pages/Teams';
import Protected from './components/Protected';
import { TeamsPage } from './pages/TeamsPage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default class App extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = { user: null };
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      this.setState({ user });
    });
  }

  // isAuthorized(protectedRoute, user) {
  //   return Boolean(user) || !protectedRoute;
  // }

  // componentWillUpdate(props, state) {
  //   return !this.isAuthorized(props.children.props.route.protected, state.user) &&
  //     browserHistory.push(routeCodes.ROOT);
  // }

  render() {
    let user = auth.currentUser;

    return (
      <ThemeProvider theme={darkTheme}>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="about" element={<About />} />
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
}