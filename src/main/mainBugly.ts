
import { app } from 'electron';
import electron = require('electron');
const bugFun = require('bugsplat');

// Required - initialize bugsplat with database name, app name, and version

export function mainBugly() {
    const bugsplat = bugFun('nihaofht_126_com', 'Tigase', '1.0.0')
    bugsplat.setAppKey('main')
    bugsplat.setUser('Tigase')
    bugsplat.setEmail('Tigase@tig.com')
    bugsplat.setDescription('description')
    bugsplat.setCallback((error: any, responseBody: any) => {
        if (app) {
            app.quit();
        }
    })
    electron.ipcMain.on("rendererCrash",()=>{
        if (app) {
            app.quit();
        }
    });
    process.on('unhandledRejection', bugsplat.post)
    process.on('uncaughtException', bugsplat.post)

    electron.crashReporter.start({
        companyName: 'tig',
        productName: 'Tigase',
        submitURL: 'http://nihaofht_126_com.bugsplat.com/post/bp/crash/postBP.php',
        autoSubmit: true,
        extra: {
            'prod': 'Tigase',
            'key': '1.0.0',
            'email': 'Tigase@tig.com',
            'comments': 'Tigase bugly'
        }
    } as any);

    // setTimeout(()=> process.crash(),20000);
}
