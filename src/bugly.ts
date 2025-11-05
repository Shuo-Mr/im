// Required - initialize bugsplat with database name, app name, and version
const electronLy = global['electron'];
import renderBug from 'bugsplat';

export function initBug(){
    let bugsplat = renderBug('Tigase_com', 'Tigase', '1.0.0')
    // The following optional api methods allow further customization
    bugsplat.setAppKey('renderer')
    bugsplat.setUser('Tigase')
    bugsplat.setEmail('Tigase@tig.com')
    bugsplat.setDescription('description')
    bugsplat.setCallback((error: any, responseBody: any) => {
        // We recommend you quit your application when an uncaughtException occurs
        if (electronLy) {
            electronLy.ipcRenderer.send('rendererCrash')
        }

    });

    // setTimeout(()=>{
    //     bugsplat.post(new Error('foobar!'))
    // },30000);

    window.onerror = (messageOrEvent, source, lineno, colno, error) => {

        console.log(error);

        if (electronLy) {
            // electronLy.ipcRenderer.send('force-close',error)
        }
        // bugsplat.post(error)
    };
}

