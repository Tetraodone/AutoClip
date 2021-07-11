## AutoClip
<img src="./assets/icon.png" width="80" />
<p>
  AutoClip is a simple Electron Application that automatically creates twitch clips of a live broadcaster based off a set interval, or on events such as Subs and Raids
</p>

<br>

<p>
  Built with <a href='https://github.com/electron-react-boilerplate/'>Electron React Boilerplate</a>
</p>


## Download

Download installer from Releases

## Package Yourself

To package yourself:

1. Create an application and get a Client ID through <a href='https://dev.twitch.tv/'>Twitch Developer Console</a>

2. Clone the project

3. Add a file 'private.json' at /src/private.json

4. Add your client ID
```json
{
  "client_id": "123456789abcdefg"
}
```
5. Download Modules
```bash
yarn
```
6. Package or Start
```bash
yarn package
```
```bash
yarn start
```

