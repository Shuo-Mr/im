import * as React from 'react';
// import Icon from 'antd/es/icon';
import message from 'antd/es/message';
import Upload from 'antd/es/upload';
import './AvatarWithUpload.less'
import Avatar from 'antd/es/avatar';
import systemStore from '../../store/SystemStore';
// import  loginStore  from '../../store/LoginStore';
// import imsdk from '../../net/IMSDK';

function getBase64(img:any, callback:any) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file: any) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
}

export class AvatarWithUpload extends React.Component {
  state = {
    loading: false,
    imageUrl: ''
  };
  handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    
    if (info.file.status === 'done' && info.file.response && info.file.response.url) {
      // this.setState({
      //   imageUrl: info.file.response.url,
      //   loading: false,
      // })
      // console.log('地址===========================', info.file.response.url); // file 是当前正在上传的 单个 img

      
      //  console.log('返沪',res);
      // if (res) {
      //     message.success("上传成功");
      // } else {
      //     message.warn("上传失败");
      // }
       }
       if(info.file.status === 'done'){
        getBase64(info.file.originFileObj, (imageUrl:any) =>
        this.setState({
          imageUrl,
          loading: false,
        }),
      );
    
       }
     
      console.log('地址===========================', systemStore.userId,this.state.imageUrl); // file 是当前正在上传的 单个 img
    // await  imsdk.uploadAvata(systemStore.userId, this.state.imageUrl)
    }
 
 render() {
    const { imageUrl } = this.state;
    const uploadButton = (
      <div>
        {/* <Icon type={this.state.loading ? 'loading' : 'plus'} /> */}
          <Avatar icon="user" size={76} className="headavator" src={imageUrl} ></Avatar>
      </div>
    );

    return (
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
        // action={path}
        openFileDialogOnClick={false}
        beforeUpload={beforeUpload}
        onChange={this.handleChange}
      >
        {imageUrl ?  <Avatar icon="user" size={76} className="headavator" src={imageUrl} ></Avatar> : uploadButton}
        {/* {uploadButton} */}
      </Upload>
    );
  }
}

