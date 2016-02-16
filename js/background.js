class BackGround {
   constructor() {
      this.unreadCounter = 0;
      this.flip = false;

      // Register Context menu
      this.contextMenu = new ContextMenu(function (info, tab) {
         this.contextMenuClick(info, tab);
      }.bind(this));

      // Socket callbacks
      this.callbacks = {
         ping: () => {
            this.setIcon(this.flip);
            this.flip = !this.flip;
         },

         disconnect: () => {
            this.setIcon(this.flip, true);
            this.contextMenu.detach();
         },

         connect: () => { },

         received: (data) => {
            var views = chrome.extension.getViews();

            switch (data.action) {
               case 'TokenReceived':
                  views.forEach(function (view) {
                     view.PopUp && view.PopUp.showQR(data);
                  });

                  break;
               case 'TokenConsumed':
                  views.forEach(function (view) {
                     view.PopUp && view.PopUp.hideQR();
                  });

                  break;
               case 'Broadcast':
                  // If a popup opened, push the message to the UI
                  var incremented = views.length > 1 && views.reduce(function (prev, curr) {
                     curr.PopUp && curr.PopUp.insertNewRecord(data, true);
                     return !!prev || !!curr.PopUp;
                  });

                  // If not then increment extension's counter to notify of a new message
                  if (!incremented)
                     this.incrementUnreadCounter();

                  // Store the message in our persistent storage
                  this.storage.storeItem(data);

                  break;
            }
         }
      };

      // Initialize persistent storage and login to Ecli server through WS
      this.storage = new PersistantStorage();
      this.storage.init().then(() => {
         // Web Sockets stuff
         if (this.storage.login) {
            this.socket = new Socket(this.storage.login, this.callbacks);
            this.socket.init().then(() => {
               this.auth();
            }, () => {
               this.unauth();
            });
         }
      });

      window.onbeforeunload = (e) => {
         e.preventDefault();
         chrome.browserAction.setBadgeText({
            text: ""
         });

         this.socket && this.socket.closeSocket();
      };
   }

   unauth(message) {
      // Clear currently stored login
      this.storage.storeLogin(null);

      // Kill the socket
      delete this.socket;

      // Notify PopUp if it's opened
      //getViews(function(view) {
      //  var fn = view.PopUp || view.Options;
      //  fn && fn.unauth();
      //});

   }

   auth() {
      this.setIcon();
      this.contextMenu.attach();

      getViews(function (view) {
         //  view.Options && view.Options.auth();

         var reader = new Ecli.RecordReader();
         reader.getRecords(function (data) {
            console.log(data);
         });
      });
   }

   getRecords() {
      return this.storage.items;
   }

   getLogin() {
      return this.storage.login;
   }

   incrementUnreadCounter() {
      chrome.browserAction.setBadgeText({
         text: "" + (++this.unreadCounter)
      });
   }

   resetUnreadCounter() {
      this.unreadCounter = 0;
      chrome.browserAction.setBadgeText({
         text: ""
      });
   }

   contextMenuClick(info, tab) {
      var domain = url_domain(info.linkUrl || info.pageUrl);
      this.sendMessage({
         action: "Broadcast",
         link: info.linkUrl || info.pageUrl,
         title: info.linkUrl ? domain : tab.title,
         sentFrom: "Browser",
         addedOn: new Date().toISOString()
      });
   }

   sendMessage(message) {
      this.socket.sendMessage(message);
   }

   login(login) {
      this.storage.storeLogin(login);
      var promise = new Promise((resolve, reject) => {
         if (this.storage.login && !this.socket) {
            this.socket = new Socket(this.storage.login, this.callbacks);
            this.socket.init().then(
               () => {
                  this.auth();
                  resolve();
               },
               (message) => {
                  this.unauth(message);
                  reject(message);
               });
         }
      });

      return promise;
   }

   setIcon(flip, isDC) {
      Ecli.DaVinci.getImage(flip, isDC).then(
         (imageData) => {
            chrome.browserAction.setIcon({
               imageData: imageData
            });
         },
         (error) => {
            console.error(error);
         });
   }

   openOptions(url, nearActive) {
      chrome.windows.getCurrent(function (current) {
         chrome.tabs.create({
            url: 'chrome://extensions/?options=' + chrome.runtime.id
         });
      });
   }
}

window.Ecli.backGround = new BackGround();

function getViews(cb) {
   var views = chrome.extension.getViews();
   views.forEach(cb);
}

function url_domain(data) {
   var a = document.createElement('a');
   a.href = data;
   return a.hostname;
}

/* https://www.youtube.com/watch?v=cBu6eEKJH3M */