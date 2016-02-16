class Socket {
   constructor(login, cb) {
      this.login = login;
      this.callbacks = cb;
   }

   init() {
      // Since we're using secure sockets, put authentication information in the connection string
      var url = "wss://ecli.herokuapp.com/?email={email}&pass={pass}",
         pingInterval = 20000;
      //var url = "wss://ecli.mybluemix.net/?email={email}&pass={pass}", pingInterval = 60000,

      url = url.replace('{email}', this.login.email).replace('{pass}', this.login.password);

      this.socket = new WebSocket(url);

      var promise = new Promise((resolve, reject) => {
         this.socket.onopen = () => {
            console.info((new Date()).toTimeString().substring(0, 8), 'socket opened');
            this.callbacks.connect && this.callbacks.connect();

            this.pingTimer = this.pingTimer || window.setInterval(() => {
               this.pingConnection();
            }, pingInterval);
         };

         this.socket.onmessage = (evt) => {
            var data = JSON.parse(evt.data);

            if (typeof data === 'string') {
               switch (data) {
                  case 'pong':
                     this.callbacks.ping && this.callbacks.ping();
                     break;
                  case 'hello':
                     resolve();
                     this.callbacks.auth && this.callbacks.auth();
                     break;
               }
               return;
            }

            console.debug('< ', data);
            this.callbacks.received && this.callbacks.received(data);
         };

         // Socket is closed
         this.socket.onclose = (data) => {
            // If unauthenticated, then stop retrying
            if (data.reason === 'Incorrect credentials') {
               reject(data.reason);
               this.callbacks.unauth && this.callbacks.unauth();
               clearInterval(this.pingTimer);
            }

            this.callbacks.disconnect && this.callbacks.disconnect();
            console.info((new Date()).toTimeString().substring(0, 8), 'socket closed', data.reason);
         };

         // Socket error, try to reopen a connection after awhile
         this.socket.onerror = (evt) => {
            console.info('socket error: ', evt);
            window.setTimeout(() => this.init, 3000);
         };
      });

      return promise;
   }

   closeSocket() {
      clearInterval(this.pingTimer);
      this.socket.close();
   }

   sendMessage(message) {
      if (message != 'ping') {
         console.debug('> ', message);
      }
      this.socket.send(JSON.stringify(message));
   }

   pingConnection() {
      // Re-initialize if our websocket connection died between pings
      if (this.socket.readyState === WebSocket.CLOSED) {
         this.init();
      } else {
         this.sendMessage('ping');
      }
   }
}