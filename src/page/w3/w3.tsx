import React,{memo, useRef, useEffect, } from 'react';
import systemStore from '../../store/SystemStore'
const cache = {}

export const W3 = memo(function W3() {
    let ref = useRef(null)

    useEffect(() =>{
        const url = systemStore.tabBarConfigList.tabBarLinkUrl;
        let {current} = ref as any
        let iframe:any

        if(cache[url]){
            iframe = document.getElementById(cache[url]) as HTMLIFrameElement
        }else{
            cache[url] = Math.random().toString(36).substr(3)

            iframe =document.createElement('iframe')
            iframe.id = cache[url]
            iframe.style.border='0'
            iframe.style.zIndex='9'
            iframe.style.position='absolute'
            iframe.sandbox='allow-scripts allow-same-origin'
            iframe.src = url
            iframe.onerror= function(){
                cache[url]=null;
                document.body.removeChild(iframe)
             }
            document.body.appendChild(iframe)
        }

        function update() {
            let rect = current.getBoundingClientRect()
            iframe.style.width =rect.y==0?'100%': (rect.width + 'px')
            iframe.style.height = rect.height + 'px'
            iframe.style.left =(rect.y==0?'0': rect.x) + 'px'
            iframe.style.top = rect.y + 'px'
        }
        update();
        window.addEventListener('resize', update);

        return () =>{
            iframe.style.width = '0'
            iframe.style.height = '0'
            window.removeEventListener('resize', update)
        }
    }, [])

    return <div style={{ width: '100%', height: '100%' }} ref={ref}>loading...</div>
})