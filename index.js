const {
  app,
  BrowserWindow,
  Menu
} = require('electron');
const client = require('discord-rich-presence')('611913662415896627');

const urls = ["https://proxer.me", "https://proxer.me/watch/4167/1/engsub"];

const axios = require('axios');
const cheerio = require('cheerio');

var currentURL = "proxer.me";

let win;

function main() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: "assets/icon.png",
    webPreferences: {
      nodeIntegration: true
    }
  })

  let contents = win.webContents;
  console.log(contents);

  const template = [{
    label: 'Navigation',
    submenu: [{
      label: 'Backwards',
      accelerator: 'CmdOrCtrl+B',
      click() {
        console.log('<-')
        win.webContents.goBack();
      }
    }]
  }];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  win.maximize();

  win.loadURL(urls[0]);

  client.updatePresence({
    state: 'Browsing Proxer.me',
    details: 'Idle',
    largeImageKey: 'logo',
    instance: true,
    fullscreen: true,
    autoHideMenuBar: true,
  });

  setInterval(checkPage, 2000);
  win.on('close', function() {process.exit()});
}

function checkPage() {

  var newURL = win.webContents.getURL();

  if (currentURL == newURL) {
    //literally nothing
  } else {
    currentURL = newURL;
    win.setMenuBarVisibility(true);

    client.updatePresence({
      state: 'Browsing Proxer.me',
      details: 'Idle',
      largeImageKey: 'logo',
      instance: true,
      fullscreen: true,
      autoHideMenuBar: true,
    });

    if (currentURL.includes("watch") == true) {
      axios(currentURL)
        .then(response => {
          win.setMenuBarVisibility(false);
          const html = response.data;
          const $ = cheerio.load(html)
          const table = $('body');
          const animeInfo = [];

          table.each(function() {
            const name = $(this).find('.wName').text();
            const episode = $("#wContainer").find('.wEp').text();
            const lang = $(this).find('.wLanguage').text();

            animeInfo.push({
              name,
              episode,
              lang
            });
          });

          console.log(animeInfo);
          animeInfoString = JSON.stringify(animeInfo);
          animeInfoString = animeInfoString.substring(1, animeInfoString.length - 1);
          var anime = JSON.parse(animeInfoString);

          var detail_string = "Watching " + anime.name;
          var state_string = "Episode " + anime.episode + " (" + anime.lang + ")";

          client.updatePresence({
            state: state_string,
            details: detail_string,
            largeImageKey: 'logo',
            largeImageText: "proxer.me",
            instance: true,
          });
        })
        .catch(console.error);

    }

    if (currentURL.includes("chat") == true) {
      client.updatePresence({
        state: 'Browsing Proxer.me',
        details: 'Chatting',
        largeImageKey: 'logo',
        instance: true,
      });
    }

    if (currentURL.includes("forum") == true) {
      client.updatePresence({
        state: 'Browsing Proxer.me',
        details: 'Checking the forum',
        largeImageKey: 'logo',
        instance: true,
      });
    }

    if (currentURL.includes("airing") == true) {
      client.updatePresence({
        state: 'Browsing Proxer.me',
        details: 'Checking seasonal Anime',
        largeImageKey: 'logo',
        instance: true,
      });
    }

    if (currentURL.includes("gallery") == true) {
      client.updatePresence({
        state: 'Browsing Proxer.me',
        details: 'Checking the gallery',
        largeImageKey: 'logo',
        instance: true,
      });
    }

    if (currentURL.includes("news") == true) {
      client.updatePresence({
        state: 'Browsing Proxer.me',
        details: 'Checking the news',
        largeImageKey: 'logo',
        instance: true,
      });
    }


  }
}



app.on('ready', main);
