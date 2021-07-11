const axios = require('axios').default;
import priv from '../../private.json'

async function streamDetails(broadcaster: string):  Promise<Stream | null>{
  const token = localStorage.getItem('accessToken');
  if(token === null){
      return null
  }
  const config = {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Client-ID': priv.client_id
      }
  }
  console.log(broadcaster)
  const url = `https://api.twitch.tv/helix/streams?user_id=${broadcaster}`
  var stream: Stream | null = null

  await axios.get(url, config)
  .then(function (response: {data: {data :[{title: string, viewer_count: number, thumbnail_url: string}]}}){
      console.log(response)
      const streamData = response.data.data
      if(streamData.length > 0){
        stream = new Stream(streamData[0].title, streamData[0].viewer_count, streamData[0].thumbnail_url)
      }
  })
  .catch(function (error: {}) {
    console.log(error);
  })

  return stream
}

class Stream{
  title: string;
  viewers: number;
  thumbnail: string;
  constructor(title: string, viewers: number, thumbnail: string){
    this.title = title;
    this.viewers = viewers;
    this.thumbnail = thumbnail.replace('{width}', `${128 + getRandomInt(10)}`).replace('{height}', `${72 + getRandomInt(10)}`)
  }
}

export async function createClip(broadcaster: string): Promise<Clip | null> {
  const token = localStorage.getItem('accessToken');
  if(token === null){
      return null
  }
  const config = {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Client-ID': priv.client_id
      }
  }
  console.log(broadcaster)
  const url = `https://api.twitch.tv/helix/clips?broadcaster_id=${broadcaster}`
  var clip: Clip | null = null

  const stream = await streamDetails(broadcaster)
  if(stream === null){
    return null
  }

  await axios.post(url, {}, config)
  .then(function (response: {data: {data :[{id: string, edit_url: string}]}}){
      console.log(response)
      const clipData = response.data.data
      if(clipData.length > 0){
        clip = new Clip(clipData[0].id, clipData[0].edit_url, stream)
      }
  })
  .catch(function (error: {}) {
    console.log(error);
  })

  return clip
}

export class Clip{
  id: string;
  url: string;
  date: string;
  thumbnail: string;
  viewers: number;
  title: string;
  constructor(id: string, url: string, stream: Stream){
    this.id = id;
    this.url = url;
    this.date = new Date().toLocaleString()
    this.thumbnail = stream.thumbnail;
    this.viewers = stream.viewers;
    this.title = stream.title
  }
}

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}
