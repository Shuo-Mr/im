const md5= require('md5');
const { EOL, endianness } = require('os');
const { createHash } = require('crypto');
const { system, bios, baseboard, cpu, mem, osInfo, blockDevices } = require('systeminformation');

async function generateFingerprint(){
    const { manufacturer, model, serial, uuid } = await system();
    const { vendor, version: biosVersion, releaseDate } = await bios();
    const { manufacturer: boardManufacturer, model: boardModel, serial: boardSerial } = await baseboard();
    const { manufacturer: cpuManufacturer, brand, speedmax, cores, physicalCores, socket } = await cpu();
    const { total: memTotal } = await mem();
    const { platform, arch } = await osInfo();
    const devices = await blockDevices();
    const hdds = devices
        .filter(({ type, removable }: any) => type === 'disk' && !removable)
        .map(({ model, serial }: any) => model + serial);

    const fingerprintSegments = [
        EOL,
        endianness(),
        manufacturer,
        model,
        serial,
        uuid,
        vendor,
        biosVersion,
        releaseDate,
        boardManufacturer,
        boardModel,
        boardSerial,
        cpuManufacturer,
        brand,
        speedmax,
        cores,
        physicalCores,
        socket,
        memTotal,
        platform,
        arch,
        ...hdds,
    ];
    const fingerprintString = fingerprintSegments.join('');
    const fingerprintHash = createHash('sha512').update(fingerprintString);
    return md5(fingerprintHash.digest().toString('base64'));
}

exports.fingerprint = async function (){
    const finger = await generateFingerprint()
    return finger;
}