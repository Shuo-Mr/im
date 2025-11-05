const fs = require('fs');
const moment = require('moment');
const cmd = require('child_process');
const path = require('path');
const concurrently = require('concurrently');
const inquirer = require('inquirer');
const colors = require('ansi-colors');

const nasName='0沟通IM';

const fixPathSpace = str => str.replace(/ /g, '\\ ');
const execSync = command => {
    console.log('Cmd:: ', command);
    return cmd.execSync(command);
};
const dest  = (...p) => path.resolve(__dirname, '../build', ...p)
let tipmsg = `
${colors.red('======================强烈声明=========================================')}
        现打包流程会修改一些文件，可能会引起工作区变动
        ${colors.red('打包过程勿修改文件！！！')}
        ${colors.red('打包过程勿修改文件！！！')}
        ${colors.red('打包过程勿修改文件！！！')}
${colors.red('======================强烈声明=========================================')}
`;

let tipQuestions = {
    name    : '___tip___',
    message : tipmsg,
    type    : 'confirm',
};

let projectQuestions = {
    message : '请输入NaS名(如20201119Fable)',
    name: 'name',
    default: "0沟通IM" // 默认值
};
let platformQuestions = {
    name    : 'platform',
    message : '选择平台',
    type    : 'checkbox',
    choices : [ 'Windows', 'Mac', 'Web', 'H5','Windows-Web'],
    default : [ 'Windows-Web' ],
};

let confirmQuestions = {
    name    : 'confirm',
    message : '确认打包？',
    type    : 'confirm',
};

function flow(){
    return inquirer.prompt([ tipQuestions, projectQuestions, platformQuestions, confirmQuestions ]).then(function(config){

        if (config.confirm && config.___tip___) {
            return config;
        } else {
            throw new Error('流程取消');
        }
    });
}

async function start(){
   let config= await flow();
   if(config){
    runTask(config)
   }else{
       console.log("流程取消");
       return;
   }


}

function runTask(){

  Promise.resolve()
    .then(() => console.log('\n准备工作已经完成，开始打包\n'))
    .then(() =>  concurrently([ 'npm:build-web-pc' ]))
    // .then(()=> concurrently(["npm:build-render"]))
    .then(()=>uploadPackTo223Nas())
    .catch(e => {
        console.log(e);
    });
}

let cbDataPackage=getPackageJson();
// let dmg = `${config.client.name}_${packageJson.version}.dmg`;"${name}-${version}.${ext}"
let exe = `${cbDataPackage.description}-Setup-${cbDataPackage.version}.exe`;

let now = moment();
let datePath = now.format('YYYYMMDD');

let remoteNas = `出包【持续更新】/沟通IM/${nasName}/PC/`;
let createDatePathCommand = `${remoteNas}${datePath}/`;
let serverPath = fixPathSpace(`/mnt/nas/${createDatePathCommand}`);
let nasUrlname =fixPathSpace(`${nasName}\\PC\\${datePath}\\`);


async function uploadPackTo223Nas(config){
    console.log('开始上传文件到NAS');
    //创建nas目录
    execSync(`ssh 223 mkdir -pv "${serverPath}"`);
    //nas上上传web-h5
    uploadWedAndH5();
    //上传win
    uploadWin();
    //钉钉提醒
    Notice();

}
function uploadWedAndH5(){
    try{
        fs.mkdirSync("build/web-h5")
    }catch{

    }

    moveToweb('web-h5');
    execSync(`${require('7zip-bin').path7za} a -tzip build/web-h5.zip ${dest('web-h5/*')}`);
    execSync(`ssh 223 rm -rf "/${serverPath+"web-h5.zip"}"`);
    execSync(`scp -r build/web-h5.zip 223:"/${serverPath+"web-h5.zip"}"`);

}

function uploadWin(){
    try{
        execSync(`scp  "${path.join('dist',exe)}" 223:"${serverPath}${exe}"`);
        execSync(`scp -r dist/win-unpacked 223:"${serverPath+"win-unpacked"}"`);
      }catch{
        console.log(colors.yellow("==============警告警告=================="));
        console.log(colors.red("文件上传失败，请手动上传！！！"))
        console.log(colors.yellow("=================End====================="))
         openNas(nasUrlname);
         openFile();
         return;
      }

}
function Notice(){
    let notice = [];
    notice.push(`【打包成功】 web-${cbDataPackage.version}`);

    notice.push(`【打包成功】 ${exe} `);



    console.log('上传成功，通知钉钉群');

    notice.push(`【出包地址】 \\\\NAS\\公共文件夹\\${createDatePathCommand.replace(/\//g, '\\')}`);
    autoNotice(notice, true);
}

function moveToweb(name){
    execSync(`mv build/common.js  build/${name}/`);
    execSync(`mv build/esdk-obs-browserjs-3.19.5.min.js  build/${name}/`);
    execSync(`mv build/static  build/${name}/`);
    execSync(`mv build/index.html  build/${name}/`);
}

// 读取package.json文件，缓存内容
function getPackageJson(){

    var _packageJson = fs.readFileSync('./package.json');

    return JSON.parse(_packageJson);
}

const Users = {
    李亚宁 : '18134444689',
    晓梅  : '18939517624',
    黄继承 : '13603982962',
    周铭杰 : '15036187965',
};

function autoNotice(notice, build_web){
    const NoticeUsers = [ Users['李亚宁'], Users['黄继承'], build_web && Users['周铭杰'] ]
        .filter(Boolean)
        .map(e => `@${e}`)
        .join(', ');

    notice.push(`【通知人员】${NoticeUsers}`);

    require('axios').post(
        'https://oapi.dingtalk.com/robot/send?access_token=bb72dd85891ed91fc3e4870cc08773e3a371aca437bdc982aba7385d02dd8662',
        {
            msgtype : 'text',
            text    : { content: notice.join('\n') },
            at      : {
                atMobiles : Object.values(Users),
                isAtAll   : false,
            },
        }
    );
}
//打开Nas地址
function openNas(urlname){
    try{
        // const { execSync } = require('child_process');
        execSync(`explorer \\\\Nas\\公共文件夹\\出包【持续更新】\\沟通IM\\${urlname}`);
    }catch(e){
        console.error(e);
    }

}
//打开本地打包地址
function openFile(){

    try{
        const { execSync } = require('child_process');
        execSync(`explorer dist`);
    }catch(e){
        console.error(e);
    }

}

runTask();
//  start();

//Notice();//钉钉提醒

// uploadWin();