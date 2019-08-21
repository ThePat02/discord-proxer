const {
  app,
  BrowserWindow,
  Menu,
  dialog
} = require('electron');
const client = require('discord-rich-presence')('611913662415896627');

//Base URL array
const urls = ["https://proxer.me", "https://proxer.me/watch/4167/1/engsub"];
//Setting URL
var currentURL = urls[0];
var versionJSONURL = "https://raw.githack.com/ThePat02/discord-proxer/master/version.json";


const axios = require('axios');
const cheerio = require('cheerio');

let win;

//Creating template for electron menu
const template = [{
    label: 'Navigation',
    submenu: [{
        label: 'Open Proxer in browser',
        click() {
          var opn = require('opn');
          opn(currentURL);
        }
      },
      {
        label: 'Open GitHub project',
        click() {
          var opn = require('opn');
          opn("https://github.com/ThePat02/discord-proxer");
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Version info',
        click() {
          var title = "discord-proxer " + versonInformation.version;
          var detail = "Author: " + versonInformation.author;
          const options = {
            type: 'info',
            buttons: ['Close'],
            title: 'Version-Information',
            message: title,
            detail: detail,
          };

          dialog.showMessageBox(null, options, (response, checkboxChecked) => {});
        }
      },
      {
        label: 'Check for updates',
        click() {
          checkUpdates();
        }
      },
      {
        label: 'Exit',
        click() {
          app.quit();
        }
      }
    ],
  },
  {
    label: 'Backwards',
    accelerator: 'CmdOrCtrl+B',
    click() {
      win.webContents.goBack();
    }
  },
  {
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click() {
      win.webContents.reload();
    }
  }
];

//Get versioninformations from JSON
var fs = require("fs");
// Get content from file
var versioncontent = fs.readFileSync("version.json");
// Define to JSON type
var versonInformation = JSON.parse(versioncontent);

//Main function (called on "ready")
function main() {
  //Defining electron window
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: "assets/icon.png",
    webPreferences: {
      nodeIntegration: false
    }
  })

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
    process.exit()
  });
}

//Called every X seconds to check if the page has changed
function checkPage() {

  var newURL = win.webContents.getURL();

  if (currentURL == newURL) {
    //literally nothing happens
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

//Called upon startup to check if the changelog.txt file on the repo has changed
function checkUpdates() {
  var request = require('request');
  request(versionJSONURL, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var importedJSON = JSON.parse(body);
      if (importedJSON.version != versonInformation.version) {
        var message = "Version v" + importedJSON.version + " is now online";
        console.log(importedJSON);
        const options = {
          type: 'info',
          buttons: ['Close', 'Update'],
          title: 'Update discord-proxer',
          message: message,
          detail: importedJSON.updateinformation,
        };

        dialog.showMessageBox(null, options, (response, checkboxChecked) => {
          if (response == "1") {
            var opn = require('opn');
            opn("https://github.com/ThePat02/discord-proxer/releases");
          }
        });
      }
    }
  })
}



app.on('ready', main);
