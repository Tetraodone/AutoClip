import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import Welcome from './Components/Welcome'
import ClipApp from './Components/ClipApp'
import { createTheme } from '@material-ui/core/styles';
import {
  ThemeProvider
} from '@material-ui/core';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6441a5',
    },
    secondary: {
      main: '#6441a5',
    },
  },
});


const Landing = () => {
  const [token, updateToken] = useState(localStorage.getItem('accessToken'))

  const setToken = (token: string) => {
    updateToken(token)
  }
console.log(token)
  return (
    <ThemeProvider theme={theme}>
      <div>
        {(token === '' || token === null)
        ? <Welcome setToken={setToken} />
        : <ClipApp setToken={setToken}/>}
      </div>
    </ThemeProvider>

  )
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Landing} />
      </Switch>
    </Router>
  );
}
