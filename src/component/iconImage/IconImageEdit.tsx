import * as React from 'react';

export interface IIconImgEditProps {
    size: number,
    img: any,
    marginSize?: number,
    classN?: string,
    onClick?: () => void
}

export function IconImgEdit(props: IIconImgEditProps) {
    // console.log('左侧样式',props.marginSize);
    
  let  imgStyle = {
        maxWidth: props.size + 'px',
         maxHeight: props.size + 'px',
          marginLeft: props.marginSize != undefined? props.marginSize + 'px' : '8px' ,
          marginRight: props.marginSize != undefined? props.marginSize + 'px' : '8px' ,
          WebkitUserDrag: "none"
    }
    return (
        <img
            className = {props.classN}
            onClick = {props.onClick}
            src={props.img} alt=""
            style={{...imgStyle}}
        />
    );
}
