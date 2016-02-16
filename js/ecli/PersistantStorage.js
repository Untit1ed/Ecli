class PersistantStorage {
  constructor(storageCap = 25) {
    this.storageCap = storageCap;
  }

  init(){
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get({
        History: [],
        Login: null
      }, (data) => {
        this.items = data.History;
        this.login = data.Login;

        resolve(this);
      });
    });
  }

  storeItem(item) {
    if (this.items.length > this.storageCap)
      this.items.splice(this.storageCap);
    this.items.unshift(item);

    chrome.storage.sync.set({
      History: this.items
    });
  }

  storeLogin(login) {
    this.login = login;

    chrome.storage.sync.set({
      Login: this.login
    });
  };

  remove(index) {
    this.items.splice(index, 1);

    chrome.storage.sync.set({
      History: this.items
    });
  };
}
