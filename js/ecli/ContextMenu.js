class ContextMenu {
   constructor(cb) {
      this.contextObj = {
         title: "Share via EcliStory",
         contexts: ["page", "link"],
         onclick: cb
      };
   }

   attach() {
      chrome.contextMenus.create(this.contextObj);
   }

   detach() {
      if (this.contextObj.generatedId) {
         chrome.contextMenus.remove(this.contextObj.generatedId);
         delete this.contextObj.generatedId;
      }
   }
}
