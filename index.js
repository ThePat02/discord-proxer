const { app, BrowserWindow, Menu, dialog } = require('electron');
const client = require('discord-rich-presence')('611913662415896627');

//Base URL array
const urls = ['https://proxer.me', 'https://proxer.me/watch/4167/1/engsub'];
//Setting URL
var currentURL = urls[0];
var versionJSONURL =
  'https://raw.githack.com/ThePat02/discord-proxer/master/version.json';

const axios = require('axios');
const cheerio = require('cheerio');

let win;

//Creating template for electron menu
const template = [
  {
    label: 'Proxer',
    submenu: [
      {
        label: 'Open Proxer in browser',
        click() {
          openPage('proxer');
        },
      },
      {
        label: 'Open GitHub project',
        click() {
          openPage('github');
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Userscripts',
        click() {
          let win_userscript = new BrowserWindow({
            width: 1000,
            height: 800,
            webPreferences: {
              nodeIntegration: true,
            },
          });
          win_userscript.show();
          win_userscript.setMenuBarVisibility(false);
          win_userscript.loadURL('file:///' + __dirname + '/userscripts.html');
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Version info',
        click() {
          const title = 'discord-proxer ' + versioncontent.version;
          const detail = 'Author: ' + versioncontent.author;
          const options = {
            type: 'info',
            buttons: ['Close'],
            title: 'Version-Information',
            message: title,
            detail: detail,
          };

          dialog.showMessageBox(
            null,
            options,
            (response, checkboxChecked) => {},
          );
        },
      },
      {
        label: 'Check for updates',
        click() {
          checkUpdates();
        },
      },
      {
        label: 'Exit',
        click() {
          app.quit();
        },
      },
    ],
  },
  {
    label: 'Backwards',
    accelerator: 'CmdOrCtrl+B',
    click() {
      win.webContents.goBack();
    },
  },
  {
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click() {
      win.webContents.reload();
    },
  },
];

// Get content from file
const versioncontent = require('./version.json');

//Main function (called on "ready")
function main() {
  //Init folders
  firstStartUp();

  //Defining electron window
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: 'assets/icon.png',
    webPreferences: {
      nodeIntegration: false,
    },
  });

  let contents = win.webContents;

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  win.maximize();
  win.loadURL(currentURL);

  //Inital rich presence
  client.updatePresence({
    state: 'Browsing Proxer.me',
    details: 'Idle',
    largeImageKey: 'logo',
    instance: true,
  });

  //Setting interval to refresh rich presence
  setInterval(checkPage, 2000);

  //Checking for updates
  checkUpdates();

  //Exit the process after closing the electron window
  win.on('close', function() {
    process.exit();
  });
}

//Called every X seconds to check if the page has changed
function checkPage() {
  let newURL = win.webContents.getURL();

  if (currentURL !== newURL) {
    currentURL = newURL;
    win.setMenuBarVisibility(true);

    let presenceObj = {
      state: 'Browsing Proxer.me',
      details: 'Idle',
      largeImageKey: 'logo',
      instance: true,
      fullscreen: true,
      autoHideMenuBar: true,
    };

    currentURL.includes('chat')
      ? (presenceObj.details = 'Chatting')
      : currentURL.includes('forum')
      ? (presenceObj.details = 'Checking the forum')
      : currentURL.includes('airing')
      ? (presenceObj.details = 'Checking seasonal Anime')
      : currentURL.includes('gallery')
      ? (presenceObj.details = 'Checking the gallery')
      : currentURL.includes('news')
      ? (presenceObj.details = 'Checking the news')
      : '';

    client.updatePresence({
      state: presenceObj.state,
      details: presenceObj.details,
      largeImageKey: presenceObj.largeImageKey,
      instance: presenceObj.instance,
    });

    if (currentURL.includes('watch')) {
      setWatching(currentURL, presenceObj);
    }
  }
}

//Called upon startup to check if the changelog.txt file on the repo has changed
function checkUpdates() {
  var request = require('request');
  request(versionJSONURL, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var importedJSON = JSON.parse(body);
      if (importedJSON.version != versioncontent.version) {
        var message = 'Version v' + importedJSON.version + ' is now online';
        console.log(importedJSON);
        const options = {
          type: 'info',
          buttons: ['Close', 'Update'],
          title: 'Update discord-proxer',
          message: message,
          detail: importedJSON.updateinformation,
        };

        dialog.showMessageBox(null, options, (response, checkboxChecked) => {
          if (response == '1') {
            var opn = require('opn');
            opn('https://github.com/ThePat02/discord-proxer/releases');
          }
        });
      }
    }
  });
}

function setWatching(currentURL, oldObj) {
  axios(currentURL)
    .then(response => {
      win.setMenuBarVisibility(false);
      const html = response.data;
      const $ = cheerio.load(html);
      let animeInfo = {};

      const name = $('#wContainer')
        .find('.wName')
        .text();
      const episode = $('#wContainer')
        .find('.wEp')
        .text();
      const lang = $('#wContainer')
        .find('.wLanguage')
        .text();

      animeInfo = {
        name: name,
        episode: episode,
        lang: lang,
      };

      console.log(animeInfo);

      client.updatePresence({
        state: `Watching ${animeInfo.name}`,
        details: `Episode ${animeInfo.episode} ( ${animeInfo.lang} )`,
        largeImageKey: oldObj.largeImageKey,
        instance: oldObj.instance,
      });
    })
    .catch(console.error);
}

let openPage = async site => {
  let url = '';

  switch (site) {
    case 'github':
      url = 'https://github.com/ThePat02/discord-proxer';
      break;
    case 'proxer':
      url = 'https://proxer.me';
      break;
  }

  if (url != '') {
    let opn = await require('opn');
    opn(url);
  }
};

//Things that only happen once
function firstStartUp() {
  const fs = require('fs');

  let dir = process.env.USERPROFILE + '/Documents/discord-proxer';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

app.on('ready', main);
