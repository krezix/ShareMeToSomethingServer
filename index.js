const BrowserWindow = require('electron').remote.BrowserWindow;
const appVersion = window.require('electron').remote.app.getVersion();

const path = require('path');
const ipc = require('electron').ipcRenderer;
const sStatus = require("./globals.js");
const myfuncs = require("./funcoes.js");
const {clipboard} = require('electron');
const sanitizeUrl = require('@braintree/sanitize-url').sanitizeUrl;

let logger  = document.getElementById("logger");
let myDefs;
let windowContent = document.getElementById("windowContent");
let btnConnect = document.getElementById("btnConnect");
let txtConnect = document.getElementById("txtConnect");
let btnDefs = document.getElementById("btnDefs");

let btnTray = document.getElementById("btnTray");                           
let btnMinimize = document.getElementById("btnMinimize");                           
let btnMaximize = document.getElementById("btnMaximize");
let spanMaximize = document.getElementById("spanMaximize");
let trayOn = false


let btnClose = document.getElementById("btnClose");



let myDefsForm = document.getElementById("myDefsForm");
let myDefsPorta = document.getElementById("myDefsPorta");
let myDefsBrowser = document.getElementById("myDefsBrowser");
let myDefsAutoOn = document.getElementById("myDefsAutoOn");
let myDefsTray = document.getElementById("myDefsTray");
let btnOK = document.getElementById("btnOK");
let btnCancel = document.getElementById("btnCancel");
let idFooter = document.getElementById("idFooter");
let idVersion = document.getElementById("idVersion");
let idIP = document.getElementById("idIP");

function createItem(Title,Text="",isUrl = false){
    li = document.createElement("li");
    li.classList.add("list-group-item");
    div = document.createElement("div");
    div.classList.add("media-body");
    if (isUrl){
        Text = sanitizeUrl(Text);
        cp = "<span onclick='clipboard.writeText(%url%)' class='icon icon-docs'></span>".replace("%url%",'"'+Text+'"');
        Text = cp + "     <a href='#' onclick='myfuncs.openApp(\"firefox\",\""+Text+"\"); return false;'>"+Text+"</a>";
    }
    div.innerHTML = '<strong>%title%</strong><p>%content%</p>'.replace("%title%",Title).replace("%content%",Text);
    li.appendChild(div);
    return li;
}
function logMe(Title, TextToLog = "",isUrl = false){   
    
    logger.appendChild(createItem(Title,TextToLog,isUrl));
    windowContent.scrollTop = windowContent.scrollHeight;

    
}

ipc.on('receivedUrl', function (event, arg) {

    logMe(arg.data.from,arg.data.msg,true);
})

ipc.on("Server-Status",function (event,arg){
    switch (arg){
        case sStatus.TryingToStart :
            logMe("Server Status : ","A Tentar ligar ...")
        break;
        case sStatus.Started :
            logMe("Server Status : ","Ligado ...")
        break;
        case sStatus.TryingToStop :
            logMe("Server Status : ","A Tentar desligar ...")
        break;
        case sStatus.Stopped :
            logMe("Server Status : ","Desligado ...")
        break;
    }
});

ipc.on('getdefs', function (event, arg) {
    if (arg !== null){
        myDefs = arg;

        myDefsToControls(true);
        idVersion.innerText =  " " + appVersion;
        idIP.innerText =  " " + myfuncs.getIP()  + ":" + myDefs.Port;
    }
});

ipc.on('defsWantMeConnected', function (event) {
    changeConnectButton(false)
    ipc.send('connect');
})

btnTray.addEventListener('click', function (event) {
    if (trayOn) {
      trayOn = false
      ipc.send('remove-tray')
    } else {
      trayOn = true
     
      ipc.send('put-in-tray')
    }
  })

  ipc.on('tray-removed', function () {
    ipc.send('remove-tray')
    trayOn = false
  })

btnMinimize.onclick=function (e){
    var theWindow = BrowserWindow.getFocusedWindow();
    e.preventDefault;
    theWindow.minimize();
}

btnMaximize.onclick=function(e){
    var theWindow = BrowserWindow.getFocusedWindow();

    e.preventDefault;
    if(theWindow.isMaximized()) {
        spanMaximize.classList.remove('icon-resize-small');
        spanMaximize.classList.add('icon-resize-full');
        theWindow.unmaximize();
      } else {
        
        spanMaximize.classList.add('icon-resize-small');
        spanMaximize.classList.remove('icon-resize-full');
        theWindow.maximize();
      } 
}

btnClose.onclick=function(e){
    var theWindow = BrowserWindow.getFocusedWindow();

    e.preventDefault;
    theWindow.close();
}

function myDefsToControls(ToControlsOrNot){
    if(ToControlsOrNot){
        myDefsPorta.value = myDefs.Port;
        myDefsBrowser.value = myDefs.Browser;
        myDefsAutoOn.checked = myDefs.StartServerOnOpen ;
        myDefsTray.checked = myDefs.StartOnTray;
    }else{
        myDefs.Port = myDefsPorta.value;
        myDefs.Browser = myDefsBrowser.value ;
        myDefs.StartServerOnOpen = myDefsAutoOn.checked;
        myDefs.StartOnTray = myDefsTray.checked;
    }
}

function changeConnectButton(Connect){
    if(Connect ===false){
        txtConnect.innerText = "Desconectar";
        btnConnect.classList.remove("btn-positive");
        btnConnect.classList.add("btn-negative");
    }else{
        txtConnect.innerText = "Conectar";
        btnConnect.classList.remove("btn-negative");
        btnConnect.classList.add("btn-positive");
    }
}



btnConnect.onclick = function(e) {
    if (txtConnect.innerText === "Conectar") {
        changeConnectButton(false)
        ipc.send('connect');
    }else{
        changeConnectButton(true)
        ipc.send('disconnect');        
    }
  }

  function showDefs(ShowMe){
    
      if(!ShowMe){
        myDefsForm.hidden = true
        logger.hidden = false
        btnDefs.classList.remove('btn-warning')
      }else{
        myDefsForm.hidden = false
        logger.hidden = true
        btnDefs.classList.add('btn-warning')
      }
      windowContent.scrollTop = windowContent.scrollHeight;

  }
  btnDefs.onclick = function(e) {
    if (!btnDefs.classList.contains('btn-warning')) {
        showDefs(true);
    }else{
        showDefs(false);
    }
  }

  btnOK.onclick = function(e){
    myDefsToControls(false)
    ipc.send('updateDefs',myDefs)
    showDefs(false);
    return false;

  }

  btnCancel.onclick = function(e){
    myDefsToControls(true);    
    showDefs(false);
    return false;
  }

  window.onload = function () {
    myDefsForm.hidden = true;
    ipc.send('PageTotalyLoaded');
}






