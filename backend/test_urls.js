const https = require('https');
const http = require('http');

const urls = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/trailer.mp4',
  'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4'
];

urls.forEach(url => {
  const lib = url.startsWith('https') ? https : http;
  lib.request(url, { method: 'HEAD' }, (res) => {
    console.log(url, res.statusCode, res.headers['content-type']);
  }).on('error', err => console.log(url, err.message)).end();
});
