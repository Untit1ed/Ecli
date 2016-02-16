class Options {
   constructor() {
      this.backGround = chrome.extension.getBackgroundPage().Ecli.backGround;
   }

   load() {
      var login = this.backGround.getLogin();
      console.log(login);

      if (login)
         document.querySelector('[name=email]').value = login.email;
   }

   store(evemt, form) {
      debugger;
      event.preventDefault();
      var login = {};

      for (var i = 0; i < form.elements.length; i++) {
         const element = form.elements[i];
         if (element.name && element.value) {
            login[element.name] = element.value;
         }
      }

      Cryptography.hash(login.email + login.password, 'SHA-1').then((digest) => {
         login.password = digest;

         this.backGround.login(login).then(
            () => { this.auth() },
            (error) => { this.unauth() });
      });
   }

   unauth(error) {
      document.getElementById('error').innerHTML = error;
   }

   auth() {
      document.getElementById('error').innerHTML = "Success!";
   }
}

window.Options = new Options();

// Load stored options when options pop-up's DOM is loaded
document.addEventListener('DOMContentLoaded', window.Options.load.bind(window.Options));

// Store options on form submit
document.getElementById('signup').addEventListener('submit', function (event) {
   window.Options.store(event, this);
}, false);
