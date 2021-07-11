const axios = require('axios').default;
import priv from '../../private.json'

export async function searchChannels(query: string): Promise<Channel | null> {
    const token = localStorage.getItem('accessToken');
    if(token === null){
        return null
    }
    const config = {
        headers: {
          'Client-ID': priv.client_id,
          'Authorization': `Bearer ${token}`
        }
    }
    const url = `https://api.twitch.tv/helix/search/channels?query=${query}`

    var channels: Channel[] = []

    await axios.get(url, config)
    .then(function (response: {data: {data :[{id: string, display_name: string, is_live: boolean}]}}){
        console.log(response)
        const channelData = response.data.data

        for (var channel of channelData){
            channels.push(new Channel(
                channel.id,
                channel.display_name,
                channel.is_live
            ))
        }
    })
    .catch(function (error: any) {
      if( error.response ){
          console.log(error.response.data); // => the response payload
      }
    })

    const channel = channels.filter(c => c.name.toLowerCase() == query.toLowerCase())

    return channel[0]
}

export class Channel{
    id;
    name;
    live;

    constructor(id: string, name: string, live: boolean){
        this.id = id;
        this.name = name;
        this.live = live
    }
}

//export default searchChannels;
