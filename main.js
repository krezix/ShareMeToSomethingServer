const { app, BrowserWindow, Menu, Tray } = require('electron')
const ipc = require('electron').ipcMain
const sStatus = require("./globals.js")
const myconfig = require("./myconfig.js")
const myfuncs = require("./funcoes.js")
const sanitizeUrl = require('@braintree/sanitize-url').sanitizeUrl;
const path = require('path')
const DEBUGMODE = 0
//ELECTRON_ENABLE_LOGGING=1

let win
let serverHandle
let appIcon = null
let ServerStatus =  sStatus.Stopped

myconfig.getDefs();


function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({ width: 800, height: 600 , frame: false,icon: __dirname + '/icon.png'}) 
  
    win.loadFile('file://' + __dirname +'/index.html')

    if(DEBUGMODE){
      win.webContents.openDevTools()   
      //require("devtron").install()
    }

    win.webContents.on('crashed', () => {
      win.destroy();
      createWindow();
    });
   
    
    win.on('closed', () => {
      
      win = null
    })
    
  }
  


  app.on('ready', createWindow)
  
  app.on('window-all-closed', () => {
   
    if (appIcon) appIcon.destroy()
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
   
    if (win === null) {
      createWindow()
    }
  })

  ipc.on('put-in-tray', (sender)=>{
    putMeOnTray(sender)
  })


  ipc.on('remove-tray', () => {
    win.show();
    appIcon.destroy()
  })

  ipc.on('updateDefs', function (event, arg) {
    if(typeof arg != 'undefined' && arg){
      myconfig.setDefs(arg);
    }
  });

  ipc.on('connect', function (event, arg) {
    if (ServerStatus = sStatus.Stopped){
      StartServer();
    }
    
  })

  ipc.on('disconnect', function (event, arg) {
    StopServer();
  })

  ipc.on('PageTotalyLoaded', function (event, arg) {
    ipcSend('getdefs', myconfig.defs); 
    if (myconfig.defs.StartServerOnOpen){
      
      ipcSend('defsWantMeConnected');

    }
    if(myconfig.defs.StartOnTray){
      putMeOnTray(event);
    }
  })

  function putMeOnTray(event){
    
      const iconName = process.platform === 'win32' ? 'icon.ico' : 'icon.png'
      const iconPath = path.join(__dirname, iconName)
      appIcon = new Tray(iconPath)
      win.minimize();
      win.hide();
      const contextMenu = Menu.buildFromTemplate([{
        label: 'Restaurar',
        click: () => {
          win.show();
          event.sender.send('tray-removed');
          appIcon.destroy();
        }
      },{
        label: 'Iniciar',
        click: () => {
          StartServer();        
        }
      },{
      label: 'Desligar',
      click: () => {
       StopServer();
      }
    },{
      type: 'separator'
    },  {
      label: 'Sair ',
      click: () => {
        
       app.quit();
      }
    }
    ])
    
      appIcon.setToolTip('Maximizar Server ')
      appIcon.setContextMenu(contextMenu)
    
  }
  function ipcSend(method, data){
    win.webContents.send(method, data);
  }


  function changeStatus(newStatus){
    ServerStatus = newStatus;
    ipcSend("Server-Status",newStatus);
  }



const express = require('express')
var bodyParser = require('body-parser');
const exp = express()



function StartServer(){
  if (ServerStatus != sStatus.TryingToStart && ServerStatus != sStatus.Started){
    changeStatus(sStatus.TryingToStart);
    serverHandle = exp.listen(myconfig.defs.Port, () => {
      changeStatus(sStatus.Started);
    })
    exp.enable('trust proxy')
    exp.use(bodyParser.urlencoded({extended:false}));
    exp.use(bodyParser.json());

    exp.get('/', (req, res) => { 
      res.send(401, 'not authorized');
      win.webContents.send('receivedData', {"type": "triedRoot", "data" :  {"from" : req.ips, "msg":'Someone tried to log at root'}});
    })
    
    
    
    
    exp.get('/shared', (req, res) => { 
        var url = req.query.url;      
        
        res.status(200).send('OK')
        url = sanitizeUrl(url);
        
        if (url !== 'about:blank'){
          childApp = myfuncs.openApp(myconfig.defs.Browser,url);
          ipcSend('receivedUrl', {"type": "shared", "data":{"from" : req.ip, "msg":url}});
          
        }  
      })
  }
}
function StopServer(){
  changeStatus(sStatus.TryingToStop);
  serverHandle.close(()=>{
    changeStatus(sStatus.Stopped);
  });
}
