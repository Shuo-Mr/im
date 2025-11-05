

process.on('message', function (m) {
    console.log('message from parent:11111111 ' + JSON.stringify(m));
});
(global.process as any).send({ from: 'child' });