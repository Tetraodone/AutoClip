const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;
import React, { useState } from 'react';
import { Button, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import package from '../package'
import priv from '../private.json'

const styles = {
  container: {
    display: 'flex',
    flexDirection:'column'
  },
  footer: {
    position:'absolute',
    bottom: 0,
    paddingBottom: '25px'
  },
  icon:{
    height: '75px',
    display:'inline',
    position: 'relative',
    top: '15px',
    left: '-10px'
  }
}

const Welcome = (props: {setToken: (token: string)=> void}) => {
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const authenticate = () => {
    var authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true
      }
    });
    // This is just an example url - follow the guide for whatever service you are using
    var authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${priv.client_id}&redirect_uri=http://localhost&response_type=token&scope=clips:edit&force_verify=true`

    authWindow.loadURL(authUrl);
    authWindow.show();
    // 'will-navigate' is an event emitted when the window.location changes
    // newUrl should contain the tokens you need
    authWindow.webContents.on('will-redirect', function (event, newUrl) {
        console.log(newUrl);
        console.log(event.sender.postMessage)

        if(newUrl.includes('access_token')){
          authWindow.destroy()
          const components = newUrl.split('=')
          const key = components[1].split('&')[0]
          console.log(key)
          localStorage.setItem('accessToken', key)
          props.setToken(key)
        }
        // More complex code to handle tokens goes here
    });

    authWindow.on('closed', function() {
        authWindow = null;
    });
  }

  const dialog = <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
    <DialogTitle id="alert-dialog-title">{"Signing in?"}</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        To create clips you must sign in to twitch directly throught their authentication servers. <br />
        This provides AutoClip with an authentication token which allows it to create clips on behalf of your account.<br />
        AutoClip only runs on your computer and only communicates directly with Twitch API and does not share your Authentication Token.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose} color="primary" autoFocus>
        Okay
      </Button>
    </DialogActions>
  </Dialog>;

  return (
    <div className="App" style={styles.container}>
      <header className="App-header">
        <p>
          <img src='../assets/icon.png' style={styles.icon}/>
          <Typography variant="h2" style={{'fontWeight': '300', display: 'inline'}}>AutoClip</Typography>
        </p>
        <p className="info">Create Twitch clips automatically</p>
        <Button
            variant="contained"
            color="primary"
            onClick={() => {
              authenticate()
            }}
          >
            Sign in with Twitch
        </Button>
        <Button
            style={{marginTop: '10px'}}
            color="primary"
            onClick={handleClickOpen}
          >
            Why do I need to sign in?
        </Button>
        {dialog}
        <div style={styles.footer}>
          <Typography variant="h6" style={{'fontWeight': '300'}}>By Tetraodone</Typography>
          <Typography variant="body2">v{package.version}</Typography>
        </div>
      </header>
    </div>
  );
};

export default Welcome;
