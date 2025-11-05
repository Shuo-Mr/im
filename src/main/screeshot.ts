/** @format */

import * as child from 'child_process';
import * as os from 'os';
import { globalShortcut } from 'electron';
import { getExtPluginsPath } from './util';


function openMac(event: Electron.IpcMainEvent) {


    let infoPath = getExtPluginsPath('screeshot/set.info');
    let resPath = getExtPluginsPath('screeshot/response.info');

    let screenShotExtPaths = getExtPluginsPath('screeshot/ScreenCapture.app/Contents/MacOS/ScreenCapture');
    let screenShotPatharam = ['startfromlocal,' + infoPath + ',' + resPath + ',0,3,0,0,0,0,0'];


    let screeshot_process = child.spawn(screenShotExtPaths, screenShotPatharam, { stdio: 'inherit' });

    screeshot_process.on('close', function (code) {
        if (code === null) return;
        globalShortcut.unregister('esc');
    });

    globalShortcut.register('esc', () => {
        screeshot_process.kill();
        globalShortcut.unregister('esc');
    });
}

function openWindow(event: Electron.IpcMainEvent) {
    let screenShotExePath = getExtPluginsPath('screeshot/PrScrn.exe');
    child.execFile(screenShotExePath, function (err: any) {

    });
}

export function startScreenshot(event:any) {
    if (os.platform() === 'win32') {
        openWindow(event);
    } else {
        openMac(event);
    }
}
