const settings = require('electron-settings');
settings.setPath("./Settings");

var myconfig ={
  defaults: {
    Version : 0.1,
    Port : 9598,
    Browser : "firefox",
    StartServerOnOpen : 1,
    StartOnTray: 0

  },
  defs : {},
  getDefs: function (){
    
    if (settings.has('Version')){
      this.defs.Version = settings.get('Version');
      this.defs.Port = settings.get('Port');
      this.defs.Browser = settings.get('Browser');
      this.defs.StartServerOnOpen = settings.get('StartServerOnOpen');      
      this.defs.StartOnTray = settings.get('StartOnTray');      

    }else{
      this.defs = this.defaults;
      settings.setAll(this.defs)
    }
  },
  setDefs: function (newDefs){
    
    if (typeof newDefs != 'undefined' && newDefs){
    
      this.defs = {
        Version :this.defaults.Version,
        Port : newDefs.Port,
        Browser : newDefs.Browser,
        StartServerOnOpen : newDefs.StartServerOnOpen,
        StartOnTray: newDefs.StartOnTray

      }
      settings.setAll(this.defs)
    }
  }
}

module.exports = myconfig