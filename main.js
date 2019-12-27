const { app, BrowserWindow,globalShortcut,ipcMain } = require('electron');
const path = require('path')
const url = require('url')

const { autoUpdater } = require('electron-updater');
 
// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win;

let uploadUrl= "https://www.xinyuestudio.com/download/";

let code = `
            try 
            {
              document.getElementById("gameContainer").style.width =document.body.clientWidth;
              document.getElementById("#canvas").width = document.body.clientWidth;              
              document.getElementById("gameContainer").style.height = document.documentElement.clientHeight;      
              document.getElementById("#canvas").height =  document.documentElement.clientHeight;
            }
            catch (err) 
            {
              console.log(err);
            }`
            ;

 

 


function createWindow () 
{
  // 创建浏览器窗口。
  win = new BrowserWindow({
     
    width: 940,
    height: 640,
    darkTheme:true,
    fullscreenable:true,
   backgroundColor:'#181818'
  })
  win.setMenu(null);
  win.setTitle("XinYueStudio");
  app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
  win.webContents.executeJavaScript(code);
  // 加载index.html文件
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true}));

  let FullScreenFlag=false;
   
  // 注册一个 'CommandOrControl+X' 的全局快捷键
  const ret = globalShortcut.register('F11', () => {
    if(win)
    {
      FullScreenFlag=!FullScreenFlag;
      win.setFullScreen(FullScreenFlag);
    }
  });
  
 
   
  win.on( 'resize', function(e) {
    win.webContents.executeJavaScript(code);        
  })

 
  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    
    // 注销快捷键
  globalShortcut.unregister('F11')

  // 注销所有快捷键
  globalShortcut.unregisterAll()
   
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null
  })

  autoUpdater.checkForUpdatesAndNotify();

 
}

   
  
// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});


// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。