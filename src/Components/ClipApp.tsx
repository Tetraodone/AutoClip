const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;
const { ipcRenderer } = require('electron');
import React, { useState } from 'react';
import {
  OutlinedInput,
  Button,
  AppBar,
  Toolbar,
  Typography,
  NativeSelect,
  InputLabel,
  ThemeProvider,
  Checkbox,
  Snackbar,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import {searchChannels, Channel} from './Model/Channel';
import {createClip, Clip} from './Model/Clip';
var ComfyJS = require("comfy.js");
import package from '../package'

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

const styles = {
  view: {
    display: 'grid',
    'gridTemplateColumns': '40vw 60vw',
    overflow: 'hidden'
  },
  clips: {
    'overflow-y': 'scroll',
    'overflow-x': 'hidden',
    height: 'calc(100vh - 65px)',
    borderLeft: 'solid #d9d9d9 0.5px'
  },
  container: {
    margin: '15px',
    display: 'flex',
  },
  stack: {
    display: 'inline',
    marginRight: '25px',
  },
  reset: {
    marginLeft: '10px',
  },
  clip: {
    display: 'flex',
    margin:'10px',
    borderBottom: 'solid #d9d9d9 0.5px'
  },
  clipInfo: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px'
  },
  live: {
    display: 'inline',
    position:'relative',
    color:'green',
    fontSize: '64px',
    lineHeight: '0',
    top:'15px'
  },
  offline: {
    display: 'inline',
    position:'relative',
    color:'red',
    fontSize: '64px',
    lineHeight: '0',
    top:'15px'
  },
  null: {
    display:'none'
  },
  thumbnail: {
    objectFit: 'contain',
    width: '150px',
    borderRadius: '10px',
    height: 'auto'
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: '10px'
  }
};

var clipFn: () => void = () => {}

ipcRenderer.on('clip', (e, msg) => {
  //window.clipApp.clipNow()
  clipFn()
})



const ClipApp = (props: {setToken: (token: string) => void}) => {
  const [query, setQuery] = useState('');
  const [interval, setInterval] = useState(5);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [active, setActive] = useState(false);
  const [clips, updateClips] = useState<Clip[]>([]);
  const [timer, setTimer] = useState(0);
  const [alert, setAlert] = useState('');

  const [chatActivity, setChatActivity] = useState(false)
  const [chatCount, updateChatCount] = useState(0);
  const [lastChatCount, updateLastChatCount] = useState(0);

  const [clipSub, setClipSub] = useState(false)
  const [clipRaid, setClipRaid] = useState(false)

  const [logout, setLogout] = useState(false)

  ComfyJS.onChat = ( user, message, flags, self, extra ) => {
    console.log('Recieved chat message')
    updateChatCount(chatCount + 1);
  }

  ComfyJS.onSub = ( user, message, subTierInfo, extra ) => {
    if(clipSub){
      window.setTimeout(function(){clipNow}, 5000);
    }
  }

  ComfyJS.onRaid = ( user, viewers, extra ) => {
    if(clipRaid){
      window.setTimeout(function(){clipNow}, 5000);
    }
  }


  const clipNow = async () => {
    console.log(`${chatCount} > ${lastChatCount}`)
    if(channel != null){
      const renewChannel = await searchChannels(channel.name)
      if(renewChannel != null && renewChannel.live){
        const clip = await createClip(renewChannel.id)
        if(clip != null){
          if(!chatActivity || chatCount > lastChatCount || chatCount == 0)
          updateClips(oldClips => [...oldClips, clip]);
        }
      } else {
        setAlert(`${renewChannel.name} is no longer live. Stopping Bot`)
        stop()
      }
      setChannel(renewChannel)
    }

    updateLastChatCount(chatCount)
  }

  clipFn = clipNow

  const start = () => {
    if(channel != null){
      setActive(true);
      clipNow()
      console.log(interval)
      setTimer(window.setInterval(clipNow, interval * 60000));
      setAlert(`Started Bot`)
      setTimeout(function(){setAlert('')}, 4000);
      ComfyJS.Init(channel.name);
    }
  }

  const stop = () => {
    if(timer != 0){
      window.clearInterval(timer)
      setActive(false);
      setTimer(0)
    }
    setAlert(`Stopping Bot`)
    setTimeout(function(){setAlert('')}, 4000);
  }

  const search = async () => {
    let c = await searchChannels(query)
    setChannel(c)
    if(c != null){
      if(!c.live){
        setAlert(`${c.name} is not live`)
        setTimeout(function(){setAlert('')}, 4000);
      }
    } else {
      setAlert('Could not find channel')
      setTimeout(function(){setAlert('')}, 4000);
    }
  }

  const openClip = (clipUrl: string) => {
    var authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true
      }
    });

    authWindow.loadURL(clipUrl);
    authWindow.show();

    authWindow.on('closed', function() {
        authWindow = null;
    });
  }

  var isWin = process.platform === "win32";
  const footer = <div style={styles.footer}>
    <Typography variant="body2" style={{fontStyle: 'italic', opacity: 0.5}}>Try {isWin ? 'Alt+Control+C' : 'Alt+Command+C'} anywhere to clip</Typography>
    <Typography variant="body2">v{package.version}</Typography>
  </div>

  const handleLogout = () => {
    localStorage.setItem('accessToken', '')
    props.setToken('')
  }

  const logoutAlert = <Dialog
    open={logout}
    onClose={() => {setLogout(false)}}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
  <DialogTitle id="alert-dialog-title">{"Logout"}</DialogTitle>
  <DialogContent>
    <DialogContentText id="alert-dialog-description">
      Are you sure?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => {setLogout(false)}} color="primary" autoFocus>
      Cancel
    </Button>
    <Button onClick={handleLogout} style={{color:'red'}} autoFocus>
      Logout
    </Button>
  </DialogActions>
  </Dialog>;

  return (
    <ThemeProvider theme={theme}>
      <div style={styles.view}>
        <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{flexGrow: 1}}>AutoClip</Typography>
          </Toolbar>
        </AppBar>
        <div style={styles.container}>
          <div style={styles.stack}>
            <InputLabel htmlFor="broadcaster">Broadcaster</InputLabel>
            <OutlinedInput
              id="broadcaster"
              type="text"
              value={query}
              disabled={channel !=null}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
            />
          </div>
          {channel != null ? (
            <Button
            disabled={active}
            variant="contained"
            color="primary"
            onClick={() => {
              setChannel(null);
              setQuery('');
            }}
          >
            Clear
          </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: '10px' }}
              onClick={() => {
                search()
              }}
              disabled={query === '' || query.length < 3}
            >
              Find Channel
            </Button>
          )}
        </div>

        <div style={styles.container}>
          <div style={styles.stack}>
            <InputLabel htmlFor="clipInterval">Clip Interval</InputLabel>
            <NativeSelect
              disabled={active}
              id="clipInterval"
              onChange={(event) => {
                const value = parseInt(event.target.value);
                setInterval(value);
              }}
            >
              <option value="5">5 Minutes</option>
              <option value="10">10 Minutes</option>
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
            </NativeSelect>
          </div>
          <div style={styles.stack}>
            <InputLabel htmlFor="activity">Only clip if chat active</InputLabel>
            <Checkbox
              disabled={active}
              checked={chatActivity}
              onChange={() => {
                setChatActivity(!chatActivity);
              }}
              name="activity"
              id="activity"
            />
          </div>
        </div>
        <div style={styles.container}>
          <div style={styles.stack}>
            <InputLabel htmlFor="subClip">Clip Subs</InputLabel>
            <Checkbox
              disabled={active}
              checked={clipSub}
              onChange={() => {
                setClipSub(!clipSub)
              }}
              name="subClip"
              id="activity"
            />
          </div>
          <div style={styles.stack}>
            <InputLabel htmlFor="raidClip">Clip Raids</InputLabel>
            <Checkbox
              disabled={active}
              checked={clipRaid}
              onChange={() => {
                setClipRaid(!clipRaid)
              }}
              name="raidClip"
              id="activity"
            />
          </div>
        </div>
        {active
        ?
        <Button
          variant="contained"
          color="primary"
          style={{ marginLeft: '10px' }}
          onClick={() => {
            stop()
          }}
        >
          Stop
        </Button>
        :
        <Button
            variant="contained"
            color="primary"
            style={{ marginLeft: '10px' }}
            onClick={() => {
              start()
            }}
            disabled={!(channel!= null && channel.live)}
          >
            Start Bot
          </Button>
        }

        {(channel != null && channel.live)
        ?<p style={styles.live}>•</p>
        :<p style={(channel === null ? styles.null : styles.offline)}>•</p>
        }
        {footer}
        </div>
        <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{flexGrow: 1}}>Clips</Typography>
            <Button
            style={{color: 'white'}}
            onClick={() => {
              setLogout(true)
            }}>
              Logout
            </Button>
            {logoutAlert}
          </Toolbar>
        </AppBar>
        <div style={styles.clips}>
        {clips.map(clip => (
          <div key={clip.url} style={styles.clip}>
            <img src={clip.thumbnail} style={styles.thumbnail}></img>
            <div style={styles.clipInfo}>
              <p style={{margin: 0, fontWeight: "bold"}}>{clip.title}</p>
              <p style={{margin: 0}}>{`${clip.viewers} Viewers`}</p>
              <p style={{margin: 0}}>{clip.date}</p>
            </div>
            <Button
            color="primary"
            style={{ marginLeft: '5px', padding: '10px' }}
            onClick={() => {
              openClip(clip.url)
            }}>Edit</Button>
          </div>
          ))}
        </div>

        </div>
        <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={(alert != '')}
        autoHideDuration={6000}
        onClose={() => {
          setAlert('')
        }}
        message={alert}
        action={
          <React.Fragment>
            <Button style={{color: 'white'}} size="small" onClick={() => {setAlert('')}}>
              Okay
            </Button>
          </React.Fragment>
        }
      />
      </div>
    </ThemeProvider>
  );
};

export default ClipApp;
