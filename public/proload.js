/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main/renderer.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/charenc/charenc.js":
/*!*****************************************!*\
  !*** ./node_modules/charenc/charenc.js ***!
  \*****************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

module.exports = charenc;


/***/ }),

/***/ "./node_modules/crypt/crypt.js":
/*!*************************************!*\
  !*** ./node_modules/crypt/crypt.js ***!
  \*************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();


/***/ }),

/***/ "./node_modules/md5/md5.js":
/*!*********************************!*\
  !*** ./node_modules/md5/md5.js ***!
  \*********************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

(function(){
  var crypt = __webpack_require__(/*! crypt */ "./node_modules/crypt/crypt.js"),
      utf8 = __webpack_require__(/*! charenc */ "./node_modules/charenc/charenc.js").utf8,
      isBuffer = __webpack_require__(/*! is-buffer */ "./node_modules/md5/node_modules/is-buffer/index.js"),
      bin = __webpack_require__(/*! charenc */ "./node_modules/charenc/charenc.js").bin,

  // The core
  md5 = function (message, options) {
    // Convert to byte array
    if (message.constructor == String)
      if (options && options.encoding === 'binary')
        message = bin.stringToBytes(message);
      else
        message = utf8.stringToBytes(message);
    else if (isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message))
      message = message.toString();
    // else, assume byte array already

    var m = crypt.bytesToWords(message),
        l = message.length * 8,
        a =  1732584193,
        b = -271733879,
        c = -1732584194,
        d =  271733878;

    // Swap endian
    for (var i = 0; i < m.length; i++) {
      m[i] = ((m[i] <<  8) | (m[i] >>> 24)) & 0x00FF00FF |
             ((m[i] << 24) | (m[i] >>>  8)) & 0xFF00FF00;
    }

    // Padding
    m[l >>> 5] |= 0x80 << (l % 32);
    m[(((l + 64) >>> 9) << 4) + 14] = l;

    // Method shortcuts
    var FF = md5._ff,
        GG = md5._gg,
        HH = md5._hh,
        II = md5._ii;

    for (var i = 0; i < m.length; i += 16) {

      var aa = a,
          bb = b,
          cc = c,
          dd = d;

      a = FF(a, b, c, d, m[i+ 0],  7, -680876936);
      d = FF(d, a, b, c, m[i+ 1], 12, -389564586);
      c = FF(c, d, a, b, m[i+ 2], 17,  606105819);
      b = FF(b, c, d, a, m[i+ 3], 22, -1044525330);
      a = FF(a, b, c, d, m[i+ 4],  7, -176418897);
      d = FF(d, a, b, c, m[i+ 5], 12,  1200080426);
      c = FF(c, d, a, b, m[i+ 6], 17, -1473231341);
      b = FF(b, c, d, a, m[i+ 7], 22, -45705983);
      a = FF(a, b, c, d, m[i+ 8],  7,  1770035416);
      d = FF(d, a, b, c, m[i+ 9], 12, -1958414417);
      c = FF(c, d, a, b, m[i+10], 17, -42063);
      b = FF(b, c, d, a, m[i+11], 22, -1990404162);
      a = FF(a, b, c, d, m[i+12],  7,  1804603682);
      d = FF(d, a, b, c, m[i+13], 12, -40341101);
      c = FF(c, d, a, b, m[i+14], 17, -1502002290);
      b = FF(b, c, d, a, m[i+15], 22,  1236535329);

      a = GG(a, b, c, d, m[i+ 1],  5, -165796510);
      d = GG(d, a, b, c, m[i+ 6],  9, -1069501632);
      c = GG(c, d, a, b, m[i+11], 14,  643717713);
      b = GG(b, c, d, a, m[i+ 0], 20, -373897302);
      a = GG(a, b, c, d, m[i+ 5],  5, -701558691);
      d = GG(d, a, b, c, m[i+10],  9,  38016083);
      c = GG(c, d, a, b, m[i+15], 14, -660478335);
      b = GG(b, c, d, a, m[i+ 4], 20, -405537848);
      a = GG(a, b, c, d, m[i+ 9],  5,  568446438);
      d = GG(d, a, b, c, m[i+14],  9, -1019803690);
      c = GG(c, d, a, b, m[i+ 3], 14, -187363961);
      b = GG(b, c, d, a, m[i+ 8], 20,  1163531501);
      a = GG(a, b, c, d, m[i+13],  5, -1444681467);
      d = GG(d, a, b, c, m[i+ 2],  9, -51403784);
      c = GG(c, d, a, b, m[i+ 7], 14,  1735328473);
      b = GG(b, c, d, a, m[i+12], 20, -1926607734);

      a = HH(a, b, c, d, m[i+ 5],  4, -378558);
      d = HH(d, a, b, c, m[i+ 8], 11, -2022574463);
      c = HH(c, d, a, b, m[i+11], 16,  1839030562);
      b = HH(b, c, d, a, m[i+14], 23, -35309556);
      a = HH(a, b, c, d, m[i+ 1],  4, -1530992060);
      d = HH(d, a, b, c, m[i+ 4], 11,  1272893353);
      c = HH(c, d, a, b, m[i+ 7], 16, -155497632);
      b = HH(b, c, d, a, m[i+10], 23, -1094730640);
      a = HH(a, b, c, d, m[i+13],  4,  681279174);
      d = HH(d, a, b, c, m[i+ 0], 11, -358537222);
      c = HH(c, d, a, b, m[i+ 3], 16, -722521979);
      b = HH(b, c, d, a, m[i+ 6], 23,  76029189);
      a = HH(a, b, c, d, m[i+ 9],  4, -640364487);
      d = HH(d, a, b, c, m[i+12], 11, -421815835);
      c = HH(c, d, a, b, m[i+15], 16,  530742520);
      b = HH(b, c, d, a, m[i+ 2], 23, -995338651);

      a = II(a, b, c, d, m[i+ 0],  6, -198630844);
      d = II(d, a, b, c, m[i+ 7], 10,  1126891415);
      c = II(c, d, a, b, m[i+14], 15, -1416354905);
      b = II(b, c, d, a, m[i+ 5], 21, -57434055);
      a = II(a, b, c, d, m[i+12],  6,  1700485571);
      d = II(d, a, b, c, m[i+ 3], 10, -1894986606);
      c = II(c, d, a, b, m[i+10], 15, -1051523);
      b = II(b, c, d, a, m[i+ 1], 21, -2054922799);
      a = II(a, b, c, d, m[i+ 8],  6,  1873313359);
      d = II(d, a, b, c, m[i+15], 10, -30611744);
      c = II(c, d, a, b, m[i+ 6], 15, -1560198380);
      b = II(b, c, d, a, m[i+13], 21,  1309151649);
      a = II(a, b, c, d, m[i+ 4],  6, -145523070);
      d = II(d, a, b, c, m[i+11], 10, -1120210379);
      c = II(c, d, a, b, m[i+ 2], 15,  718787259);
      b = II(b, c, d, a, m[i+ 9], 21, -343485551);

      a = (a + aa) >>> 0;
      b = (b + bb) >>> 0;
      c = (c + cc) >>> 0;
      d = (d + dd) >>> 0;
    }

    return crypt.endian([a, b, c, d]);
  };

  // Auxiliary functions
  md5._ff  = function (a, b, c, d, x, s, t) {
    var n = a + (b & c | ~b & d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._gg  = function (a, b, c, d, x, s, t) {
    var n = a + (b & d | c & ~d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._hh  = function (a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._ii  = function (a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };

  // Package private blocksize
  md5._blocksize = 16;
  md5._digestsize = 16;

  module.exports = function (message, options) {
    if (message === undefined || message === null)
      throw new Error('Illegal argument ' + message);

    var digestbytes = crypt.wordsToBytes(md5(message, options));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt.bytesToHex(digestbytes);
  };

})();


/***/ }),

/***/ "./node_modules/md5/node_modules/is-buffer/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/md5/node_modules/is-buffer/index.js ***!
  \**********************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),

/***/ "./node_modules/systeminformation/lib/battery.js":
/*!*******************************************************!*\
  !*** ./node_modules/systeminformation/lib/battery.js ***!
  \*******************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check;
// ==================================================================================
// battery.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 6. Battery
// ----------------------------------------------------------------------------------

const exec = __webpack_require__(/*! child_process */ "child_process").exec;
const fs = __webpack_require__(/*! fs */ "fs");
const util = __webpack_require__(/*! ./util */ "./node_modules/systeminformation/lib/util.js");

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

module.exports = function (callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        hasbattery: false,
        cyclecount: 0,
        ischarging: false,
        designedcapacity: 0,
        maxcapacity: 0,
        currentcapacity: 0,
        voltage: 0,
        capacityUnit: '',
        percent: 0,
        timeremaining: -1,
        acconnected: true,
        type: '',
        model: '',
        manufacturer: '',
        serial: ''
      };

      if (_linux) {
        let battery_path = '';
        if (fs.existsSync('/sys/class/power_supply/BAT1/uevent')) {
          battery_path = '/sys/class/power_supply/BAT1/';
        } else if (fs.existsSync('/sys/class/power_supply/BAT0/uevent')) {
          battery_path = '/sys/class/power_supply/BAT0/';
        }
        if (battery_path) {
          fs.readFile(battery_path + 'uevent', function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');

              result.ischarging = (util.getValue(lines, 'POWER_SUPPLY_STATUS', '=').toLowerCase() === 'charging');
              result.acconnected = result.ischarging;
              result.voltage = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_VOLTAGE_NOW', '='), 10) / 1000000.0;
              result.capacityUnit = result.voltage ? 'mWh' : 'mAh';
              result.cyclecount = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_CYCLE_COUNT', '='), 10);
              result.maxcapacity = Math.round(parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_CHARGE_FULL', '='), 10) / 1000.0 / (result.voltage || 1));
              result.designedcapacity = Math.round(parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_CHARGE_FULL_DESIGN', '='), 10) / 1000.0 / (result.voltage || 1)) | result.maxcapacity;
              result.currentcapacity = Math.round(parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_CHARGE_NOW', '='), 10) / 1000.0 / (result.voltage || 1));
              if (!result.maxcapacity) {
                result.maxcapacity = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_ENERGY_FULL', '='), 10) / 1000.0;
                result.designcapacity = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_ENERGY_FULL_DESIGN', '='), 10) / 1000.0 | result.maxcapacity;
                result.currentcapacity = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_ENERGY_NOW', '='), 10) / 1000.0;
              }
              const percent = util.getValue(lines, 'POWER_SUPPLY_CAPACITY', '=');
              const energy = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_ENERGY_NOW', '='), 10);
              const power = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_POWER_NOW', '='), 10);
              const current = parseInt('0' + util.getValue(lines, 'POWER_SUPPLY_CURRENT_NOW', '='), 10);

              result.percent = parseInt('0' + percent, 10);
              if (result.maxcapacity && result.currentcapacity) {
                result.hasbattery = true;
                if (!percent) {
                  result.percent = 100.0 * result.currentcapacity / result.maxcapacity;
                }
              }
              if (result.ischarging) {
                result.hasbattery = true;
              }
              if (energy && power) {
                result.timeremaining = Math.floor(energy / power * 60);
              } else if (current && result.currentcapacity) {
                result.timeremaining = Math.floor(result.currentcapacity / current * 60);
              }
              result.type = util.getValue(lines, 'POWER_SUPPLY_TECHNOLOGY', '=');
              result.model = util.getValue(lines, 'POWER_SUPPLY_MODEL_NAME', '=');
              result.manufacturer = util.getValue(lines, 'POWER_SUPPLY_MANUFACTURER', '=');
              result.serial = util.getValue(lines, 'POWER_SUPPLY_SERIAL_NUMBER', '=');
              if (callback) { callback(result); }
              resolve(result);
            } else {
              if (callback) { callback(result); }
              resolve(result);
            }
          });
        } else {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
      if (_freebsd || _openbsd || _netbsd) {
        exec('sysctl hw.acpi.battery hw.acpi.acline', function (error, stdout) {
          let lines = stdout.toString().split('\n');
          const batteries = parseInt('0' + util.getValue(lines, 'hw.acpi.battery.units'), 10);
          const percent = parseInt('0' + util.getValue(lines, 'hw.acpi.battery.life'), 10);
          result.hasbattery = (batteries > 0);
          result.cyclecount = -1;
          result.ischarging = util.getValue(lines, 'hw.acpi.acline') !== '1';
          result.acconnected = result.ischarging;
          result.maxcapacity = -1;
          result.currentcapacity = -1;
          result.capacityUnit = 'unknown';
          result.percent = batteries ? percent : -1;
          if (callback) { callback(result); }
          resolve(result);
        });
      }

      if (_darwin) {
        exec('ioreg -n AppleSmartBattery -r | egrep "CycleCount|IsCharging|DesignCapacity|MaxCapacity|CurrentCapacity|BatterySerialNumber|TimeRemaining|Voltage"; pmset -g batt | grep %', function (error, stdout) {
          if (stdout) {
            let lines = stdout.toString().replace(/ +/g, '').replace(/"+/g, '').replace(/-/g, '').split('\n');
            result.cyclecount = parseInt('0' + util.getValue(lines, 'cyclecount', '='), 10);
            result.voltage = parseInt('0' + util.getValue(lines, 'voltage', '='), 10) / 1000.0;
            result.capacityUnit = result.voltage ? 'mWh' : 'mAh';
            result.maxcapacity = Math.round(parseInt('0' + util.getValue(lines, 'maxcapacity', '='), 10) * (result.voltage || 1));
            result.currentcapacity = Math.round(parseInt('0' + util.getValue(lines, 'currentcapacity', '='), 10) * (result.voltage || 1));
            result.designedcapacity = Math.round(parseInt('0' + util.getValue(lines, 'DesignCapacity', '='), 10) * (result.voltage || 1));
            result.manufacturer = 'Apple';
            result.serial = util.getValue(lines, 'BatterySerialNumber', '=');
            let percent = -1;
            const line = util.getValue(lines, 'internal', 'Battery');
            let parts = line.split(';');
            if (parts && parts[0]) {
              let parts2 = parts[0].split('\t');
              if (parts2 && parts2[1]) {
                percent = parseFloat(parts2[1].trim().replace(/%/g, ''));
              }
            }
            if (parts && parts[1]) {
              result.ischarging = (parts[1].trim() === 'charging');
              result.acconnected = (parts[1].trim() !== 'discharging');
            } else {
              result.ischarging = util.getValue(lines, 'ischarging', '=').toLowerCase() === 'yes';
              result.acconnected = result.ischarging;
            }
            if (result.maxcapacity && result.currentcapacity) {
              result.hasbattery = true;
              result.type = 'Li-ion';
              result.percent = percent !== -1 ? percent : Math.round(100.0 * result.currentcapacity / result.maxcapacity);
              if (!result.ischarging) {
                result.timeremaining = parseInt('0' + util.getValue(lines, 'TimeRemaining', '='), 10);
              }
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_windows) {
        try {
          util.wmic('Path Win32_Battery Get BatteryStatus, DesignCapacity, EstimatedChargeRemaining, DesignVoltage, FullChargeCapacity /value').then((stdout) => {
            if (stdout) {
              let lines = stdout.split('\r\n');
              let status = util.getValue(lines, 'BatteryStatus', '=').trim();
              // 1 = "Discharging"
              // 2 = "On A/C"
              // 3 = "Fully Charged"
              // 4 = "Low"
              // 5 = "Critical"
              // 6 = "Charging"
              // 7 = "Charging High"
              // 8 = "Charging Low"
              // 9 = "Charging Critical"
              // 10 = "Undefined"
              // 11 = "Partially Charged"
              if (status && status != '10') {
                const statusValue = parseInt(status);
                result.hasbattery = true;
                result.maxcapacity = parseInt(util.getValue(lines, 'DesignCapacity', '=') || 0);
                result.designcapacity = parseInt(util.getValue(lines, 'DesignCapacity', '=') || 0);
                result.voltage = parseInt(util.getValue(lines, 'DesignVoltage', '=') || 0) / 1000.0;
                result.capacityUnit = 'mWh';
                result.percent = parseInt(util.getValue(lines, 'EstimatedChargeRemaining', '=') || 0);
                result.currentcapacity = parseInt(result.maxcapacity * result.percent / 100);
                result.ischarging = (statusValue >= 6 && statusValue <= 9) || statusValue === 11 || (!(statusValue === 3) && !(statusValue === 1) && result.percent < 100);
                result.acconnected = result.ischarging || statusValue === 2;
              }
            }
            if (callback) { callback(result); }
            resolve(result);
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
};


/***/ }),

/***/ "./node_modules/systeminformation/lib/cpu.js":
/*!***************************************************!*\
  !*** ./node_modules/systeminformation/lib/cpu.js ***!
  \***************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// cpu.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 4. CPU
// ----------------------------------------------------------------------------------

const os = __webpack_require__(/*! os */ "os");
const exec = __webpack_require__(/*! child_process */ "child_process").exec;
const fs = __webpack_require__(/*! fs */ "fs");
const util = __webpack_require__(/*! ./util */ "./node_modules/systeminformation/lib/util.js");

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

let _cpu_speed = '0.00';
let _current_cpu = {
  user: 0,
  nice: 0,
  system: 0,
  idle: 0,
  irq: 0,
  load: 0,
  tick: 0,
  ms: 0,
  currentload: 0,
  currentload_user: 0,
  currentload_system: 0,
  currentload_nice: 0,
  currentload_idle: 0,
  currentload_irq: 0,
  raw_currentload: 0,
  raw_currentload_user: 0,
  raw_currentload_system: 0,
  raw_currentload_nice: 0,
  raw_currentload_idle: 0,
  raw_currentload_irq: 0
};
let _cpus = [];
let _corecount = 0;

const AMDBaseFrequencies = {
  '8346': '1.8',
  '8347': '1.9',
  '8350': '2.0',
  '8354': '2.2',
  '8356|SE': '2.4',
  '8356': '2.3',
  '8360': '2.5',
  '2372': '2.1',
  '2373': '2.1',
  '2374': '2.2',
  '2376': '2.3',
  '2377': '2.3',
  '2378': '2.4',
  '2379': '2.4',
  '2380': '2.5',
  '2381': '2.5',
  '2382': '2.6',
  '2384': '2.7',
  '2386': '2.8',
  '2387': '2.8',
  '2389': '2.9',
  '2393': '3.1',
  '8374': '2.2',
  '8376': '2.3',
  '8378': '2.4',
  '8379': '2.4',
  '8380': '2.5',
  '8381': '2.5',
  '8382': '2.6',
  '8384': '2.7',
  '8386': '2.8',
  '8387': '2.8',
  '8389': '2.9',
  '8393': '3.1',
  '2419EE': '1.8',
  '2423HE': '2.0',
  '2425HE': '2.1',
  '2427': '2.2',
  '2431': '2.4',
  '2435': '2.6',
  '2439SE': '2.8',
  '8425HE': '2.1',
  '8431': '2.4',
  '8435': '2.6',
  '8439SE': '2.8',
  '4122': '2.2',
  '4130': '2.6',
  '4162EE': '1.7',
  '4164EE': '1.8',
  '4170HE': '2.1',
  '4174HE': '2.3',
  '4176HE': '2.4',
  '4180': '2.6',
  '4184': '2.8',
  '6124HE': '1.8',
  '6128HE': '2.0',
  '6132HE': '2.2',
  '6128': '2.0',
  '6134': '2.3',
  '6136': '2.4',
  '6140': '2.6',
  '6164HE': '1.7',
  '6166HE': '1.8',
  '6168': '1.9',
  '6172': '2.1',
  '6174': '2.2',
  '6176': '2.3',
  '6176SE': '2.3',
  '6180SE': '2.5',
  '3250': '2.5',
  '3260': '2.7',
  '3280': '2.4',
  '4226': '2.7',
  '4228': '2.8',
  '4230': '2.9',
  '4234': '3.1',
  '4238': '3.3',
  '4240': '3.4',
  '4256': '1.6',
  '4274': '2.5',
  '4276': '2.6',
  '4280': '2.8',
  '4284': '3.0',
  '6204': '3.3',
  '6212': '2.6',
  '6220': '3.0',
  '6234': '2.4',
  '6238': '2.6',
  '6262HE': '1.6',
  '6272': '2.1',
  '6274': '2.2',
  '6276': '2.3',
  '6278': '2.4',
  '6282SE': '2.6',
  '6284SE': '2.7',
  '6308': '3.5',
  '6320': '2.8',
  '6328': '3.2',
  '6338P': '2.3',
  '6344': '2.6',
  '6348': '2.8',
  '6366': '1.8',
  '6370P': '2.0',
  '6376': '2.3',
  '6378': '2.4',
  '6380': '2.5',
  '6386': '2.8',
  'FX|4100': '3.6',
  'FX|4120': '3.9',
  'FX|4130': '3.8',
  'FX|4150': '3.8',
  'FX|4170': '4.2',
  'FX|6100': '3.3',
  'FX|6120': '3.6',
  'FX|6130': '3.6',
  'FX|6200': '3.8',
  'FX|8100': '2.8',
  'FX|8120': '3.1',
  'FX|8140': '3.2',
  'FX|8150': '3.6',
  'FX|8170': '3.9',
  'FX|4300': '3.8',
  'FX|4320': '4.0',
  'FX|4350': '4.2',
  'FX|6300': '3.5',
  'FX|6350': '3.9',
  'FX|8300': '3.3',
  'FX|8310': '3.4',
  'FX|8320': '3.5',
  'FX|8350': '4.0',
  'FX|8370': '4.0',
  'FX|9370': '4.4',
  'FX|9590': '4.7',
  'FX|8320E': '3.2',
  'FX|8370E': '3.3',
  '1950X': '3.4',
  '1920X': '3.5',
  '1920': '3.2',
  '1900X': '3.8',
  '1800X': '3.6',
  '1700X': '3.4',
  'Pro 1700X': '3.5',
  '1700': '3.0',
  'Pro 1700': '3.0',
  '1600X': '3.6',
  '1600': '3.2',
  'Pro 1600': '3.2',
  '1500X': '3.5',
  'Pro 1500': '3.5',
  '1400': '3.2',
  '1300X': '3.5',
  'Pro 1300': '3.5',
  '1200': '3.1',
  'Pro 1200': '3.1',
  '2200U': '2.5',
  '2300U': '2.0',
  'Pro 2300U': '2.0',
  '2500U': '2.0',
  'Pro 2500U': '2.2',
  '2700U': '2.0',
  'Pro 2700U': '2.2',
  '2600H': '3.2',
  '2800H': '3.3',
  '7601': '2.2',
  '7551': '2.0',
  '7501': '2.0',
  '74501': '2.3',
  '7401': '2.0',
  '7351': '2.4',
  '7301': '2.2',
  '7281': '2.1',
  '7251': '2.1',
  '7551P': '2.0',
  '7401P': '2.0',
  '7351P': '2.4',
  '2300X': '3.5',
  '2500X': '3.6',
  '2600': '3.4',
  '2600E': '3.1',
  '2600X': '3.6',
  '2700': '3.2',
  '2700E': '2.8',
  '2700X': '3.7',
  'Pro 2700X': '3.6',
  '2920': '3.5',
  '2950': '3.5',
  '2970WX': '3.0',
  '2990WX': '3.0',
  '3200U': '2.6',
  '3300U': '2.1',
  '3500U': '2.1',
  '3550H': '2.1',
  '3580U': '2.1',
  '3700U': '2.3',
  '3750H': '2.3',
  '3780U': '2.3',
  '3500X': '3.6',
  '3600': '3.6',
  'Pro 3600': '3.6',
  '3600X': '3.8',
  'Pro 3700': '3.6',
  '3700X': '3.6',
  '3800X': '3.9',
  '3900': '3.1',
  'Pro 3900': '3.1',
  '3900X': '3.8',
  '3950X': '3.5',
  '3960X': '3.8',
  '3970X': '3.7',
  '7232P': '3.1',
  '7302P': '3.0',
  '7402P': '2.8',
  '7502P': '2.5',
  '7702P': '2.0',
  '7252': '3.1',
  '7262': '3.2',
  '7272': '2.9',
  '7282': '2.8',
  '7302': '3.0',
  '7352': '2.3',
  '7402': '2.8',
  '7452': '2.35',
  '7502': '2.5',
  '7542': '2.9',
  '7552': '2.2',
  '7642': '2.3',
  '7702': '2.0',
  '7742': '2.25',
  '7H12': '2.6'
};

const socketTypes = {
  1: 'Other',
  2: 'Unknown',
  3: 'Daughter Board',
  4: 'ZIF Socket',
  5: 'Replacement/Piggy Back',
  6: 'None',
  7: 'LIF Socket',
  8: 'Slot 1',
  9: 'Slot 2',
  10: '370 Pin Socket',
  11: 'Slot A',
  12: 'Slot M',
  13: '423',
  14: 'A (Socket 462)',
  15: '478',
  16: '754',
  17: '940',
  18: '939',
  19: 'mPGA604',
  20: 'LGA771',
  21: 'LGA775',
  22: 'S1',
  23: 'AM2',
  24: 'F (1207)',
  25: 'LGA1366',
  26: 'G34',
  27: 'AM3',
  28: 'C32',
  29: 'LGA1156',
  30: 'LGA1567',
  31: 'PGA988A',
  32: 'BGA1288',
  33: 'rPGA988B',
  34: 'BGA1023',
  35: 'BGA1224',
  36: 'LGA1155',
  37: 'LGA1356',
  38: 'LGA2011',
  39: 'FS1',
  40: 'FS2',
  41: 'FM1',
  42: 'FM2',
  43: 'LGA2011-3',
  44: 'LGA1356-3',
  45: 'LGA1150',
  46: 'BGA1168',
  47: 'BGA1234',
  48: 'BGA1364',
  49: 'AM4',
  50: 'LGA1151',
  51: 'BGA1356',
  52: 'BGA1440',
  53: 'BGA1515',
  54: 'LGA3647-1',
  55: 'SP3',
  56: 'SP3r2',
  57: 'LGA2066',
  58: 'BGA1392',
  59: 'BGA1510',
  60: 'BGA1528'
};

function cpuBrandManufacturer(res) {
  res.brand = res.brand.replace(/\(R\)+/g, '®').replace(/\s+/g, ' ').trim();
  res.brand = res.brand.replace(/\(TM\)+/g, '™').replace(/\s+/g, ' ').trim();
  res.brand = res.brand.replace(/\(C\)+/g, '©').replace(/\s+/g, ' ').trim();
  res.brand = res.brand.replace(/CPU+/g, '').replace(/\s+/g, ' ').trim();
  res.manufacturer = res.brand.split(' ')[0];

  let parts = res.brand.split(' ');
  parts.shift();
  res.brand = parts.join(' ');
  return res;
}

function getAMDSpeed(brand) {
  let result = '0.00';
  for (let key in AMDBaseFrequencies) {
    if ({}.hasOwnProperty.call(AMDBaseFrequencies, key)) {
      let parts = key.split('|');
      let found = 0;
      parts.forEach(item => {
        if (brand.indexOf(item) > -1) {
          found++;
        }
      });
      if (found === parts.length) {
        result = AMDBaseFrequencies[key];
      }
    }
  }
  return result;
}

// --------------------------
// CPU - brand, speed

function getCpu() {

  return new Promise((resolve) => {
    process.nextTick(() => {
      const UNKNOWN = 'unknown';
      let result = {
        manufacturer: UNKNOWN,
        brand: UNKNOWN,
        vendor: '',
        family: '',
        model: '',
        stepping: '',
        revision: '',
        voltage: '',
        speed: '0.00',
        speedmin: '',
        speedmax: '',
        governor: '',
        cores: util.cores(),
        physicalCores: util.cores(),
        processors: 1,
        socket: '',
        cache: {}
      };
      if (_darwin) {
        exec('sysctl machdep.cpu hw.cpufrequency_max hw.cpufrequency_min hw.packages hw.physicalcpu_max hw.ncpu', function (error, stdout) {
          // if (!error) {
          let lines = stdout.toString().split('\n');
          const modelline = util.getValue(lines, 'machdep.cpu.brand_string');
          result.brand = modelline.split('@')[0].trim();
          result.speed = modelline.split('@')[1].trim();
          result.speed = parseFloat(result.speed.replace(/GHz+/g, '')).toFixed(2);
          _cpu_speed = result.speed;
          result = cpuBrandManufacturer(result);
          result.speedmin = (util.getValue(lines, 'hw.cpufrequency_min') / 1000000000.0).toFixed(2);
          result.speedmax = (util.getValue(lines, 'hw.cpufrequency_max') / 1000000000.0).toFixed(2);
          result.vendor = util.getValue(lines, 'machdep.cpu.vendor');
          result.family = util.getValue(lines, 'machdep.cpu.family');
          result.model = util.getValue(lines, 'machdep.cpu.model');
          result.stepping = util.getValue(lines, 'machdep.cpu.stepping');
          const countProcessors = util.getValue(lines, 'hw.packages');
          const countCores = util.getValue(lines, 'hw.physicalcpu_max');
          const countThreads = util.getValue(lines, 'hw.ncpu');
          if (countProcessors) {
            result.processors = parseInt(countProcessors) || 1;
          }
          if (countCores && countThreads) {
            result.cores = parseInt(countThreads) || util.cores();
            result.physicalCores = parseInt(countCores) || util.cores();
          }
          // }
          cpuCache().then(res => {
            result.cache = res;
            resolve(result);
          });
        });
      }
      if (_linux) {
        let modelline = '';
        let lines = [];
        if (os.cpus()[0] && os.cpus()[0].model) modelline = os.cpus()[0].model;
        exec('export LC_ALL=C; lscpu; echo -n "Governor: "; cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor 2>/dev/null; echo; unset LC_ALL', function (error, stdout) {
          if (!error) {
            lines = stdout.toString().split('\n');
          }
          modelline = util.getValue(lines, 'model name') || modelline;
          result.brand = modelline.split('@')[0].trim();
          result.speed = modelline.split('@')[1] ? parseFloat(modelline.split('@')[1].trim()).toFixed(2) : '0.00';
          if (result.speed === '0.00' && (result.brand.indexOf('AMD') > -1 || result.brand.toLowerCase().indexOf('ryzen') > -1)) {
            result.speed = getAMDSpeed(result.brand);
          }
          if (result.speed === '0.00') {
            let current = getCpuCurrentSpeedSync();
            if (current.avg !== 0) result.speed = current.avg.toFixed(2);
          }
          _cpu_speed = result.speed;
          result.speedmin = Math.round(parseFloat(util.getValue(lines, 'cpu min mhz').replace(/,/g, '.')) / 10.0) / 100;
          result.speedmin = result.speedmin ? parseFloat(result.speedmin).toFixed(2) : '';
          result.speedmax = Math.round(parseFloat(util.getValue(lines, 'cpu max mhz').replace(/,/g, '.')) / 10.0) / 100;
          result.speedmax = result.speedmax ? parseFloat(result.speedmax).toFixed(2) : '';

          result = cpuBrandManufacturer(result);
          result.vendor = util.getValue(lines, 'vendor id');
          // if (!result.vendor) { result.vendor = util.getValue(lines, 'anbieterkennung'); }
          result.family = util.getValue(lines, 'cpu family');
          // if (!result.family) { result.family = util.getValue(lines, 'prozessorfamilie'); }
          result.model = util.getValue(lines, 'model:');
          // if (!result.model) { result.model = util.getValue(lines, 'modell:'); }
          result.stepping = util.getValue(lines, 'stepping');
          result.revision = util.getValue(lines, 'cpu revision');
          result.cache.l1d = util.getValue(lines, 'l1d cache');
          if (result.cache.l1d) { result.cache.l1d = parseInt(result.cache.l1d) * (result.cache.l1d.indexOf('K') !== -1 ? 1024 : 1); }
          result.cache.l1i = util.getValue(lines, 'l1i cache');
          if (result.cache.l1i) { result.cache.l1i = parseInt(result.cache.l1i) * (result.cache.l1i.indexOf('K') !== -1 ? 1024 : 1); }
          result.cache.l2 = util.getValue(lines, 'l2 cache');
          if (result.cache.l2) { result.cache.l2 = parseInt(result.cache.l2) * (result.cache.l2.indexOf('K') !== -1 ? 1024 : 1); }
          result.cache.l3 = util.getValue(lines, 'l3 cache');
          if (result.cache.l3) { result.cache.l3 = parseInt(result.cache.l3) * (result.cache.l3.indexOf('K') !== -1 ? 1024 : 1); }

          const threadsPerCore = util.getValue(lines, 'thread(s) per core') || '1';
          const processors = util.getValue(lines, 'socket(s)') || '1';
          let threadsPerCoreInt = parseInt(threadsPerCore, 10);
          let processorsInt = parseInt(processors, 10);
          result.physicalCores = result.cores / threadsPerCoreInt;
          result.processors = processorsInt;
          result.governor = util.getValue(lines, 'governor') || '';

          // socket type
          let lines2 = [];
          exec('export LC_ALL=C; dmidecode –t 4 2>/dev/null | grep "Upgrade: Socket"; unset LC_ALL', function (error2, stdout2) {
            lines2 = stdout2.toString().split('\n');
            if (lines2 && lines2.length) {
              result.socket = util.getValue(lines2, 'Upgrade').replace('Socket', '').trim();
            }
            resolve(result);
          });
        });
      }
      if (_freebsd || _openbsd || _netbsd) {
        let modelline = '';
        let lines = [];
        if (os.cpus()[0] && os.cpus()[0].model) modelline = os.cpus()[0].model;
        exec('export LC_ALL=C; dmidecode -t 4 2>/dev/null; dmidecode -t 7 2>/dev/null; unset LC_ALL', function (error, stdout) {
          let cache = [];
          if (!error) {
            const data = stdout.toString().split('# dmidecode');
            const processor = data.length > 0 ? data[1] : '';
            cache = data.length > 1 ? data[2].split('Cache Information') : [];

            lines = processor.split('\n');
          }
          result.brand = modelline.split('@')[0].trim();
          result.speed = modelline.split('@')[1] ? parseFloat(modelline.split('@')[1].trim()).toFixed(2) : '0.00';
          if (result.speed === '0.00' && (result.brand.indexOf('AMD') > -1 || result.brand.toLowerCase().indexOf('ryzen') > -1)) {
            result.speed = getAMDSpeed(result.brand);
          }
          if (result.speed === '0.00') {
            let current = getCpuCurrentSpeedSync();
            if (current.avg !== 0) result.speed = current.avg.toFixed(2);
          }
          _cpu_speed = result.speed;
          result.speedmin = '';
          result.speedmax = Math.round(parseFloat(util.getValue(lines, 'max speed').replace(/Mhz/g, '')) / 10.0) / 100;
          result.speedmax = result.speedmax ? parseFloat(result.speedmax).toFixed(2) : '';

          result = cpuBrandManufacturer(result);
          result.vendor = util.getValue(lines, 'manufacturer');
          let sig = util.getValue(lines, 'signature');
          sig = sig.split(',');
          for (var i = 0; i < sig.length; i++) {
            sig[i] = sig[i].trim();
          }
          result.family = util.getValue(sig, 'Family', ' ', true);
          result.model = util.getValue(sig, 'Model', ' ', true);
          result.stepping = util.getValue(sig, 'Stepping', ' ', true);
          result.revision = '';
          const voltage = parseFloat(util.getValue(lines, 'voltage'));
          result.voltage = isNaN(voltage) ? '' : voltage.toFixed(2);
          for (let i = 0; i < cache.length; i++) {
            lines = cache[i].split('\n');
            let cacheType = util.getValue(lines, 'Socket Designation').toLowerCase().replace(' ', '-').split('-');
            cacheType = cacheType.length ? cacheType[0] : '';
            const sizeParts = util.getValue(lines, 'Installed Size').split(' ');
            let size = parseInt(sizeParts[0], 10);
            const unit = sizeParts.length > 1 ? sizeParts[1] : 'kb';
            size = size * (unit === 'kb' ? 1024 : (unit === 'mb' ? 1024 * 1024 : (unit === 'gb' ? 1024 * 1024 * 1024 : 1)));
            if (cacheType) {
              if (cacheType === 'l1') {
                result.cache[cacheType + 'd'] = size / 2;
                result.cache[cacheType + 'i'] = size / 2;
              } else {
                result.cache[cacheType] = size;
              }
            }
          }
          // socket type
          result.socket = util.getValue(lines, 'Upgrade').replace('Socket', '').trim();
          // # threads / # cores
          const threadCount = util.getValue(lines, 'thread count').trim();
          const coreCount = util.getValue(lines, 'core count').trim();
          if (coreCount && threadCount) {
            result.cores = threadCount;
            result.physicalCores = coreCount;
          }
          resolve(result);
        });
      }
      if (_sunos) {
        resolve(result);
      }
      if (_windows) {
        try {
          util.wmic('cpu get /value').then((stdout, error) => {
            if (!error) {
              let lines = stdout.split('\r\n');
              let name = util.getValue(lines, 'name', '=') || '';
              if (name.indexOf('@') >= 0) {
                result.brand = name.split('@')[0].trim();
                result.speed = name.split('@')[1] ? parseFloat(name.split('@')[1].trim()).toFixed(2) : '0.00';
                _cpu_speed = result.speed;
              } else {
                result.brand = name.trim();
                result.speed = '0.00';
              }
              result = cpuBrandManufacturer(result);
              result.revision = util.getValue(lines, 'revision', '=');
              result.cache.l1d = 0;
              result.cache.l1i = 0;
              result.cache.l2 = util.getValue(lines, 'l2cachesize', '=');
              result.cache.l3 = util.getValue(lines, 'l3cachesize', '=');
              if (result.cache.l2) { result.cache.l2 = parseInt(result.cache.l2, 10) * 1024; }
              if (result.cache.l3) { result.cache.l3 = parseInt(result.cache.l3, 10) * 1024; }
              result.vendor = util.getValue(lines, 'manufacturer', '=');
              result.speedmax = Math.round(parseFloat(util.getValue(lines, 'maxclockspeed', '=').replace(/,/g, '.')) / 10.0) / 100;
              result.speedmax = result.speedmax ? parseFloat(result.speedmax).toFixed(2) : '';
              if (result.speed === '0.00' && (result.brand.indexOf('AMD') > -1 || result.brand.toLowerCase().indexOf('ryzen') > -1)) {
                result.speed = getAMDSpeed(result.brand);
              }
              if (result.speed === '0.00') {
                result.speed = result.speedmax;
              }

              let description = util.getValue(lines, 'description', '=').split(' ');
              for (let i = 0; i < description.length; i++) {
                if (description[i].toLowerCase().startsWith('family') && (i + 1) < description.length && description[i + 1]) {
                  result.family = description[i + 1];
                }
                if (description[i].toLowerCase().startsWith('model') && (i + 1) < description.length && description[i + 1]) {
                  result.model = description[i + 1];
                }
                if (description[i].toLowerCase().startsWith('stepping') && (i + 1) < description.length && description[i + 1]) {
                  result.stepping = description[i + 1];
                }
              }
              // socket type
              const socketId = util.getValue(lines, 'UpgradeMethod', '=');
              if (socketTypes[socketId]) {
                result.socket = socketTypes[socketId];
              }
              // # threads / # cores
              const countProcessors = util.countLines(lines, 'Caption');
              const countThreads = util.getValue(lines, 'NumberOfLogicalProcessors', '=');
              const countCores = util.getValue(lines, 'NumberOfCores', '=');
              if (countProcessors) {
                result.processors = parseInt(countProcessors) || 1;
              }
              if (countCores && countThreads) {
                result.cores = parseInt(countThreads) || util.cores();
                result.physicalCores = parseInt(countCores) || util.cores();
              }
              if (countProcessors > 1) {
                result.cores = result.cores * countProcessors;
                result.physicalCores = result.physicalCores * countProcessors;
              }
            }
            util.wmic('path Win32_CacheMemory get CacheType,InstalledSize,Purpose').then((stdout, error) => {
              if (!error) {
                let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
                lines.forEach(function (line) {
                  if (line !== '') {
                    line = line.trim().split(/\s\s+/);
                    // L1 Instructions
                    if (line[2] === 'L1 Cache' && line[0] === '3') {
                      result.cache.l1i = parseInt(line[1], 10);
                    }
                    // L1 Data
                    if (line[2] === 'L1 Cache' && line[0] === '4') {
                      result.cache.l1d = parseInt(line[1], 10);
                    }
                  }
                });
              }
              resolve(result);
            });
          });
        } catch (e) {
          resolve(result);
        }
      }
    });
  });
}

// --------------------------
// CPU - Processor Data

function cpu(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      getCpu().then(result => {
        if (callback) { callback(result); }
        resolve(result);
      });
    });
  });
}

exports.cpu = cpu;

// --------------------------
// CPU - current speed - in GHz

function getCpuCurrentSpeedSync() {

  let cpus = os.cpus();
  let minFreq = 999999999;
  let maxFreq = 0;
  let avgFreq = 0;
  let cores = [];

  if (cpus.length) {
    for (let i in cpus) {
      if ({}.hasOwnProperty.call(cpus, i)) {
        avgFreq = avgFreq + cpus[i].speed;
        if (cpus[i].speed > maxFreq) maxFreq = cpus[i].speed;
        if (cpus[i].speed < minFreq) minFreq = cpus[i].speed;
      }
      cores.push(parseFloat(((cpus[i].speed + 1) / 1000).toFixed(2)));
    }
    avgFreq = avgFreq / cpus.length;
    return {
      min: parseFloat(((minFreq + 1) / 1000).toFixed(2)),
      max: parseFloat(((maxFreq + 1) / 1000).toFixed(2)),
      avg: parseFloat(((avgFreq + 1) / 1000).toFixed(2)),
      cores: cores
    };
  } else {
    return {
      min: 0,
      max: 0,
      avg: 0,
      cores: cores
    };
  }
}

function cpuCurrentspeed(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = getCpuCurrentSpeedSync();
      if (result.avg === 0 && _cpu_speed !== '0.00') {
        const currCpuSpeed = parseFloat(_cpu_speed);
        result = {
          min: currCpuSpeed,
          max: currCpuSpeed,
          avg: currCpuSpeed,
          cores: []
        };
      }
      if (callback) { callback(result); }
      resolve(result);
    });
  });
}

exports.cpuCurrentspeed = cpuCurrentspeed;

// --------------------------
// CPU - temperature
// if sensors are installed

function cpuTemperature(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        main: -1.0,
        cores: [],
        max: -1.0
      };
      if (_linux) {
        exec('sensors', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            lines.forEach(function (line) {
              let regex = /[+-]([^°]*)/g;
              let temps = line.match(regex);
              let firstPart = line.split(':')[0].toUpperCase();
              if (firstPart.indexOf('PHYSICAL') !== -1 || firstPart.indexOf('PACKAGE') !== -1) {
                result.main = parseFloat(temps);
              }
              if (firstPart.indexOf('CORE ') !== -1) {
                result.cores.push(parseFloat(temps));
              }
            });
            if (result.cores.length > 0) {
              let maxtmp = Math.max.apply(Math, result.cores);
              result.max = (maxtmp > result.main) ? maxtmp : result.main;
            }
            if (callback) { callback(result); }
            resolve(result);
          } else {
            fs.stat('/sys/class/thermal/thermal_zone0/temp', function (err) {
              if (err === null) {
                fs.readFile('/sys/class/thermal/thermal_zone0/temp', function (error, stdout) {
                  if (!error) {
                    let lines = stdout.toString().split('\n');
                    if (lines.length > 0) {
                      result.main = parseFloat(lines[0]) / 1000.0;
                      result.max = result.main;
                    }
                  }
                  if (callback) { callback(result); }
                  resolve(result);
                });
              } else {
                exec('/opt/vc/bin/vcgencmd measure_temp', function (error, stdout) {
                  if (!error) {
                    let lines = stdout.toString().split('\n');
                    if (lines.length > 0 && lines[0].indexOf('=')) {
                      result.main = parseFloat(lines[0].split('=')[1]);
                      result.max = result.main;
                    }
                  }
                  if (callback) { callback(result); }
                  resolve(result);
                });
              }
            });

          }
        });
      }
      if (_freebsd || _openbsd || _netbsd) {
        exec('sysctl dev.cpu | grep temp', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            let sum = 0;
            lines.forEach(function (line) {
              const parts = line.split(':');
              if (parts.length > 0) {
                const temp = parseFloat(parts[1].replace(',', '.'));
                if (temp > result.max) result.max = temp;
                sum = sum + temp;
                result.cores.push(temp);
              }
            });
            if (result.cores.length) {
              result.main = Math.round(sum / result.cores.length * 100) / 100;
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_darwin) {
        let osxTemp = null;
        try {
          osxTemp = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"osx-temperature-sensor\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
        } catch (er) {
          osxTemp = null;
        }
        if (osxTemp) {
          result = osxTemp.cpuTemperature();
        }

        if (callback) { callback(result); }
        resolve(result);
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_windows) {
        try {
          util.wmic('/namespace:\\\\root\\wmi PATH MSAcpi_ThermalZoneTemperature get CurrentTemperature').then((stdout, error) => {
            if (!error) {
              let sum = 0;
              let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
              lines.forEach(function (line) {
                let value = (parseInt(line, 10) - 2732) / 10;
                sum = sum + value;
                if (value > result.max) result.max = value;
                result.cores.push(value);
              });
              if (result.cores.length) {
                result.main = sum / result.cores.length;
              }
            }
            if (callback) { callback(result); }
            resolve(result);
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.cpuTemperature = cpuTemperature;

// --------------------------
// CPU Flags

function cpuFlags(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = '';
      if (_windows) {
        try {
          exec('reg query "HKEY_LOCAL_MACHINE\\HARDWARE\\DESCRIPTION\\System\\CentralProcessor\\0" /v FeatureSet', util.execOptsWin, function (error, stdout) {
            if (!error) {
              let flag_hex = stdout.split('0x').pop().trim();
              let flag_bin_unpadded = parseInt(flag_hex, 16).toString(2);
              let flag_bin = '0'.repeat(32 - flag_bin_unpadded.length) + flag_bin_unpadded;
              // empty flags are the reserved fields in the CPUID feature bit list
              // as found on wikipedia:
              // https://en.wikipedia.org/wiki/CPUID
              let all_flags = [
                'fpu', 'vme', 'de', 'pse', 'tsc', 'msr', 'pae', 'mce', 'cx8', 'apic',
                '', 'sep', 'mtrr', 'pge', 'mca', 'cmov', 'pat', 'pse-36', 'psn', 'clfsh',
                '', 'ds', 'acpi', 'mmx', 'fxsr', 'sse', 'sse2', 'ss', 'htt', 'tm', 'ia64', 'pbe'
              ];
              for (let f = 0; f < all_flags.length; f++) {
                if (flag_bin[f] === '1' && all_flags[f] !== '') {
                  result += ' ' + all_flags[f];
                }
              }
              result = result.trim();
            }
            if (callback) { callback(result); }
            resolve(result);
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
      if (_linux) {
        exec('export LC_ALL=C; lscpu; unset LC_ALL', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            lines.forEach(function (line) {
              if (line.split(':')[0].toUpperCase().indexOf('FLAGS') !== -1) {
                result = line.split(':')[1].trim().toLowerCase();
              }
            });
          }
          if (!result) {
            fs.readFile('/proc/cpuinfo', function (error, stdout) {
              if (!error) {
                let lines = stdout.toString().split('\n');
                result = util.getValue(lines, 'features', ':', true).toLowerCase();
              }
              if (callback) { callback(result); }
              resolve(result);
            });
          } else {
            if (callback) { callback(result); }
            resolve(result);
          }
        });
      }
      if (_freebsd || _openbsd || _netbsd) {
        exec('export LC_ALL=C; dmidecode -t 4 2>/dev/null; unset LC_ALL', function (error, stdout) {
          let flags = [];
          if (!error) {
            let parts = stdout.toString().split('\tFlags:');
            const lines = parts.length > 1 ? parts[1].split('\tVersion:')[0].split['\n'] : [];
            lines.forEach(function (line) {
              let flag = (line.indexOf('(') ? line.split('(')[0].toLowerCase() : '').trim().replace(/\t/g, '');
              if (flag) {
                flags.push(flag);
              }
            });
          }
          result = flags.join(' ').trim();
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_darwin) {
        exec('sysctl machdep.cpu.features', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            if (lines.length > 0 && lines[0].indexOf('machdep.cpu.features:') !== -1) {
              result = lines[0].split(':')[1].trim().toLowerCase();
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
    });
  });
}

exports.cpuFlags = cpuFlags;

// --------------------------
// CPU Cache

function cpuCache(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        l1d: -1,
        l1i: -1,
        l2: -1,
        l3: -1,
      };
      if (_linux) {
        exec('export LC_ALL=C; lscpu; unset LC_ALL', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            lines.forEach(function (line) {
              let parts = line.split(':');
              if (parts[0].toUpperCase().indexOf('L1D CACHE') !== -1) {
                result.l1d = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
              }
              if (parts[0].toUpperCase().indexOf('L1I CACHE') !== -1) {
                result.l1i = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
              }
              if (parts[0].toUpperCase().indexOf('L2 CACHE') !== -1) {
                result.l2 = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
              }
              if (parts[0].toUpperCase().indexOf('L3 CACHE') !== -1) {
                result.l3 = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
              }
            });
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_freebsd || _openbsd || _netbsd) {
        exec('export LC_ALL=C; dmidecode -t 7 2>/dev/null; unset LC_ALL', function (error, stdout) {
          let cache = [];
          if (!error) {
            const data = stdout.toString();
            cache = data.split('Cache Information');
            cache.shift();
          }
          for (let i = 0; i < cache.length; i++) {
            const lines = cache[i].split('\n');
            let cacheType = util.getValue(lines, 'Socket Designation').toLowerCase().replace(' ', '-').split('-');
            cacheType = cacheType.length ? cacheType[0] : '';
            const sizeParts = util.getValue(lines, 'Installed Size').split(' ');
            let size = parseInt(sizeParts[0], 10);
            const unit = sizeParts.length > 1 ? sizeParts[1] : 'kb';
            size = size * (unit === 'kb' ? 1024 : (unit === 'mb' ? 1024 * 1024 : (unit === 'gb' ? 1024 * 1024 * 1024 : 1)));
            if (cacheType) {
              if (cacheType === 'l1') {
                result.cache[cacheType + 'd'] = size / 2;
                result.cache[cacheType + 'i'] = size / 2;
              } else {
                result.cache[cacheType] = size;
              }
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_darwin) {
        exec('sysctl hw.l1icachesize hw.l1dcachesize hw.l2cachesize hw.l3cachesize', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            lines.forEach(function (line) {
              let parts = line.split(':');
              if (parts[0].toLowerCase().indexOf('hw.l1icachesize') !== -1) {
                result.l1d = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
              }
              if (parts[0].toLowerCase().indexOf('hw.l1dcachesize') !== -1) {
                result.l1i = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
              }
              if (parts[0].toLowerCase().indexOf('hw.l2cachesize') !== -1) {
                result.l2 = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
              }
              if (parts[0].toLowerCase().indexOf('hw.l3cachesize') !== -1) {
                result.l3 = parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
              }
            });
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_windows) {
        try {
          util.wmic('cpu get l2cachesize, l3cachesize /value').then((stdout, error) => {
            if (!error) {
              let lines = stdout.split('\r\n');
              result.l1d = 0;
              result.l1i = 0;
              result.l2 = util.getValue(lines, 'l2cachesize', '=');
              result.l3 = util.getValue(lines, 'l3cachesize', '=');
              if (result.l2) { result.l2 = parseInt(result.l2, 10) * 1024; }
              if (result.l3) { result.l3 = parseInt(result.l3, 10) * 1024; }
            }
            util.wmic('path Win32_CacheMemory get CacheType,InstalledSize,Purpose').then((stdout, error) => {
              if (!error) {
                let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
                lines.forEach(function (line) {
                  if (line !== '') {
                    line = line.trim().split(/\s\s+/);
                    // L1 Instructions
                    if (line[2] === 'L1 Cache' && line[0] === '3') {
                      result.l1i = parseInt(line[1], 10);
                    }
                    // L1 Data
                    if (line[2] === 'L1 Cache' && line[0] === '4') {
                      result.l1d = parseInt(line[1], 10);
                    }
                  }
                });
              }
              if (callback) { callback(result); }
              resolve(result);
            });
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.cpuCache = cpuCache;

// --------------------------
// CPU - current load - in %

function getLoad() {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let loads = os.loadavg().map(function (x) { return x / util.cores(); });
      let avgload = parseFloat((Math.max.apply(Math, loads)).toFixed(2));
      let result = {};

      let now = Date.now() - _current_cpu.ms;
      if (now >= 200) {
        _current_cpu.ms = Date.now();
        const cpus = os.cpus();
        let totalUser = 0;
        let totalSystem = 0;
        let totalNice = 0;
        let totalIrq = 0;
        let totalIdle = 0;
        let cores = [];
        _corecount = cpus.length;

        for (let i = 0; i < _corecount; i++) {
          const cpu = cpus[i].times;
          totalUser += cpu.user;
          totalSystem += cpu.sys;
          totalNice += cpu.nice;
          totalIdle += cpu.idle;
          totalIrq += cpu.irq;
          let tmp_tick = (_cpus && _cpus[i] && _cpus[i].totalTick ? _cpus[i].totalTick : 0);
          let tmp_load = (_cpus && _cpus[i] && _cpus[i].totalLoad ? _cpus[i].totalLoad : 0);
          let tmp_user = (_cpus && _cpus[i] && _cpus[i].user ? _cpus[i].user : 0);
          let tmp_system = (_cpus && _cpus[i] && _cpus[i].sys ? _cpus[i].sys : 0);
          let tmp_nice = (_cpus && _cpus[i] && _cpus[i].nice ? _cpus[i].nice : 0);
          let tmp_idle = (_cpus && _cpus[i] && _cpus[i].idle ? _cpus[i].idle : 0);
          let tmp_irq = (_cpus && _cpus[i] && _cpus[i].irq ? _cpus[i].irq : 0);
          _cpus[i] = cpu;
          _cpus[i].totalTick = _cpus[i].user + _cpus[i].sys + _cpus[i].nice + _cpus[i].irq + _cpus[i].idle;
          _cpus[i].totalLoad = _cpus[i].user + _cpus[i].sys + _cpus[i].nice + _cpus[i].irq;
          _cpus[i].currentTick = _cpus[i].totalTick - tmp_tick;
          _cpus[i].load = (_cpus[i].totalLoad - tmp_load);
          _cpus[i].load_user = (_cpus[i].user - tmp_user);
          _cpus[i].load_system = (_cpus[i].sys - tmp_system);
          _cpus[i].load_nice = (_cpus[i].nice - tmp_nice);
          _cpus[i].load_idle = (_cpus[i].idle - tmp_idle);
          _cpus[i].load_irq = (_cpus[i].irq - tmp_irq);
          cores[i] = {};
          cores[i].load = _cpus[i].load / _cpus[i].currentTick * 100;
          cores[i].load_user = _cpus[i].load_user / _cpus[i].currentTick * 100;
          cores[i].load_system = _cpus[i].load_system / _cpus[i].currentTick * 100;
          cores[i].load_nice = _cpus[i].load_nice / _cpus[i].currentTick * 100;
          cores[i].load_idle = _cpus[i].load_idle / _cpus[i].currentTick * 100;
          cores[i].load_irq = _cpus[i].load_irq / _cpus[i].currentTick * 100;
          cores[i].raw_load = _cpus[i].load;
          cores[i].raw_load_user = _cpus[i].load_user;
          cores[i].raw_load_system = _cpus[i].load_system;
          cores[i].raw_load_nice = _cpus[i].load_nice;
          cores[i].raw_load_idle = _cpus[i].load_idle;
          cores[i].raw_load_irq = _cpus[i].load_irq;
        }
        let totalTick = totalUser + totalSystem + totalNice + totalIrq + totalIdle;
        let totalLoad = totalUser + totalSystem + totalNice + totalIrq;
        let currentTick = totalTick - _current_cpu.tick;
        result = {
          avgload: avgload,
          currentload: (totalLoad - _current_cpu.load) / currentTick * 100,
          currentload_user: (totalUser - _current_cpu.user) / currentTick * 100,
          currentload_system: (totalSystem - _current_cpu.system) / currentTick * 100,
          currentload_nice: (totalNice - _current_cpu.nice) / currentTick * 100,
          currentload_idle: (totalIdle - _current_cpu.idle) / currentTick * 100,
          currentload_irq: (totalIrq - _current_cpu.irq) / currentTick * 100,
          raw_currentload: (totalLoad - _current_cpu.load),
          raw_currentload_user: (totalUser - _current_cpu.user),
          raw_currentload_system: (totalSystem - _current_cpu.system),
          raw_currentload_nice: (totalNice - _current_cpu.nice),
          raw_currentload_idle: (totalIdle - _current_cpu.idle),
          raw_currentload_irq: (totalIrq - _current_cpu.irq),
          cpus: cores
        };
        _current_cpu = {
          user: totalUser,
          nice: totalNice,
          system: totalSystem,
          idle: totalIdle,
          irq: totalIrq,
          tick: totalTick,
          load: totalLoad,
          ms: _current_cpu.ms,
          currentload: result.currentload,
          currentload_user: result.currentload_user,
          currentload_system: result.currentload_system,
          currentload_nice: result.currentload_nice,
          currentload_idle: result.currentload_idle,
          currentload_irq: result.currentload_irq,
          raw_currentload: result.raw_currentload,
          raw_currentload_user: result.raw_currentload_user,
          raw_currentload_system: result.raw_currentload_system,
          raw_currentload_nice: result.raw_currentload_nice,
          raw_currentload_idle: result.raw_currentload_idle,
          raw_currentload_irq: result.raw_currentload_irq,
        };
      } else {
        let cores = [];
        for (let i = 0; i < _corecount; i++) {
          cores[i] = {};
          cores[i].load = _cpus[i].load / _cpus[i].currentTick * 100;
          cores[i].load_user = _cpus[i].load_user / _cpus[i].currentTick * 100;
          cores[i].load_system = _cpus[i].load_system / _cpus[i].currentTick * 100;
          cores[i].load_nice = _cpus[i].load_nice / _cpus[i].currentTick * 100;
          cores[i].load_idle = _cpus[i].load_idle / _cpus[i].currentTick * 100;
          cores[i].load_irq = _cpus[i].load_irq / _cpus[i].currentTick * 100;
          cores[i].raw_load = _cpus[i].load;
          cores[i].raw_load_user = _cpus[i].load_user;
          cores[i].raw_load_system = _cpus[i].load_system;
          cores[i].raw_load_nice = _cpus[i].load_nice;
          cores[i].raw_load_idle = _cpus[i].load_idle;
          cores[i].raw_load_irq = _cpus[i].load_irq;
        }
        result = {
          avgload: avgload,
          currentload: _current_cpu.currentload,
          currentload_user: _current_cpu.currentload_user,
          currentload_system: _current_cpu.currentload_system,
          currentload_nice: _current_cpu.currentload_nice,
          currentload_idle: _current_cpu.currentload_idle,
          currentload_irq: _current_cpu.currentload_irq,
          raw_currentload: _current_cpu.raw_currentload,
          raw_currentload_user: _current_cpu.raw_currentload_user,
          raw_currentload_system: _current_cpu.raw_currentload_system,
          raw_currentload_nice: _current_cpu.raw_currentload_nice,
          raw_currentload_idle: _current_cpu.raw_currentload_idle,
          raw_currentload_irq: _current_cpu.raw_currentload_irq,
          cpus: cores
        };
      }
      resolve(result);
    });
  });
}

function currentLoad(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      getLoad().then(result => {
        if (callback) { callback(result); }
        resolve(result);
      });
    });
  });
}

exports.currentLoad = currentLoad;

// --------------------------
// PS - full load
// since bootup

function getFullLoad() {

  return new Promise((resolve) => {
    process.nextTick(() => {

      const cpus = os.cpus();
      let totalUser = 0;
      let totalSystem = 0;
      let totalNice = 0;
      let totalIrq = 0;
      let totalIdle = 0;

      for (let i = 0, len = cpus.length; i < len; i++) {
        const cpu = cpus[i].times;
        totalUser += cpu.user;
        totalSystem += cpu.sys;
        totalNice += cpu.nice;
        totalIrq += cpu.irq;
        totalIdle += cpu.idle;
      }
      let totalTicks = totalIdle + totalIrq + totalNice + totalSystem + totalUser;
      let result = (totalTicks - totalIdle) / totalTicks * 100.0;

      resolve(result);
    });
  });
}

function fullLoad(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      getFullLoad().then(result => {
        if (callback) { callback(result); }
        resolve(result);
      });
    });
  });
}

exports.fullLoad = fullLoad;


/***/ }),

/***/ "./node_modules/systeminformation/lib/docker.js":
/*!******************************************************!*\
  !*** ./node_modules/systeminformation/lib/docker.js ***!
  \******************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// docker.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 13. Docker
// ----------------------------------------------------------------------------------

const util = __webpack_require__(/*! ./util */ "./node_modules/systeminformation/lib/util.js");
const DockerSocket = __webpack_require__(/*! ./dockerSocket */ "./node_modules/systeminformation/lib/dockerSocket.js");

let _platform = process.platform;
const _windows = (_platform === 'win32');

let _docker_container_stats = {};
let _docker_socket;
let _docker_last_read = 0;


// --------------------------
// get containers (parameter all: get also inactive/exited containers)

function dockerInfo(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (!_docker_socket) {
        _docker_socket = new DockerSocket();
      }
      const result = {};

      _docker_socket.getInfo(data => {
        result.id = data.ID;
        result.containers = data.Containers;
        result.containersRunning = data.ContainersRunning;
        result.containersPaused = data.ContainersPaused;
        result.containersStopped = data.ContainersStopped;
        result.images = data.Images;
        result.driver = data.Driver;
        result.memoryLimit = data.MemoryLimit;
        result.swapLimit = data.SwapLimit;
        result.kernelMemory = data.KernelMemory;
        result.cpuCfsPeriod = data.CpuCfsPeriod;
        result.cpuCfsQuota = data.CpuCfsQuota;
        result.cpuShares = data.CPUShares;
        result.cpuSet = data.CPUSet;
        result.ipv4Forwarding = data.IPv4Forwarding;
        result.bridgeNfIptables = data.BridgeNfIptables;
        result.bridgeNfIp6tables = data.BridgeNfIp6tables;
        result.debug = data.Debug;
        result.nfd = data.NFd;
        result.oomKillDisable = data.OomKillDisable;
        result.ngoroutines = data.NGoroutines;
        result.systemTime = data.SystemTime;
        result.loggingDriver = data.LoggingDriver;
        result.cgroupDriver = data.CgroupDriver;
        result.nEventsListener = data.NEventsListener;
        result.kernelVersion = data.KernelVersion;
        result.pperatingSystem = data.OperatingSystem;
        result.osType = data.OSType;
        result.architecture = data.Architecture;
        result.ncpu = data.NCPU;
        result.memTotal = data.MemTotal;
        result.dockerRootDir = data.DockerRootDir;
        result.httpProxy = data.HttpProxy;
        result.httpsProxy = data.HttpsProxy;
        result.noProxy = data.NoProxy;
        result.name = data.Name;
        result.labels = data.Labels;
        result.experimentalBuild = data.ExperimentalBuild;
        result.serverVersion = data.ServerVersion;
        result.clusterStore = data.ClusterStore;
        result.clusterAdvertise = data.ClusterAdvertise;
        result.defaultRuntime = data.DefaultRuntime;
        result.liveRestoreEnabled = data.LiveRestoreEnabled;
        result.isolation = data.Isolation;
        result.initBinary = data.InitBinary;
        result.productLicense = data.ProductLicense;
        if (callback) { callback(result); }
        resolve(result);
      });
    });
  });
}

exports.dockerInfo = dockerInfo;

function dockerContainers(all, callback) {

  function inContainers(containers, id) {
    let filtered = containers.filter(obj => {
      /**
       * @namespace
       * @property {string}  Id
       */
      return (obj.Id && (obj.Id === id));
    });
    return (filtered.length > 0);
  }

  // fallback - if only callback is given
  if (util.isFunction(all) && !callback) {
    callback = all;
    all = false;
  }

  all = all || false;
  let result = [];
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (!_docker_socket) {
        _docker_socket = new DockerSocket();
      }
      const workload = [];

      _docker_socket.listContainers(all, data => {
        let docker_containers = {};
        try {
          docker_containers = data;
          if (docker_containers && Object.prototype.toString.call(docker_containers) === '[object Array]' && docker_containers.length > 0) {
            // GC in _docker_container_stats
            for (let key in _docker_container_stats) {
              if ({}.hasOwnProperty.call(_docker_container_stats, key)) {
                if (!inContainers(docker_containers, key)) delete _docker_container_stats[key];
              }
            }

            docker_containers.forEach(function (element) {

              if (element.Names && Object.prototype.toString.call(element.Names) === '[object Array]' && element.Names.length > 0) {
                element.Name = element.Names[0].replace(/^\/|\/$/g, '');
              }
              workload.push(dockerContainerInspect(element.Id.trim(), element));
              // result.push({
              //   id: element.Id,
              //   name: element.Name,
              //   image: element.Image,
              //   imageID: element.ImageID,
              //   command: element.Command,
              //   created: element.Created,
              //   state: element.State,
              //   ports: element.Ports,
              //   mounts: element.Mounts,
              //   // hostconfig: element.HostConfig,
              //   // network: element.NetworkSettings
              // });
            });
            if (workload.length) {
              Promise.all(
                workload
              ).then(data => {
                if (callback) { callback(data); }
                resolve(data);
              });
            } else {
              if (callback) { callback(result); }
              resolve(result);
            }
          }
        } catch (err) {
          // GC in _docker_container_stats
          for (let key in _docker_container_stats) {
            if ({}.hasOwnProperty.call(_docker_container_stats, key)) {
              if (!inContainers(docker_containers, key)) delete _docker_container_stats[key];
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        }
      });
    });
  });
}

// --------------------------
// container inspect (for one container)

function dockerContainerInspect(containerID, payload) {
  containerID = containerID || '';
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (containerID) {

        if (!_docker_socket) {
          _docker_socket = new DockerSocket();
        }

        _docker_socket.getInspect(containerID.trim(), data => {
          try {
            resolve({
              id: payload.Id,
              name: payload.Name,
              image: payload.Image,
              imageID: payload.ImageID,
              command: payload.Command,
              created: payload.Created,
              started: data.State && data.State.StartedAt ? Math.round(new Date(data.State.StartedAt).getTime() / 1000) : 0,
              finished: data.State && data.State.FinishedAt && !data.State.FinishedAt.startsWith('0001-01-01') ? Math.round(new Date(data.State.FinishedAt).getTime() / 1000) : 0,
              createdAt: data.Created ? data.Created : '',
              startedAt: data.State && data.State.StartedAt ? data.State.StartedAt : '',
              finishedAt: data.State && data.State.FinishedAt && !data.State.FinishedAt.startsWith('0001-01-01') ? data.State.FinishedAt : '',
              state: payload.State,
              restartCount: data.RestartCount || 0,
              platform: data.Platform || '',
              driver: data.Driver || '',
              ports: payload.Ports,
              mounts: payload.Mounts,
              // hostconfig: payload.HostConfig,
              // network: payload.NetworkSettings
            });
          } catch (err) {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  });
}

exports.dockerContainers = dockerContainers;

// --------------------------
// helper functions for calculation of docker stats

function docker_calcCPUPercent(cpu_stats, precpu_stats) {
  /**
   * @namespace
   * @property {object}  cpu_usage
   * @property {number}  cpu_usage.total_usage
   * @property {number}  system_cpu_usage
   * @property {object}  cpu_usage
   * @property {Array}  cpu_usage.percpu_usage
   */

  if (!_windows) {
    let cpuPercent = 0.0;
    // calculate the change for the cpu usage of the container in between readings
    let cpuDelta = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage;
    // calculate the change for the entire system between readings
    let systemDelta = cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage;

    if (systemDelta > 0.0 && cpuDelta > 0.0) {
      // calculate the change for the cpu usage of the container in between readings
      cpuPercent = (cpuDelta / systemDelta) * cpu_stats.cpu_usage.percpu_usage.length * 100.0;
    }

    return cpuPercent;
  } else {
    let nanoSecNow = util.nanoSeconds();
    let cpuPercent = 0.0;
    if (_docker_last_read > 0) {
      let possIntervals = (nanoSecNow - _docker_last_read); //  / 100 * os.cpus().length;
      let intervalsUsed = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage;
      if (possIntervals > 0) {
        cpuPercent = 100.0 * intervalsUsed / possIntervals;
      }
    }
    _docker_last_read = nanoSecNow;
    return cpuPercent;
  }
}

function docker_calcNetworkIO(networks) {
  let rx;
  let tx;
  for (let key in networks) {
    // skip loop if the property is from prototype
    if (!{}.hasOwnProperty.call(networks, key)) continue;

    /**
     * @namespace
     * @property {number}  rx_bytes
     * @property {number}  tx_bytes
     */
    let obj = networks[key];
    rx = +obj.rx_bytes;
    tx = +obj.tx_bytes;
  }
  return {
    rx: rx,
    tx: tx
  };
}

function docker_calcBlockIO(blkio_stats) {
  let result = {
    r: 0,
    w: 0
  };

  /**
   * @namespace
   * @property {Array}  io_service_bytes_recursive
   */
  if (blkio_stats && blkio_stats.io_service_bytes_recursive && Object.prototype.toString.call(blkio_stats.io_service_bytes_recursive) === '[object Array]' && blkio_stats.io_service_bytes_recursive.length > 0) {
    blkio_stats.io_service_bytes_recursive.forEach(function (element) {
      /**
       * @namespace
       * @property {string}  op
       * @property {number}  value
       */

      if (element.op && element.op.toLowerCase() === 'read' && element.value) {
        result.r += element.value;
      }
      if (element.op && element.op.toLowerCase() === 'write' && element.value) {
        result.w += element.value;
      }
    });
  }
  return result;
}

function dockerContainerStats(containerIDs, callback) {

  let containerArray = [];
  // fallback - if only callback is given
  if (util.isFunction(containerIDs) && !callback) {
    callback = containerIDs;
    containerArray = ['*'];
  } else {
    containerIDs = containerIDs || '*';
    containerIDs = containerIDs.trim().toLowerCase().replace(/,+/g, '|');
    containerArray = containerIDs.split('|');
  }

  return new Promise((resolve) => {
    process.nextTick(() => {

      const result = [];

      const workload = [];
      if (containerArray.length && containerArray[0].trim() === '*') {
        containerArray = [];
        dockerContainers().then(allContainers => {
          for (let container of allContainers) {
            containerArray.push(container.id);
          }
          dockerContainerStats(containerArray.join(',')).then(result => {
            if (callback) { callback(result); }
            resolve(result);
          });
        });
      } else {
        for (let containerID of containerArray) {
          workload.push(dockerContainerStatsSingle(containerID.trim()));
        }
        if (workload.length) {
          Promise.all(
            workload
          ).then(data => {
            if (callback) { callback(data); }
            resolve(data);
          });
        } else {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

// --------------------------
// container stats (for one container)

function dockerContainerStatsSingle(containerID) {
  containerID = containerID || '';
  let result = {
    id: containerID,
    mem_usage: 0,
    mem_limit: 0,
    mem_percent: 0,
    cpu_percent: 0,
    pids: 0,
    netIO: {
      rx: 0,
      wx: 0
    },
    blockIO: {
      r: 0,
      w: 0
    }
  };
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (containerID) {

        if (!_docker_socket) {
          _docker_socket = new DockerSocket();
        }

        _docker_socket.getInspect(containerID, dataInspect => {
          try {
            _docker_socket.getStats(containerID, data => {
              try {
                let stats = data;
                /**
                 * @namespace
                 * @property {Object}  memory_stats
                 * @property {number}  memory_stats.usage
                 * @property {number}  memory_stats.limit
                 * @property {Object}  cpu_stats
                 * @property {Object}  pids_stats
                 * @property {number}  pids_stats.current
                 * @property {Object}  networks
                 * @property {Object}  blkio_stats
                 */

                if (!stats.message) {
                  result.mem_usage = (stats.memory_stats && stats.memory_stats.usage ? stats.memory_stats.usage : 0);
                  result.mem_limit = (stats.memory_stats && stats.memory_stats.limit ? stats.memory_stats.limit : 0);
                  result.mem_percent = (stats.memory_stats && stats.memory_stats.usage && stats.memory_stats.limit ? stats.memory_stats.usage / stats.memory_stats.limit * 100.0 : 0);
                  result.cpu_percent = (stats.cpu_stats && stats.precpu_stats ? docker_calcCPUPercent(stats.cpu_stats, stats.precpu_stats) : 0);
                  result.pids = (stats.pids_stats && stats.pids_stats.current ? stats.pids_stats.current : 0);
                  result.restartCount = (dataInspect.RestartCount ? dataInspect.RestartCount : 0);
                  if (stats.networks) result.netIO = docker_calcNetworkIO(stats.networks);
                  if (stats.blkio_stats) result.blockIO = docker_calcBlockIO(stats.blkio_stats);
                  result.cpu_stats = (stats.cpu_stats ? stats.cpu_stats : {});
                  result.precpu_stats = (stats.precpu_stats ? stats.precpu_stats : {});
                  result.memory_stats = (stats.memory_stats ? stats.memory_stats : {});
                  result.networks = (stats.networks ? stats.networks : {});
                }
              } catch (err) {
                util.noop();
              }
              // }
              resolve(result);
            });
          } catch (err) {
            util.noop();
          }
        });
      } else {
        resolve(result);
      }
    });
  });
}

exports.dockerContainerStats = dockerContainerStats;

// --------------------------
// container processes (for one container)

function dockerContainerProcesses(containerID, callback) {
  containerID = containerID || '';
  let result = [];
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (containerID) {

        if (!_docker_socket) {
          _docker_socket = new DockerSocket();
        }

        _docker_socket.getProcesses(containerID, data => {
          /**
           * @namespace
           * @property {Array}  Titles
           * @property {Array}  Processes
           **/
          try {
            if (data && data.Titles && data.Processes) {
              let titles = data.Titles.map(function (value) {
                return value.toUpperCase();
              });
              let pos_pid = titles.indexOf('PID');
              let pos_ppid = titles.indexOf('PPID');
              let pos_pgid = titles.indexOf('PGID');
              let pos_vsz = titles.indexOf('VSZ');
              let pos_time = titles.indexOf('TIME');
              let pos_elapsed = titles.indexOf('ELAPSED');
              let pos_ni = titles.indexOf('NI');
              let pos_ruser = titles.indexOf('RUSER');
              let pos_user = titles.indexOf('USER');
              let pos_rgroup = titles.indexOf('RGROUP');
              let pos_group = titles.indexOf('GROUP');
              let pos_stat = titles.indexOf('STAT');
              let pos_rss = titles.indexOf('RSS');
              let pos_command = titles.indexOf('COMMAND');

              data.Processes.forEach(process => {
                result.push({
                  pid_host: (pos_pid >= 0 ? process[pos_pid] : ''),
                  ppid: (pos_ppid >= 0 ? process[pos_ppid] : ''),
                  pgid: (pos_pgid >= 0 ? process[pos_pgid] : ''),
                  user: (pos_user >= 0 ? process[pos_user] : ''),
                  ruser: (pos_ruser >= 0 ? process[pos_ruser] : ''),
                  group: (pos_group >= 0 ? process[pos_group] : ''),
                  rgroup: (pos_rgroup >= 0 ? process[pos_rgroup] : ''),
                  stat: (pos_stat >= 0 ? process[pos_stat] : ''),
                  time: (pos_time >= 0 ? process[pos_time] : ''),
                  elapsed: (pos_elapsed >= 0 ? process[pos_elapsed] : ''),
                  nice: (pos_ni >= 0 ? process[pos_ni] : ''),
                  rss: (pos_rss >= 0 ? process[pos_rss] : ''),
                  vsz: (pos_vsz >= 0 ? process[pos_vsz] : ''),
                  command: (pos_command >= 0 ? process[pos_command] : '')
                });
              });
            }
          } catch (err) {
            util.noop();
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      } else {
        if (callback) { callback(result); }
        resolve(result);
      }
    });
  });
}

exports.dockerContainerProcesses = dockerContainerProcesses;

function dockerAll(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      dockerContainers(true).then(result => {
        if (result && Object.prototype.toString.call(result) === '[object Array]' && result.length > 0) {
          let l = result.length;
          result.forEach(function (element) {
            dockerContainerStats(element.id).then(res => {
              // include stats in array
              element.mem_usage = res[0].mem_usage;
              element.mem_limit = res[0].mem_limit;
              element.mem_percent = res[0].mem_percent;
              element.cpu_percent = res[0].cpu_percent;
              element.pids = res[0].pids;
              element.netIO = res[0].netIO;
              element.blockIO = res[0].blockIO;
              element.cpu_stats = res[0].cpu_stats;
              element.precpu_stats = res[0].precpu_stats;
              element.memory_stats = res[0].memory_stats;
              element.networks = res[0].networks;

              dockerContainerProcesses(element.id).then(processes => {
                element.processes = processes;

                l -= 1;
                if (l === 0) {
                  if (callback) { callback(result); }
                  resolve(result);
                }
              });
              // all done??
            });
          });
        } else {
          if (callback) { callback(result); }
          resolve(result);
        }
      });
    });
  });
}

exports.dockerAll = dockerAll;


/***/ }),

/***/ "./node_modules/systeminformation/lib/dockerSocket.js":
/*!************************************************************!*\
  !*** ./node_modules/systeminformation/lib/dockerSocket.js ***!
  \************************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// dockerSockets.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 13. DockerSockets
// ----------------------------------------------------------------------------------

const net = __webpack_require__(/*! net */ "net");
const isWin = __webpack_require__(/*! os */ "os").type() === 'Windows_NT';
const socketPath = isWin ? '//./pipe/docker_engine' : '/var/run/docker.sock';

class DockerSocket {

  getInfo(callback) {
    try {

      let socket = net.createConnection({ path: socketPath });
      let alldata = '';
      let data;

      socket.on('connect', () => {
        socket.write('GET http:/info HTTP/1.0\r\n\r\n');
      });

      socket.on('data', data => {
        alldata = alldata + data.toString();
      });

      socket.on('error', () => {
        socket = false;
        callback({});
      });

      socket.on('end', () => {
        let startbody = alldata.indexOf('\r\n\r\n');
        alldata = alldata.substring(startbody + 4);
        socket = false;
        try {
          data = JSON.parse(alldata);
          callback(data);
        } catch (err) {
          callback({});
        }
      });
    } catch (err) {
      callback({});
    }
  }

  listContainers(all, callback) {
    try {

      let socket = net.createConnection({ path: socketPath });
      let alldata = '';
      let data;

      socket.on('connect', () => {
        socket.write('GET http:/containers/json' + (all ? '?all=1' : '') + ' HTTP/1.0\r\n\r\n');
      });

      socket.on('data', data => {
        alldata = alldata + data.toString();
      });

      socket.on('error', () => {
        socket = false;
        callback({});
      });

      socket.on('end', () => {
        let startbody = alldata.indexOf('\r\n\r\n');
        alldata = alldata.substring(startbody + 4);
        socket = false;
        try {
          data = JSON.parse(alldata);
          callback(data);
        } catch (err) {
          callback({});
        }
      });
    } catch (err) {
      callback({});
    }
  }

  getStats(id, callback) {
    id = id || '';
    if (id) {
      try {
        let socket = net.createConnection({ path: socketPath });
        let alldata = '';
        let data;

        socket.on('connect', () => {
          socket.write('GET http:/containers/' + id + '/stats?stream=0 HTTP/1.0\r\n\r\n');
        });

        socket.on('data', data => {
          alldata = alldata + data.toString();
        });

        socket.on('error', () => {
          socket = false;
          callback({});
        });

        socket.on('end', () => {
          let startbody = alldata.indexOf('\r\n\r\n');
          alldata = alldata.substring(startbody + 4);
          socket = false;
          try {
            data = JSON.parse(alldata);
            callback(data);
          } catch (err) {
            callback({});
          }
        });
      } catch (err) {
        callback({});
      }
    } else {
      callback({});
    }
  }

  getInspect(id, callback) {
    id = id || '';
    if (id) {
      try {
        let socket = net.createConnection({ path: socketPath });
        let alldata = '';
        let data;

        socket.on('connect', () => {
          socket.write('GET http:/containers/' + id + '/json?stream=0 HTTP/1.0\r\n\r\n');
        });

        socket.on('data', data => {
          alldata = alldata + data.toString();
        });

        socket.on('error', () => {
          socket = false;
          callback({});
        });

        socket.on('end', () => {
          let startbody = alldata.indexOf('\r\n\r\n');
          alldata = alldata.substring(startbody + 4);
          socket = false;
          try {
            data = JSON.parse(alldata);
            callback(data);
          } catch (err) {
            callback({});
          }
        });
      } catch (err) {
        callback({});
      }
    } else {
      callback({});
    }
  }

  getProcesses(id, callback) {
    id = id || '';
    if (id) {
      try {
        let socket = net.createConnection({ path: socketPath });
        let alldata = '';
        let data;

        socket.on('connect', () => {
          socket.write('GET http:/containers/' + id + '/top?ps_args=-opid,ppid,pgid,vsz,time,etime,nice,ruser,user,rgroup,group,stat,rss,args HTTP/1.0\r\n\r\n');
        });

        socket.on('data', data => {
          alldata = alldata + data.toString();
        });

        socket.on('error', () => {
          socket = false;
          callback({});
        });

        socket.on('end', () => {
          let startbody = alldata.indexOf('\r\n\r\n');
          alldata = alldata.substring(startbody + 4);
          socket = false;
          try {
            data = JSON.parse(alldata);
            callback(data);
          } catch (err) {
            callback({});
          }
        });
      } catch (err) {
        callback({});
      }
    } else {
      callback({});
    }
  }
}

module.exports = DockerSocket;


/***/ }),

/***/ "./node_modules/systeminformation/lib/filesystem.js":
/*!**********************************************************!*\
  !*** ./node_modules/systeminformation/lib/filesystem.js ***!
  \**********************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// filesystem.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 8. File System
// ----------------------------------------------------------------------------------

const exec = __webpack_require__(/*! child_process */ "child_process").exec;
const execSync = __webpack_require__(/*! child_process */ "child_process").execSync;
const util = __webpack_require__(/*! ./util */ "./node_modules/systeminformation/lib/util.js");
const fs = __webpack_require__(/*! fs */ "fs");

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

const NOT_SUPPORTED = 'not supported';

let _fs_speed = {};
let _disk_io = {};

// --------------------------
// FS - mounted file systems

function fsSize(callback) {

  function parseDf(lines) {
    let data = [];
    lines.forEach(function (line) {
      if (line !== '') {
        line = line.replace(/ +/g, ' ').split(' ');
        if (line && (line[0].startsWith('/')) || (line[6] && line[6] === '/')) {
          const fs = line[0];
          const fstype = ((_linux || _freebsd || _openbsd || _netbsd) ? line[1] : 'HFS');
          const size = parseInt(((_linux || _freebsd || _openbsd || _netbsd) ? line[2] : line[1])) * 1024;
          const used = parseInt(((_linux || _freebsd || _openbsd || _netbsd) ? line[3] : line[2])) * 1024;
          const use = parseFloat((100.0 * ((_linux || _freebsd || _openbsd || _netbsd) ? line[3] : line[2]) / ((_linux || _freebsd || _openbsd || _netbsd) ? line[2] : line[1])).toFixed(2));
          const mount = line[line.length - 1];
          if (!data.find(el => (el.fs === fs && el.type === fstype))) {
            data.push({
              fs,
              type: fstype,
              size,
              used,
              use,
              mount
            });
          }
        }
      }
    });
    return data;
  }

  return new Promise((resolve) => {
    process.nextTick(() => {
      let data = [];
      if (_linux || _freebsd || _openbsd || _netbsd || _darwin) {
        let cmd = '';
        if (_darwin) cmd = 'df -lkP | grep ^/';
        if (_linux) cmd = 'df -lkPTx squashfs | grep ^/';
        if (_freebsd || _openbsd || _netbsd) cmd = 'df -lkPT';
        exec(cmd, function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            data = parseDf(lines);
            if (callback) {
              callback(data);
            }
            resolve(data);
          } else {
            exec('df -kPT', function (error, stdout) {
              if (!error) {
                let lines = stdout.toString().split('\n');
                data = parseDf(lines);
              }
              if (callback) {
                callback(data);
              }
              resolve(data);
            });
          }
        });
      }
      if (_sunos) {
        if (callback) { callback(data); }
        resolve(data);
      }
      if (_windows) {
        try {
          util.wmic('logicaldisk get Caption,FileSystem,FreeSpace,Size').then((stdout) => {
            let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
            lines.forEach(function (line) {
              if (line !== '') {
                line = line.trim().split(/\s\s+/);
                data.push({
                  'fs': line[0],
                  'type': line[1],
                  'size': parseInt(line[3]),
                  'used': parseInt(line[3]) - parseInt(line[2]),
                  'use': parseFloat((100.0 * (parseInt(line[3]) - parseInt(line[2]))) / parseInt(line[3])),
                  'mount': line[0]
                });
              }
            });
            if (callback) {
              callback(data);
            }
            resolve(data);
          });
        } catch (e) {
          if (callback) { callback(data); }
          resolve(data);
        }
      }
    });
  });
}

exports.fsSize = fsSize;

// --------------------------
// FS - open files count

function fsOpenFiles(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      const result = {
        max: -1,
        allocated: -1,
        available: -1
      };
      if (_freebsd || _openbsd || _netbsd || _darwin) {
        let cmd = 'sysctl -a | grep \'kern.*files\'';
        exec(cmd, function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            result.max = parseInt(util.getValue(lines, 'kern.maxfiles', ':'), 10);
            result.allocated = parseInt(util.getValue(lines, 'kern.num_files', ':'), 10);
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_linux) {
        fs.readFile('/proc/sys/fs/file-nr', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            if (lines[0]) {
              const parts = lines[0].replace(/\s+/g, ' ').split(' ');
              if (parts.length === 3) {
                result.allocated = parseInt(parts[0], 10);
                result.available = parseInt(parts[1], 10);
                result.max = parseInt(parts[2], 10);
              }
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_windows) {
        if (callback) { callback(result); }
        resolve(result);
      }
    });
  });
}

exports.fsOpenFiles = fsOpenFiles;

// --------------------------
// disks

function parseBytes(s) {
  return parseInt(s.substr(s.indexOf(' (') + 2, s.indexOf(' Bytes)') - 10));
}

function parseDevices(lines) {
  let devices = [];
  let i = 0;
  lines.forEach(line => {
    if (line.length > 0) {
      if (line[0] === '*') {
        i++;
      } else {
        let parts = line.split(':');
        if (parts.length > 1) {
          if (!devices[i]) devices[i] = {
            name: '',
            identifier: '',
            type: 'disk',
            fstype: '',
            mount: '',
            size: 0,
            physical: 'HDD',
            uuid: '',
            label: '',
            model: '',
            serial: '',
            removable: false,
            protocol: ''
          };
          parts[0] = parts[0].trim().toUpperCase().replace(/ +/g, '');
          parts[1] = parts[1].trim();
          if ('DEVICEIDENTIFIER' === parts[0]) devices[i].identifier = parts[1];
          if ('DEVICENODE' === parts[0]) devices[i].name = parts[1];
          if ('VOLUMENAME' === parts[0]) {
            if (parts[1].indexOf('Not applicable') === -1) devices[i].label = parts[1];
          }
          if ('PROTOCOL' === parts[0]) devices[i].protocol = parts[1];
          if ('DISKSIZE' === parts[0]) devices[i].size = parseBytes(parts[1]);
          if ('FILESYSTEMPERSONALITY' === parts[0]) devices[i].fstype = parts[1];
          if ('MOUNTPOINT' === parts[0]) devices[i].mount = parts[1];
          if ('VOLUMEUUID' === parts[0]) devices[i].uuid = parts[1];
          if ('READ-ONLYMEDIA' === parts[0] && parts[1] === 'Yes') devices[i].physical = 'CD/DVD';
          if ('SOLIDSTATE' === parts[0] && parts[1] === 'Yes') devices[i].physical = 'SSD';
          if ('VIRTUAL' === parts[0]) devices[i].type = 'virtual';
          if ('REMOVABLEMEDIA' === parts[0]) devices[i].removable = (parts[1] === 'Removable');
          if ('PARTITIONTYPE' === parts[0]) devices[i].type = 'part';
          if ('DEVICE/MEDIANAME' === parts[0]) devices[i].model = parts[1];
        }
      }
    }
  });
  return devices;
}

function parseBlk(lines) {
  let data = [];

  lines.filter(line => line !== '').forEach((line) => {
    line = util.decodeEscapeSequence(line);
    line = line.replace(/\\/g, '\\\\');
    let disk = JSON.parse(line);
    data.push({
      'name': disk.name,
      'type': disk.type,
      'fstype': disk.fstype,
      'mount': disk.mountpoint,
      'size': parseInt(disk.size),
      'physical': (disk.type === 'disk' ? (disk.rota === '0' ? 'SSD' : 'HDD') : (disk.type === 'rom' ? 'CD/DVD' : '')),
      'uuid': disk.uuid,
      'label': disk.label,
      'model': disk.model,
      'serial': disk.serial,
      'removable': disk.rm === '1',
      'protocol': disk.tran,
      'group': disk.group,
    });
  });

  data = util.unique(data);
  data = util.sortByKey(data, ['type', 'name']);
  return data;
}

function blkStdoutToObject(stdout) {
  return stdout.toString()
    .replace(/NAME=/g, '{"name":')
    .replace(/FSTYPE=/g, ',"fstype":')
    .replace(/TYPE=/g, ',"type":')
    .replace(/SIZE=/g, ',"size":')
    .replace(/MOUNTPOINT=/g, ',"mountpoint":')
    .replace(/UUID=/g, ',"uuid":')
    .replace(/ROTA=/g, ',"rota":')
    .replace(/RO=/g, ',"ro":')
    .replace(/RM=/g, ',"rm":')
    .replace(/TRAN=/g, ',"tran":')
    .replace(/SERIAL=/g, ',"serial":')
    .replace(/LABEL=/g, ',"label":')
    .replace(/MODEL=/g, ',"model":')
    .replace(/OWNER=/g, ',"owner":')
    .replace(/GROUP=/g, ',"group":')
    .replace(/\n/g, '}\n');
}

function blockDevices(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let data = [];
      if (_linux) {
        // see https://wiki.ubuntuusers.de/lsblk/
        // exec("lsblk -bo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,TRAN,SERIAL,LABEL,MODEL,OWNER,GROUP,MODE,ALIGNMENT,MIN-IO,OPT-IO,PHY-SEC,LOG-SEC,SCHED,RQ-SIZE,RA,WSAME", function (error, stdout) {
        exec('lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,TRAN,SERIAL,LABEL,MODEL,OWNER 2>/dev/null', function (error, stdout) {
          if (!error) {
            let lines = blkStdoutToObject(stdout).split('\n');
            data = parseBlk(lines);
            if (callback) {
              callback(data);
            }
            resolve(data);
          } else {
            exec('lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,LABEL,MODEL,OWNER 2>/dev/null', function (error, stdout) {
              if (!error) {
                let lines = blkStdoutToObject(stdout).split('\n');
                data = parseBlk(lines);
              }
              if (callback) {
                callback(data);
              }
              resolve(data);
            });
          }
        });
      }
      if (_darwin) {
        exec('diskutil info -all', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            // parse lines into temp array of devices
            data = parseDevices(lines);
          }
          if (callback) {
            callback(data);
          }
          resolve(data);
        });
      }
      if (_sunos) {
        if (callback) { callback(data); }
        resolve(data);
      }
      if (_windows) {
        let drivetypes = ['Unknown', 'NoRoot', 'Removable', 'Local', 'Network', 'CD/DVD', 'RAM'];
        try {
          util.wmic('logicaldisk get Caption,Description,DeviceID,DriveType,FileSystem,FreeSpace,Name,Size,VolumeName,VolumeSerialNumber /value').then((stdout, error) => {
            if (!error) {
              let devices = stdout.toString().split(/\n\s*\n/);
              devices.forEach(function (device) {
                let lines = device.split('\r\n');
                let drivetype = util.getValue(lines, 'drivetype', '=');
                if (drivetype) {
                  data.push({
                    name: util.getValue(lines, 'name', '='),
                    identifier: util.getValue(lines, 'caption', '='),
                    type: 'disk',
                    fstype: util.getValue(lines, 'filesystem', '=').toLowerCase(),
                    mount: util.getValue(lines, 'caption', '='),
                    size: util.getValue(lines, 'size', '='),
                    physical: (drivetype >= 0 && drivetype <= 6) ? drivetypes[drivetype] : drivetypes[0],
                    uuid: util.getValue(lines, 'volumeserialnumber', '='),
                    label: util.getValue(lines, 'volumename', '='),
                    model: '',
                    serial: util.getValue(lines, 'volumeserialnumber', '='),
                    removable: drivetype === '2',
                    protocol: ''
                  });
                }
              });
            }
            if (callback) {
              callback(data);
            }
            resolve(data);
          });

        } catch (e) {
          if (callback) { callback(data); }
          resolve(data);
        }
      }
    });
  });
}

exports.blockDevices = blockDevices;

// --------------------------
// FS - speed

function calcFsSpeed(rx, wx) {
  let result = {
    rx: 0,
    wx: 0,
    tx: 0,
    rx_sec: -1,
    wx_sec: -1,
    tx_sec: -1,
    ms: 0
  };

  if (_fs_speed && _fs_speed.ms) {
    result.rx = rx;
    result.wx = wx;
    result.tx = result.rx + result.wx;
    result.ms = Date.now() - _fs_speed.ms;
    result.rx_sec = (result.rx - _fs_speed.bytes_read) / (result.ms / 1000);
    result.wx_sec = (result.wx - _fs_speed.bytes_write) / (result.ms / 1000);
    result.tx_sec = result.rx_sec + result.wx_sec;
    _fs_speed.rx_sec = result.rx_sec;
    _fs_speed.wx_sec = result.wx_sec;
    _fs_speed.tx_sec = result.tx_sec;
    _fs_speed.bytes_read = result.rx;
    _fs_speed.bytes_write = result.wx;
    _fs_speed.bytes_overall = result.rx + result.wx;
    _fs_speed.ms = Date.now();
    _fs_speed.last_ms = result.ms;
  } else {
    result.rx = rx;
    result.wx = wx;
    result.tx = result.rx + result.wx;
    _fs_speed.rx_sec = -1;
    _fs_speed.wx_sec = -1;
    _fs_speed.tx_sec = -1;
    _fs_speed.bytes_read = result.rx;
    _fs_speed.bytes_write = result.wx;
    _fs_speed.bytes_overall = result.rx + result.wx;
    _fs_speed.ms = Date.now();
    _fs_speed.last_ms = 0;
  }
  return result;
}

function fsStats(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) {
          callback(NOT_SUPPORTED);
        }
        reject(error);
      }

      let result = {
        rx: 0,
        wx: 0,
        tx: 0,
        rx_sec: -1,
        wx_sec: -1,
        tx_sec: -1,
        ms: 0
      };

      let rx = 0;
      let wx = 0;
      if ((_fs_speed && !_fs_speed.ms) || (_fs_speed && _fs_speed.ms && Date.now() - _fs_speed.ms >= 500)) {
        if (_linux) {
          // exec("df -k | grep /dev/", function(error, stdout) {
          exec('lsblk 2>/dev/null | grep /', function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              let fs_filter = [];
              lines.forEach(function (line) {
                if (line !== '') {
                  line = line.replace(/[├─│└]+/g, '').trim().split(' ');
                  if (fs_filter.indexOf(line[0]) === -1) fs_filter.push(line[0]);
                }
              });

              let output = fs_filter.join('|');
              exec('cat /proc/diskstats | egrep "' + output + '"', function (error, stdout) {
                if (!error) {
                  let lines = stdout.toString().split('\n');
                  lines.forEach(function (line) {
                    line = line.trim();
                    if (line !== '') {
                      line = line.replace(/ +/g, ' ').split(' ');

                      rx += parseInt(line[5]) * 512;
                      wx += parseInt(line[9]) * 512;
                    }
                  });
                  result = calcFsSpeed(rx, wx);
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              });
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        }
        if (_darwin) {
          exec('ioreg -c IOBlockStorageDriver -k Statistics -r -w0 | sed -n "/IOBlockStorageDriver/,/Statistics/p" | grep "Statistics" | tr -cd "01234567890,\n"', function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              lines.forEach(function (line) {
                line = line.trim();
                if (line !== '') {
                  line = line.split(',');

                  rx += parseInt(line[2]);
                  wx += parseInt(line[9]);
                }
              });
              result = calcFsSpeed(rx, wx);
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
      } else {
        result.ms = _fs_speed.last_ms;
        result.rx = _fs_speed.bytes_read;
        result.wx = _fs_speed.bytes_write;
        result.tx = _fs_speed.bytes_read + _fs_speed.bytes_write;
        result.rx_sec = _fs_speed.rx_sec;
        result.wx_sec = _fs_speed.wx_sec;
        result.tx_sec = _fs_speed.tx_sec;
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
    });
  });
}

exports.fsStats = fsStats;

function calcDiskIO(rIO, wIO) {
  let result = {
    rIO: 0,
    wIO: 0,
    tIO: 0,
    rIO_sec: -1,
    wIO_sec: -1,
    tIO_sec: -1,
    ms: 0
  };
  if (_disk_io && _disk_io.ms) {
    result.rIO = rIO;
    result.wIO = wIO;
    result.tIO = rIO + wIO;
    result.ms = Date.now() - _disk_io.ms;
    result.rIO_sec = (result.rIO - _disk_io.rIO) / (result.ms / 1000);
    result.wIO_sec = (result.wIO - _disk_io.wIO) / (result.ms / 1000);
    result.tIO_sec = result.rIO_sec + result.wIO_sec;
    _disk_io.rIO = rIO;
    _disk_io.wIO = wIO;
    _disk_io.rIO_sec = result.rIO_sec;
    _disk_io.wIO_sec = result.wIO_sec;
    _disk_io.tIO_sec = result.tIO_sec;
    _disk_io.last_ms = result.ms;
    _disk_io.ms = Date.now();
  } else {
    result.rIO = rIO;
    result.wIO = wIO;
    result.tIO = rIO + wIO;
    _disk_io.rIO = rIO;
    _disk_io.wIO = wIO;
    _disk_io.rIO_sec = -1;
    _disk_io.wIO_sec = -1;
    _disk_io.tIO_sec = -1;
    _disk_io.last_ms = 0;
    _disk_io.ms = Date.now();
  }
  return result;
}

function disksIO(callback) {

  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) {
          callback(NOT_SUPPORTED);
        }
        reject(error);
      }
      if (_sunos) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) {
          callback(NOT_SUPPORTED);
        }
        reject(error);
      }

      let result = {
        rIO: 0,
        wIO: 0,
        tIO: 0,
        rIO_sec: -1,
        wIO_sec: -1,
        tIO_sec: -1,
        ms: 0
      };
      let rIO = 0;
      let wIO = 0;

      if ((_disk_io && !_disk_io.ms) || (_disk_io && _disk_io.ms && Date.now() - _disk_io.ms >= 500)) {
        if (_linux || _freebsd || _openbsd || _netbsd) {
          // prints Block layer statistics for all mounted volumes
          // var cmd = "for mount in `lsblk | grep / | sed -r 's/│ └─//' | cut -d ' ' -f 1`; do cat /sys/block/$mount/stat | sed -r 's/ +/;/g' | sed -r 's/^;//'; done";
          // var cmd = "for mount in `lsblk | grep / | sed 's/[│└─├]//g' | awk '{$1=$1};1' | cut -d ' ' -f 1 | sort -u`; do cat /sys/block/$mount/stat | sed -r 's/ +/;/g' | sed -r 's/^;//'; done";
          let cmd = 'for mount in `lsblk 2>/dev/null | grep " disk " | sed "s/[│└─├]//g" | awk \'{$1=$1};1\' | cut -d " " -f 1 | sort -u`; do cat /sys/block/$mount/stat | sed -r "s/ +/;/g" | sed -r "s/^;//"; done';

          exec(cmd, function (error, stdout) {
            if (!error) {
              let lines = stdout.split('\n');
              lines.forEach(function (line) {
                // ignore empty lines
                if (!line) return;

                // sum r/wIO of all disks to compute all disks IO
                let stats = line.split(';');
                rIO += parseInt(stats[0]);
                wIO += parseInt(stats[4]);
              });
              result = calcDiskIO(rIO, wIO);

              if (callback) {
                callback(result);
              }
              resolve(result);
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        }
        if (_darwin) {
          exec('ioreg -c IOBlockStorageDriver -k Statistics -r -w0 | sed -n "/IOBlockStorageDriver/,/Statistics/p" | grep "Statistics" | tr -cd "01234567890,\n"', function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              lines.forEach(function (line) {
                line = line.trim();
                if (line !== '') {
                  line = line.split(',');

                  rIO += parseInt(line[10]);
                  wIO += parseInt(line[0]);
                }
              });
              result = calcDiskIO(rIO, wIO);
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
      } else {
        result.rIO = _disk_io.rIO;
        result.wIO = _disk_io.wIO;
        result.tIO = _disk_io.rIO + _disk_io.wIO;
        result.ms = _disk_io.last_ms;
        result.rIO_sec = _disk_io.rIO_sec;
        result.wIO_sec = _disk_io.wIO_sec;
        result.tIO_sec = _disk_io.tIO_sec;
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
    });
  });
}

exports.disksIO = disksIO;

function diskLayout(callback) {

  function getVendorFromModel(model) {
    const diskManufacturers = [
      { pattern: '^WESTERN.+', manufacturer: 'Western Digital' },
      { pattern: '^WDC.+', manufacturer: 'Western Digital' },
      { pattern: 'WD.+', manufacturer: 'Western Digital' },
      { pattern: '^TOSHIBA.+', manufacturer: 'Toshiba' },
      { pattern: '^HITACHI.+', manufacturer: 'Hitachi' },
      { pattern: '^IC.+', manufacturer: 'Hitachi' },
      { pattern: '^HTS.+', manufacturer: 'Hitachi' },
      { pattern: '^SANDISK.+', manufacturer: 'SanDisk' },
      { pattern: '^KINGSTON.+', manufacturer: 'Kingston Technonogy' },
      { pattern: '^SONY.+', manufacturer: 'Sony' },
      { pattern: '^TRANSCEND.+', manufacturer: 'Transcend' },
      { pattern: 'SAMSUNG.+', manufacturer: 'Samsung' },
      { pattern: '^ST(?!I\\ ).+', manufacturer: 'Seagate' },
      { pattern: '^STI\\ .+', manufacturer: 'SimpleTech' },
      { pattern: '^D...-.+', manufacturer: 'IBM' },
      { pattern: '^IBM.+', manufacturer: 'IBM' },
      { pattern: '^FUJITSU.+', manufacturer: 'Fujitsu' },
      { pattern: '^MP.+', manufacturer: 'Fujitsu' },
      { pattern: '^MK.+', manufacturer: 'Toshiba' },
      { pattern: '^MAXTOR.+', manufacturer: 'Maxtor' },
      { pattern: '^Pioneer.+', manufacturer: 'Pioneer' },
      { pattern: '^PHILIPS.+', manufacturer: 'Philips' },
      { pattern: '^QUANTUM.+', manufacturer: 'Quantum Technology' },
      { pattern: 'FIREBALL.+', manufacturer: 'Quantum Technology' },
      { pattern: '^VBOX.+', manufacturer: 'VirtualBox' },
      { pattern: 'CORSAIR.+', manufacturer: 'Corsair Components' },
      { pattern: 'CRUCIAL.+', manufacturer: 'Crucial' },
      { pattern: 'ECM.+', manufacturer: 'ECM' },
      { pattern: 'INTEL.+', manufacturer: 'INTEL' },
    ];

    let result = '';
    if (model) {
      model = model.toUpperCase();
      diskManufacturers.forEach((manufacturer) => {
        const re = RegExp(manufacturer.pattern);
        if (re.test(model)) { result = manufacturer.manufacturer; }
      });
    }
    return result;
  }

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = [];
      let cmd = '';

      if (_linux) {
        exec('export LC_ALL=C; lsblk -ablJO 2>/dev/null; unset LC_ALL', function (error, stdout) {
          if (!error) {
            try {
              const out = stdout.toString().trim();
              let devices = [];
              try {
                const outJSON = JSON.parse(out);
                if (outJSON && {}.hasOwnProperty.call(outJSON, 'blockdevices')) {
                  devices = outJSON.blockdevices.filter(item => { return (item.group === 'disk' || item.type === 'disk') && item.size > 0 && (item.model !== null || (item.mountpoint === null && item.label === null && item.fstype === null && item.parttype === null)); });
                }
              } catch (e) {
                // fallback to older version of lsblk
                const out2 = execSync('export LC_ALL=C; lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,LABEL,MODEL,OWNER,GROUP 2>/dev/null; unset LC_ALL').toString();
                let lines = blkStdoutToObject(out2).split('\n');
                const data = parseBlk(lines);
                devices = data.filter(item => { return (item.group === 'disk' || item.type === 'disk') && item.size > 0 && ((item.model !== null && item.model !== '') || (item.mountpoint === '' && item.label === '' && item.fstype === '')); });
              }
              devices.forEach((device) => {
                let mediumType = '';
                const BSDName = '/dev/' + device.name;
                const logical = device.name;
                try {
                  mediumType = execSync('cat /sys/block/' + logical + '/queue/rotational 2>/dev/null').toString().split('\n')[0];
                } catch (e) {
                  util.noop();
                }
                let interfaceType = device.tran ? device.tran.toUpperCase().trim() : '';
                if (interfaceType === 'NVME') {
                  mediumType = '2';
                  interfaceType = 'PCIe';
                }
                result.push({
                  device: BSDName,
                  type: (mediumType === '0' ? 'SSD' : (mediumType === '1' ? 'HD' : (mediumType === '2' ? 'NVMe' : (device.model && device.model.indexOf('SSD') > -1 ? 'SSD' : (device.model && device.model.indexOf('NVM') > -1 ? 'NVMe' : 'HD'))))),
                  name: device.model || '',
                  vendor: getVendorFromModel(device.model) || (device.vendor ? device.vendor.trim() : ''),
                  size: device.size || 0,
                  bytesPerSector: -1,
                  totalCylinders: -1,
                  totalHeads: -1,
                  totalSectors: -1,
                  totalTracks: -1,
                  tracksPerCylinder: -1,
                  sectorsPerTrack: -1,
                  firmwareRevision: device.rev ? device.rev.trim() : '',
                  serialNum: device.serial ? device.serial.trim() : '',
                  interfaceType: interfaceType,
                  smartStatus: 'unknown',
                  BSDName: BSDName
                });
                cmd = cmd + 'printf "\n' + BSDName + '|"; smartctl -H ' + BSDName + ' | grep overall;';
              });
            } catch (e) {
              util.noop();
            }
          }
          // check S.M.A.R.T. status
          if (cmd) {
            cmd = cmd + 'printf "\n"';
            exec(cmd, function (error, stdout) {
              let lines = stdout.toString().split('\n');
              lines.forEach(line => {
                if (line) {
                  let parts = line.split('|');
                  if (parts.length === 2) {
                    let BSDName = parts[0];
                    parts[1] = parts[1].trim();
                    let parts2 = parts[1].split(':');
                    if (parts2.length === 2) {
                      parts2[1] = parts2[1].trim();
                      let status = parts2[1].toLowerCase();
                      for (let i = 0; i < result.length; i++) {
                        if (result[i].BSDName === BSDName) {
                          result[i].smartStatus = (status === 'passed' ? 'Ok' : (status === 'failed!' ? 'Predicted Failure' : 'unknown'));
                        }
                      }
                    }
                  }
                }
              });
              for (let i = 0; i < result.length; i++) {
                delete result[i].BSDName;
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          } else {
            for (let i = 0; i < result.length; i++) {
              delete result[i].BSDName;
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        });
      }
      if (_freebsd || _openbsd || _netbsd) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_darwin) {
        exec('system_profiler SPSerialATADataType SPNVMeDataType', function (error, stdout) {
          if (!error) {
            let parts = stdout.toString().split('NVMExpress:');

            let devices = parts[0].split(' Physical Interconnect: ');
            devices.shift();
            devices.forEach(function (device) {
              device = 'InterfaceType: ' + device;
              let lines = device.split('\n');
              const mediumType = util.getValue(lines, 'Medium Type', ':', true).trim();
              const sizeStr = util.getValue(lines, 'capacity', ':', true).trim();
              const BSDName = util.getValue(lines, 'BSD Name', ':', true).trim();
              if (sizeStr) {
                let sizeValue = 0;
                if (sizeStr.indexOf('(') >= 0) {
                  sizeValue = parseInt(sizeStr.match(/\(([^)]+)\)/)[1].replace(/\./g, '').replace(/,/g, ''));
                }
                if (!sizeValue) {
                  sizeValue = parseInt(sizeStr);
                }
                if (sizeValue) {
                  result.push({
                    device: BSDName,
                    type: mediumType.startsWith('Solid') ? 'SSD' : 'HD',
                    name: util.getValue(lines, 'Model', ':', true).trim(),
                    vendor: getVendorFromModel(util.getValue(lines, 'Model', ':', true).trim()),
                    size: sizeValue,
                    bytesPerSector: -1,
                    totalCylinders: -1,
                    totalHeads: -1,
                    totalSectors: -1,
                    totalTracks: -1,
                    tracksPerCylinder: -1,
                    sectorsPerTrack: -1,
                    firmwareRevision: util.getValue(lines, 'Revision', ':', true).trim(),
                    serialNum: util.getValue(lines, 'Serial Number', ':', true).trim(),
                    interfaceType: util.getValue(lines, 'InterfaceType', ':', true).trim(),
                    smartStatus: 'unknown',
                    BSDName: BSDName
                  });
                  cmd = cmd + 'printf "\n' + BSDName + '|"; diskutil info /dev/' + BSDName + ' | grep SMART;';
                }
              }
            });
            if (parts.length > 1) {
              let devices = parts[1].split('\n\n          Capacity:');
              devices.shift();
              devices.forEach(function (device) {
                device = '!Capacity: ' + device;
                let lines = device.split('\n');
                const linkWidth = util.getValue(lines, 'link width', ':', true).trim();
                const sizeStr = util.getValue(lines, '!capacity', ':', true).trim();
                const BSDName = util.getValue(lines, 'BSD Name', ':', true).trim();
                if (sizeStr) {
                  let sizeValue = 0;
                  if (sizeStr.indexOf('(') >= 0) {
                    sizeValue = parseInt(sizeStr.match(/\(([^)]+)\)/)[1].replace(/\./g, '').replace(/,/g, ''));
                  }
                  if (!sizeValue) {
                    sizeValue = parseInt(sizeStr);
                  }
                  if (sizeValue) {
                    result.push({
                      device: BSDName,
                      type: 'NVMe',
                      name: util.getValue(lines, 'Model', ':', true).trim(),
                      vendor: getVendorFromModel(util.getValue(lines, 'Model', ':', true).trim()),
                      size: sizeValue,
                      bytesPerSector: -1,
                      totalCylinders: -1,
                      totalHeads: -1,
                      totalSectors: -1,
                      totalTracks: -1,
                      tracksPerCylinder: -1,
                      sectorsPerTrack: -1,
                      firmwareRevision: util.getValue(lines, 'Revision', ':', true).trim(),
                      serialNum: util.getValue(lines, 'Serial Number', ':', true).trim(),
                      interfaceType: ('PCIe ' + linkWidth).trim(),
                      smartStatus: 'unknown',
                      BSDName: BSDName
                    });
                    cmd = cmd + 'printf "\n' + BSDName + '|"; diskutil info /dev/' + BSDName + ' | grep SMART;';
                  }
                }
              });
            }
          }
          if (cmd) {
            cmd = cmd + 'printf "\n"';
            exec(cmd, function (error, stdout) {
              let lines = stdout.toString().split('\n');
              lines.forEach(line => {
                if (line) {
                  let parts = line.split('|');
                  if (parts.length === 2) {
                    let BSDName = parts[0];
                    parts[1] = parts[1].trim();
                    let parts2 = parts[1].split(':');
                    if (parts2.length === 2) {
                      parts2[1] = parts2[1].trim();
                      let status = parts2[1].toLowerCase();
                      for (let i = 0; i < result.length; i++) {
                        if (result[i].BSDName === BSDName) {
                          result[i].smartStatus = (status === 'not supported' ? 'not supported' : (status === 'verified' ? 'Ok' : (status === 'failing' ? 'Predicted Failure' : 'unknown')));
                        }
                      }
                    }
                  }
                }
              });
              for (let i = 0; i < result.length; i++) {
                delete result[i].BSDName;
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          } else {
            for (let i = 0; i < result.length; i++) {
              delete result[i].BSDName;
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        });
      }
      if (_windows) {
        try {
          util.wmic('diskdrive get /value').then((stdout, error) => {
            if (!error) {
              let devices = stdout.toString().split(/\n\s*\n/);
              devices.forEach(function (device) {
                let lines = device.split('\r\n');
                const size = util.getValue(lines, 'Size', '=').trim();
                const status = util.getValue(lines, 'Status', '=').trim().toLowerCase();
                if (size) {
                  result.push({
                    device: '',
                    type: device.indexOf('SSD') > -1 ? 'SSD' : 'HD',  // just a starting point ... better: MSFT_PhysicalDisk - Media Type ... see below
                    name: util.getValue(lines, 'Caption', '='),
                    vendor: util.getValue(lines, 'Manufacturer', '='),
                    size: parseInt(size),
                    bytesPerSector: parseInt(util.getValue(lines, 'BytesPerSector', '=')),
                    totalCylinders: parseInt(util.getValue(lines, 'TotalCylinders', '=')),
                    totalHeads: parseInt(util.getValue(lines, 'TotalHeads', '=')),
                    totalSectors: parseInt(util.getValue(lines, 'TotalSectors', '=')),
                    totalTracks: parseInt(util.getValue(lines, 'TotalTracks', '=')),
                    tracksPerCylinder: parseInt(util.getValue(lines, 'TracksPerCylinder', '=')),
                    sectorsPerTrack: parseInt(util.getValue(lines, 'SectorsPerTrack', '=')),
                    firmwareRevision: util.getValue(lines, 'FirmwareRevision', '=').trim(),
                    serialNum: util.getValue(lines, 'SerialNumber', '=').trim(),
                    interfaceType: util.getValue(lines, 'InterfaceType', '=').trim(),
                    smartStatus: (status === 'ok' ? 'Ok' : (status === 'degraded' ? 'Degraded' : (status === 'pred fail' ? 'Predicted Failure' : 'Unknown')))
                  });
                }
              });
              util.powerShell('Get-PhysicalDisk | Format-List')
                .then(data => {
                  let devices = data.split(/\n\s*\n/);
                  devices.forEach(function (device) {
                    let lines = device.split('\r\n');
                    const serialNum = util.getValue(lines, 'SerialNumber', ':').trim();
                    const name = util.getValue(lines, 'FriendlyName', ':').trim();
                    const size = util.getValue(lines, 'Size', ':').trim();
                    const interfaceType = util.getValue(lines, 'BusType', ':').trim();
                    let mediaType = util.getValue(lines, 'MediaType', ':').trim();
                    if (mediaType === '3' || mediaType === 'HDD') { mediaType = 'HD'; }
                    if (mediaType === '4') { mediaType = 'SSD'; }
                    if (mediaType === '5') { mediaType = 'SCM'; }
                    if (size) {
                      let i = util.findObjectByKey(result, 'serialNum', serialNum);
                      if (i === -1) {
                        i = util.findObjectByKey(result, 'name', name);
                      }
                      if (i != -1) {
                        result[i].type = mediaType;
                        result[i].interfaceType = interfaceType;
                      }
                    }
                  });
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                })
                .catch(() => {
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                });
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.diskLayout = diskLayout;


/***/ }),

/***/ "./node_modules/systeminformation/lib/graphics.js":
/*!********************************************************!*\
  !*** ./node_modules/systeminformation/lib/graphics.js ***!
  \********************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// graphics.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 7. Graphics (controller, display)
// ----------------------------------------------------------------------------------

const os = __webpack_require__(/*! os */ "os");
const exec = __webpack_require__(/*! child_process */ "child_process").exec;
const execSync = __webpack_require__(/*! child_process */ "child_process").execSync;
const util = __webpack_require__(/*! ./util */ "./node_modules/systeminformation/lib/util.js");

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

let _resolutionx = 0;
let _resolutiony = 0;
let _pixeldepth = 0;
let _refreshrate = 0;

const videoTypes = {
  '-2': 'UNINITIALIZED',
  '-1': 'OTHER',
  '0': 'HD15',
  '1': 'SVIDEO',
  '2': 'Composite video',
  '3': 'Component video',
  '4': 'DVI',
  '5': 'HDMI',
  '6': 'LVDS',
  '8': 'D_JPN',
  '9': 'SDI',
  '10': 'DP',
  '11': 'DP embedded',
  '12': 'UDI',
  '13': 'UDI embedded',
  '14': 'SDTVDONGLE',
  '15': 'MIRACAST',
  '2147483648': 'INTERNAL'
};

function graphics(callback) {

  function parseLinesDarwin(lines) {
    let starts = [];
    let level = -1;
    let lastlevel = -1;
    let controllers = [];
    let displays = [];
    let currentController = {
      vendor: '',
      model: '',
      bus: '',
      vram: -1,
      vramDynamic: false
    };
    let currentDisplay = {
      vendor: '',
      model: '',
      main: false,
      builtin: false,
      connection: '',
      sizex: -1,
      sizey: -1,
      pixeldepth: -1,
      resolutionx: -1,
      resolutiony: -1,
      currentResX: -1,
      currentResY: -1,
      positionX: 0,
      positionY: 0,
      currentRefreshRate: -1
    };
    for (let i = 0; i < lines.length; i++) {
      if ('' !== lines[i].trim()) {
        let start = lines[i].search(/\S|$/);
        if (-1 === starts.indexOf(start)) {
          starts.push(start);
        }
        level = starts.indexOf(start);
        if (level < lastlevel) {
          if (Object.keys(currentController).length > 0) {// just changed to Displays
            controllers.push(currentController);
            currentController = {
              vendor: '',
              model: '',
              bus: '',
              vram: -1,
              vramDynamic: false
            };
          }
          if (Object.keys(currentDisplay).length > 0) {// just changed to Displays
            displays.push(currentDisplay);
            currentDisplay = {
              vendor: '',
              model: '',
              main: false,
              builtin: false,
              connection: '',
              sizex: -1,
              sizey: -1,
              pixeldepth: -1,
              resolutionx: -1,
              resolutiony: -1,
              currentResX: -1,
              currentResY: -1,
              positionX: 0,
              positionY: 0,
              currentRefreshRate: -1
            };
          }
        }
        lastlevel = level;
        let parts = lines[i].split(':');
        if (2 === level) {       // grafics controller level
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('chipsetmodel') !== -1) currentController.model = parts[1].trim();
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('bus') !== -1) currentController.bus = parts[1].trim();
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('vendor') !== -1) currentController.vendor = parts[1].split('(')[0].trim();
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('vram(total)') !== -1) {
            currentController.vram = parseInt(parts[1]);    // in MB
            if (parts[1].toLowerCase().indexOf('gb') !== -1) {
              currentController.vram = currentController.vram * 1024;
            }
            currentController.vramDynamic = false;
          }
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('vram(dynamic,max)') !== -1) {
            currentController.vram = parseInt(parts[1]);    // in MB
            if (parts[1].toLowerCase().indexOf('gb') !== -1) {
              currentController.vram = currentController.vram * 1024;
            }
            currentController.vramDynamic = true;
          }
        }
        if (3 === level) {       // display controller level
          if (parts.length > 1 && '' === parts[1]) {
            currentDisplay.vendor = '';
            currentDisplay.model = parts[0].trim();
            currentDisplay.main = false;
            currentDisplay.builtin = false;
            currentDisplay.connection = '';
            currentDisplay.sizex = -1;
            currentDisplay.sizey = -1;
            currentDisplay.positionX = 0;
            currentDisplay.positionY = 0;
            currentDisplay.pixeldepth = -1;
          }
        }
        if (4 === level) {       // display controller details level
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('resolution') !== -1) {
            let resolution = parts[1].split('x');
            currentDisplay.resolutionx = (resolution.length > 1 ? parseInt(resolution[0]) : 0);
            currentDisplay.resolutiony = (resolution.length > 1 ? parseInt(resolution[1]) : 0);
            currentDisplay.currentResX = currentDisplay.resolutionx;
            currentDisplay.currentResY = currentDisplay.resolutiony;
          }
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('pixeldepth') !== -1) currentDisplay.pixeldepth = parseInt(parts[1]); // in BIT
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('framebufferdepth') !== -1) currentDisplay.pixeldepth = parseInt(parts[1]); // in BIT
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('maindisplay') !== -1 && parts[1].replace(/ +/g, '').toLowerCase() === 'yes') currentDisplay.main = true;
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('built-in') !== -1 && parts[1].replace(/ +/g, '').toLowerCase() === 'yes') {
            currentDisplay.builtin = true;
            currentDisplay.connection = '';
          }
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('connectiontype') !== -1) {
            currentDisplay.builtin = false;
            currentDisplay.connection = parts[1].trim();
          }
        }
      }
    }
    if (Object.keys(currentController).length > 0) {// just changed to Displays
      controllers.push(currentController);
    }
    if (Object.keys(currentDisplay).length > 0) {// just changed to Displays
      displays.push(currentDisplay);
    }
    return ({
      controllers: controllers,
      displays: displays
    });
  }

  function parseLinesLinuxControllers(lines) {
    let controllers = [];
    let currentController = {
      vendor: '',
      model: '',
      bus: '',
      vram: -1,
      vramDynamic: false
    };
    let isGraphicsController = false;
    // PCI bus IDs
    let pciIDs = [];
    try {
      pciIDs = execSync('export LC_ALL=C; dmidecode -t 9 2>/dev/null; unset LC_ALL | grep "Bus Address: "').toString().split('\n');
      for (let i = 0; i < pciIDs.length; i++) {
        pciIDs[i] = pciIDs[i].replace('Bus Address:', '').replace('0000:', '').trim();
      }
      pciIDs = pciIDs.filter(function (el) {
        return el != null && el;
      });
    } catch (e) {
      util.noop();
    }
    for (let i = 0; i < lines.length; i++) {
      if ('' !== lines[i].trim()) {
        if (' ' !== lines[i][0] && '\t' !== lines[i][0]) {        // first line of new entry
          let isExternal = (pciIDs.indexOf(lines[i].split(' ')[0]) >= 0);
          let vgapos = lines[i].toLowerCase().indexOf(' vga ');
          let _3dcontrollerpos = lines[i].toLowerCase().indexOf('3d controller');
          if (vgapos !== -1 || _3dcontrollerpos !== -1) {         // VGA
            if (_3dcontrollerpos !== -1 && vgapos === -1) {
              vgapos = _3dcontrollerpos;
            }
            if (currentController.vendor || currentController.model || currentController.bus || currentController.vram !== -1 || currentController.vramDynamic) { // already a controller found
              controllers.push(currentController);
              currentController = {
                vendor: '',
                model: '',
                bus: '',
                vram: -1,
                vramDynamic: false
              };
            }
            isGraphicsController = true;
            let endpos = lines[i].search(/\[[0-9a-f]{4}:[0-9a-f]{4}]|$/);
            let parts = lines[i].substr(vgapos, endpos - vgapos).split(':');
            if (parts.length > 1) {
              parts[1] = parts[1].trim();
              if (parts[1].toLowerCase().indexOf('corporation') >= 0) {
                currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf('corporation') + 11).trim();
                currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf('corporation') + 11, 200).trim().split('(')[0];
                currentController.bus = (pciIDs.length > 0 && isExternal) ? 'PCIe' : 'Onboard';
                currentController.vram = -1;
                currentController.vramDynamic = false;
              } else if (parts[1].toLowerCase().indexOf(' inc.') >= 0) {
                if ((parts[1].match(new RegExp(']', 'g')) || []).length > 1) {
                  currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf(']') + 1).trim();
                  currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf(']') + 1, 200).trim().split('(')[0].trim();
                } else {
                  currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf(' inc.') + 5).trim();
                  currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf(' inc.') + 5, 200).trim().split('(')[0].trim();
                }
                currentController.bus = (pciIDs.length > 0 && isExternal) ? 'PCIe' : 'Onboard';
                currentController.vram = -1;
                currentController.vramDynamic = false;
              } else if (parts[1].toLowerCase().indexOf(' ltd.') >= 0) {
                if ((parts[1].match(new RegExp(']', 'g')) || []).length > 1) {
                  currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf(']') + 1).trim();
                  currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf(']') + 1, 200).trim().split('(')[0].trim();
                } else {
                  currentController.vendor = parts[1].substr(0, parts[1].toLowerCase().indexOf(' ltd.') + 5).trim();
                  currentController.model = parts[1].substr(parts[1].toLowerCase().indexOf(' ltd.') + 5, 200).trim().split('(')[0].trim();
                }
              }
            }

          } else {
            isGraphicsController = false;
          }
        }
        if (isGraphicsController) { // within VGA details
          let parts = lines[i].split(':');
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('devicename') !== -1 && parts[1].toLowerCase().indexOf('onboard') !== -1) currentController.bus = 'Onboard';
          if (parts.length > 1 && parts[0].replace(/ +/g, '').toLowerCase().indexOf('region') !== -1 && parts[1].toLowerCase().indexOf('memory') !== -1) {
            let memparts = parts[1].split('=');
            if (memparts.length > 1) {
              currentController.vram = parseInt(memparts[1]);
            }
          }
        }
      }
    }
    if (currentController.vendor || currentController.model || currentController.bus || currentController.vram !== -1 || currentController.vramDynamic) { // already a controller found
      controllers.push(currentController);
    }
    return (controllers);
  }

  function parseLinesLinuxEdid(edid) {
    // parsen EDID
    // --> model
    // --> resolutionx
    // --> resolutiony
    // --> builtin = false
    // --> pixeldepth (?)
    // --> sizex
    // --> sizey
    let result = {
      vendor: '',
      model: '',
      main: false,
      builtin: false,
      connection: '',
      sizex: -1,
      sizey: -1,
      pixeldepth: -1,
      resolutionx: -1,
      resolutiony: -1,
      currentResX: -1,
      currentResY: -1,
      positionX: 0,
      positionY: 0,
      currentRefreshRate: -1
    };
    // find first "Detailed Timing Description"
    let start = 108;
    if (edid.substr(start, 6) === '000000') {
      start += 36;
    }
    if (edid.substr(start, 6) === '000000') {
      start += 36;
    }
    if (edid.substr(start, 6) === '000000') {
      start += 36;
    }
    if (edid.substr(start, 6) === '000000') {
      start += 36;
    }
    result.resolutionx = parseInt('0x0' + edid.substr(start + 8, 1) + edid.substr(start + 4, 2));
    result.resolutiony = parseInt('0x0' + edid.substr(start + 14, 1) + edid.substr(start + 10, 2));
    result.sizex = parseInt('0x0' + edid.substr(start + 28, 1) + edid.substr(start + 24, 2));
    result.sizey = parseInt('0x0' + edid.substr(start + 29, 1) + edid.substr(start + 26, 2));
    // monitor name
    start = edid.indexOf('000000fc00'); // find first "Monitor Description Data"
    if (start >= 0) {
      let model_raw = edid.substr(start + 10, 26);
      if (model_raw.indexOf('0a') !== -1) {
        model_raw = model_raw.substr(0, model_raw.indexOf('0a'));
      }
      try {
        if (model_raw.length > 2) {
          result.model = model_raw.match(/.{1,2}/g).map(function (v) {
            return String.fromCharCode(parseInt(v, 16));
          }).join('');
        }
      } catch (e) {
        util.noop();
      }
    } else {
      result.model = '';
    }
    return result;
  }

  function parseLinesLinuxDisplays(lines, depth) {
    let displays = [];
    let currentDisplay = {
      vendor: '',
      model: '',
      main: false,
      builtin: false,
      connection: '',
      sizex: -1,
      sizey: -1,
      pixeldepth: -1,
      resolutionx: -1,
      resolutiony: -1,
      currentResX: -1,
      currentResY: -1,
      positionX: 0,
      positionY: 0,
      currentRefreshRate: -1
    };
    let is_edid = false;
    let is_current = false;
    let edid_raw = '';
    let start = 0;
    for (let i = 1; i < lines.length; i++) {        // start with second line
      if ('' !== lines[i].trim()) {
        if (' ' !== lines[i][0] && '\t' !== lines[i][0] && lines[i].toLowerCase().indexOf(' connected ') !== -1) {        // first line of new entry
          if (currentDisplay.model || currentDisplay.main || currentDisplay.builtin || currentDisplay.connection || currentDisplay.sizex !== -1 || currentDisplay.pixeldepth !== -1 || currentDisplay.resolutionx !== -1) {         // push last display to array
            displays.push(currentDisplay);
            currentDisplay = {
              vendor: '',
              model: '',
              main: false,
              builtin: false,
              connection: '',
              sizex: -1,
              sizey: -1,
              pixeldepth: -1,
              resolutionx: -1,
              resolutiony: -1,
              currentResX: -1,
              currentResY: -1,
              positionX: 0,
              positionY: 0,
              currentRefreshRate: -1
            };
          }
          let parts = lines[i].split(' ');
          currentDisplay.connection = parts[0];
          currentDisplay.main = lines[i].toLowerCase().indexOf(' primary ') >= 0;
          currentDisplay.builtin = (parts[0].toLowerCase().indexOf('edp') >= 0);
        }

        // try to read EDID information
        if (is_edid) {
          if (lines[i].search(/\S|$/) > start) {
            edid_raw += lines[i].toLowerCase().trim();
          } else {
            // parsen EDID
            let edid_decoded = parseLinesLinuxEdid(edid_raw);
            currentDisplay.vendor = edid_decoded.vendor;
            currentDisplay.model = edid_decoded.model;
            currentDisplay.resolutionx = edid_decoded.resolutionx;
            currentDisplay.resolutiony = edid_decoded.resolutiony;
            currentDisplay.sizex = edid_decoded.sizex;
            currentDisplay.sizey = edid_decoded.sizey;
            currentDisplay.pixeldepth = depth;
            is_edid = false;
          }
        }
        if (lines[i].toLowerCase().indexOf('edid:') >= 0) {
          is_edid = true;
          start = lines[i].search(/\S|$/);
        }
        if (lines[i].toLowerCase().indexOf('*current') >= 0) {
          const parts1 = lines[i].split('(');
          if (parts1 && parts1.length > 1 && parts1[0].indexOf('x') >= 0) {
            const resParts = parts1[0].trim().split('x');
            currentDisplay.currentResX = util.toInt(resParts[0]);
            currentDisplay.currentResY = util.toInt(resParts[1]);
          }
          is_current = true;
        }
        if (is_current && lines[i].toLowerCase().indexOf('clock') >= 0 && lines[i].toLowerCase().indexOf('hz') >= 0 && lines[i].toLowerCase().indexOf('v: height') >= 0) {
          const parts1 = lines[i].split('clock');
          if (parts1 && parts1.length > 1 && parts1[1].toLowerCase().indexOf('hz') >= 0) {
            currentDisplay.currentRefreshRate = util.toInt(parts1[1]);
          }
          is_current = false;
        }
      }
    }

    // pushen displays
    if (currentDisplay.model || currentDisplay.main || currentDisplay.builtin || currentDisplay.connection || currentDisplay.sizex !== -1 || currentDisplay.pixeldepth !== -1 || currentDisplay.resolutionx !== -1) {  // still information there
      displays.push(currentDisplay);
    }
    return displays;
  }

  // function starts here
  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        controllers: [],
        displays: []
      };
      if (_darwin) {
        let cmd = 'system_profiler SPDisplaysDataType';
        exec(cmd, function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            result = parseLinesDarwin(lines);
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_linux) {
        // Raspberry: https://elinux.org/RPI_vcgencmd_usage
        if (util.isRaspberry() && util.isRaspbian()) {
          let cmd = 'fbset -s | grep \'mode "\'; vcgencmd get_mem gpu; tvservice -s; tvservice -n;';
          exec(cmd, function (error, stdout) {
            let lines = stdout.toString().split('\n');
            if (lines.length > 3 && lines[0].indexOf('mode "') >= -1 && lines[2].indexOf('0x12000a') > -1) {
              const parts = lines[0].replace('mode', '').replace(/"/g, '').trim().split('x');
              if (parts.length === 2) {
                result.displays.push({
                  vendor: '',
                  model: util.getValue(lines, 'device_name', '='),
                  main: true,
                  builtin: false,
                  connection: 'HDMI',
                  sizex: -1,
                  sizey: -1,
                  pixeldepth: -1,
                  resolutionx: parseInt(parts[0], 10),
                  resolutiony: parseInt(parts[1], 10),
                  currentResX: -1,
                  currentResY: -1,
                  positionX: 0,
                  positionY: 0,
                  currentRefreshRate: -1
                });
              }
            }
            if (lines.length > 1 && lines[1].indexOf('gpu=') >= -1) {
              result.controllers.push({
                vendor: 'Broadcom',
                model: 'VideoCore IV',
                bus: '',
                vram: lines[1].replace('gpu=', ''),
                vramDynamic: true
              });
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } else {
          let cmd = 'lspci -vvv  2>/dev/null';
          exec(cmd, function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              result.controllers = parseLinesLinuxControllers(lines);
            }
            let cmd = 'xdpyinfo 2>/dev/null | grep \'depth of root window\' | awk \'{ print $5 }\'';
            exec(cmd, function (error, stdout) {
              let depth = 0;
              if (!error) {
                let lines = stdout.toString().split('\n');
                depth = parseInt(lines[0]) || 0;
              }
              let cmd = 'xrandr --verbose 2>/dev/null';
              exec(cmd, function (error, stdout) {
                if (!error) {
                  let lines = stdout.toString().split('\n');
                  result.displays = parseLinesLinuxDisplays(lines, depth);
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              });
            });
          });
        }
      }
      if (_freebsd || _openbsd || _netbsd) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_windows) {

        // https://blogs.technet.microsoft.com/heyscriptingguy/2013/10/03/use-powershell-to-discover-multi-monitor-information/
        // https://devblogs.microsoft.com/scripting/use-powershell-to-discover-multi-monitor-information/
        try {
          const workload = [];
          workload.push(util.wmic('path win32_VideoController get /value'));
          workload.push(util.wmic('path win32_desktopmonitor get /value'));
          workload.push(util.powerShell('Get-CimInstance -Namespace root\\wmi -ClassName WmiMonitorBasicDisplayParams | fl'));
          workload.push(util.powerShell('Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::AllScreens'));
          workload.push(util.powerShell('Get-CimInstance -Namespace root\\wmi -ClassName WmiMonitorConnectionParams | fl'));
          workload.push(util.powerShell('gwmi WmiMonitorID -Namespace root\\wmi | ForEach-Object {(($_.ManufacturerName -notmatch 0 | foreach {[char]$_}) -join "") + "|" + (($_.ProductCodeID -notmatch 0 | foreach {[char]$_}) -join "") + "|" + (($_.UserFriendlyName -notmatch 0 | foreach {[char]$_}) -join "") + "|" + (($_.SerialNumberID -notmatch 0 | foreach {[char]$_}) -join "") + "|" + $_.InstanceName}'));

          Promise.all(
            workload
          ).then(data => {
            // controller
            let csections = data[0].split(/\n\s*\n/);
            result.controllers = parseLinesWindowsControllers(csections);

            // displays
            let dsections = data[1].split(/\n\s*\n/);
            // result.displays = parseLinesWindowsDisplays(dsections);
            dsections.shift();
            dsections.pop();

            // monitor (powershell)
            let msections = data[2].split('Active ');
            msections.shift();

            // forms.screens (powershell)
            let ssections = data[3].split('BitsPerPixel ');
            ssections.shift();

            // connection params (powershell) - video type
            let tsections = data[4].split(/\n\s*\n/);
            tsections.shift();

            // monitor ID (powershell) - model / vendor
            const res = data[5].split(/\r\n/);
            let isections = [];
            res.forEach(element => {
              const parts = element.split('|');
              if (parts.length === 5) {
                isections.push({
                  vendor: parts[0],
                  code: parts[1],
                  model: parts[2],
                  serial: parts[3],
                  instanceId: parts[4]
                });
              }
            });
            result.displays = parseLinesWindowsDisplaysPowershell(ssections, msections, dsections, tsections, isections);

            if (result.displays.length === 1) {
              if (_resolutionx) {
                result.displays[0].resolutionx = _resolutionx;
                if (!result.displays[0].currentResX) {
                  result.displays[0].currentResX = _resolutionx;
                }
              }
              if (_resolutiony) {
                result.displays[0].resolutiony = _resolutiony;
                if (result.displays[0].currentResY === 0) {
                  result.displays[0].currentResY = _resolutiony;
                }
              }
              if (_pixeldepth) {
                result.displays[0].pixeldepth = _pixeldepth;
              }
              if (_refreshrate && !result.displays[0].refreshrate) {
                result.displays[0].currentRefreshRate = _refreshrate;
              }
            }

            if (callback) {
              callback(result);
            }
            resolve(result);
          })
            .catch(() => {
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });

  function parseLinesWindowsControllers(sections) {
    let controllers = [];
    for (let i in sections) {
      if ({}.hasOwnProperty.call(sections, i)) {
        if (sections[i].trim() !== '') {

          let lines = sections[i].trim().split('\r\n');
          controllers.push({
            vendor: util.getValue(lines, 'AdapterCompatibility', '='),
            model: util.getValue(lines, 'name', '='),
            bus: util.getValue(lines, 'PNPDeviceID', '=').startsWith('PCI') ? 'PCI' : '',
            vram: parseInt(util.getValue(lines, 'AdapterRAM', '='), 10) / 1024 / 1024,
            vramDynamic: (util.getValue(lines, 'VideoMemoryType', '=') === '2')
          });
          _resolutionx = util.toInt(util.getValue(lines, 'CurrentHorizontalResolution', '=')) || _resolutionx;
          _resolutiony = util.toInt(util.getValue(lines, 'CurrentVerticalResolution', '=')) || _resolutiony;
          _refreshrate = util.toInt(util.getValue(lines, 'CurrentRefreshRate', '=')) || _refreshrate;
          _pixeldepth = util.toInt(util.getValue(lines, 'CurrentBitsPerPixel', '=')) || _pixeldepth;
        }
      }
    }
    return controllers;
  }

  // function parseLinesWindowsDisplays(sections) {
  //   let displays = [];
  //   for (let i in sections) {
  //     if (sections.hasOwnProperty(i)) {
  //       if (sections[i].trim() !== '') {
  //         let lines = sections[i].trim().split('\r\n');
  //         displays.push({
  //           vendor: util.getValue(lines, 'MonitorManufacturer', '='),
  //           model: util.getValue(lines, 'Name', '='),
  //           main: false,
  //           builtin: false,
  //           connection: '',
  //           sizex: -1,
  //           sizey: -1,
  //           pixeldepth: -1,
  //           resolutionx: util.toInt(util.getValue(lines, 'ScreenWidth', '=')),
  //           resolutiony: util.toInt(util.getValue(lines, 'ScreenHeight', '=')),
  //         });
  //       }
  //     }
  //   }
  //   return displays;
  // }

  function parseLinesWindowsDisplaysPowershell(ssections, msections, dsections, tsections, isections) {
    let displays = [];
    let vendor = '';
    let model = '';
    let deviceID = '';
    let resolutionx = 0;
    let resolutiony = 0;
    if (dsections && dsections.length) {
      let linesDisplay = dsections[0].split(os.EOL);
      vendor = util.getValue(linesDisplay, 'MonitorManufacturer', '=');
      model = util.getValue(linesDisplay, 'Name', '=');
      deviceID = util.getValue(linesDisplay, 'PNPDeviceID', '=').replace(/&amp;/g, '&').toLowerCase();
      resolutionx = util.toInt(util.getValue(linesDisplay, 'ScreenWidth', '='));
      resolutiony = util.toInt(util.getValue(linesDisplay, 'ScreenHeight', '='));
    }
    for (let i = 0; i < ssections.length; i++) {
      if (ssections[i].trim() !== '') {
        ssections[i] = 'BitsPerPixel ' + ssections[i];
        msections[i] = 'Active ' + msections[i];

        let linesScreen = ssections[i].split(os.EOL);
        let linesMonitor = msections[i].split(os.EOL);
        let linesConnection = tsections[i].split(os.EOL);
        const bitsPerPixel = util.getValue(linesScreen, 'BitsPerPixel');
        const bounds = util.getValue(linesScreen, 'Bounds').replace('{', '').replace('}', '').split(',');
        const primary = util.getValue(linesScreen, 'Primary');
        const sizex = util.getValue(linesMonitor, 'MaxHorizontalImageSize');
        const sizey = util.getValue(linesMonitor, 'MaxVerticalImageSize');
        const instanceName = util.getValue(linesMonitor, 'InstanceName').toLowerCase();
        const videoOutputTechnology = util.getValue(linesConnection, 'VideoOutputTechnology');
        let displayVendor = '';
        let displayModel = '';
        isections.forEach(element => {
          if (element.instanceId.toLowerCase().startsWith(instanceName) && vendor.startsWith('(') && model.startsWith('PnP')) {
            displayVendor = element.vendor;
            displayModel = element.model;
          }
        });
        displays.push({
          vendor: instanceName.startsWith(deviceID) && displayVendor === '' ? vendor : displayVendor,
          model: instanceName.startsWith(deviceID) && displayModel === '' ? model : displayModel,
          main: primary.toLowerCase() === 'true',
          builtin: videoOutputTechnology === '2147483648',
          connection: videoOutputTechnology && videoTypes[videoOutputTechnology] ? videoTypes[videoOutputTechnology] : '',
          resolutionx: util.toInt(util.getValue(bounds, 'Width', '=')),
          resolutiony: util.toInt(util.getValue(bounds, 'Height', '=')),
          sizex: sizex ? parseInt(sizex, 10) : -1,
          sizey: sizey ? parseInt(sizey, 10) : -1,
          pixeldepth: bitsPerPixel,
          currentResX: util.toInt(util.getValue(bounds, 'Width', '=')),
          currentResY: util.toInt(util.getValue(bounds, 'Height', '=')),
          positionX: util.toInt(util.getValue(bounds, 'X', '=')),
          positionY: util.toInt(util.getValue(bounds, 'Y', '=')),
        });
      }
    }
    if (ssections.length === 0) {
      displays.push({
        vendor,
        model,
        main: true,
        resolutionx,
        resolutiony,
        sizex: -1,
        sizey: -1,
        pixeldepth: -1,
        currentResX: resolutionx,
        currentResY: resolutiony,
        positionX: 0,
        positionY: 0
      });
    }
    return displays;
  }

}

exports.graphics = graphics;


/***/ }),

/***/ "./node_modules/systeminformation/lib/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/systeminformation/lib/index.js ***!
  \*****************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// index.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// Contributors:  Guillaume Legrain (https://github.com/glegrain)
//                Riccardo Novaglia (https://github.com/richy24)
//                Quentin Busuttil (https://github.com/Buzut)
//                Lapsio (https://github.com/lapsio)
//                csy (https://github.com/csy1983)
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================

// ----------------------------------------------------------------------------------
// Dependencies
// ----------------------------------------------------------------------------------

const lib_version = __webpack_require__(/*! ../package.json */ "./node_modules/systeminformation/package.json").version;
const util = __webpack_require__(/*! ./util */ "./node_modules/systeminformation/lib/util.js");
const system = __webpack_require__(/*! ./system */ "./node_modules/systeminformation/lib/system.js");
const osInfo = __webpack_require__(/*! ./osinfo */ "./node_modules/systeminformation/lib/osinfo.js");
const cpu = __webpack_require__(/*! ./cpu */ "./node_modules/systeminformation/lib/cpu.js");
const memory = __webpack_require__(/*! ./memory */ "./node_modules/systeminformation/lib/memory.js");
const battery = __webpack_require__(/*! ./battery */ "./node_modules/systeminformation/lib/battery.js");
const graphics = __webpack_require__(/*! ./graphics */ "./node_modules/systeminformation/lib/graphics.js");
const filesystem = __webpack_require__(/*! ./filesystem */ "./node_modules/systeminformation/lib/filesystem.js");
const network = __webpack_require__(/*! ./network */ "./node_modules/systeminformation/lib/network.js");
const wifi = __webpack_require__(/*! ./wifi */ "./node_modules/systeminformation/lib/wifi.js");
const processes = __webpack_require__(/*! ./processes */ "./node_modules/systeminformation/lib/processes.js");
const users = __webpack_require__(/*! ./users */ "./node_modules/systeminformation/lib/users.js");
const internet = __webpack_require__(/*! ./internet */ "./node_modules/systeminformation/lib/internet.js");
const docker = __webpack_require__(/*! ./docker */ "./node_modules/systeminformation/lib/docker.js");
const vbox = __webpack_require__(/*! ./virtualbox */ "./node_modules/systeminformation/lib/virtualbox.js");

let _platform = process.platform;
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

// ----------------------------------------------------------------------------------
// init
// ----------------------------------------------------------------------------------

if (_windows) {
  util.getCodepage();
}

// ----------------------------------------------------------------------------------
// General
// ----------------------------------------------------------------------------------

function version() {
  return lib_version;
}

// ----------------------------------------------------------------------------------
// Get static and dynamic data (all)
// ----------------------------------------------------------------------------------

// --------------------------
// get static data - they should not change until restarted

function getStaticData(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let data = {};

      data.version = version();

      Promise.all([
        system.system(),
        system.bios(),
        system.baseboard(),
        system.chassis(),
        osInfo.osInfo(),
        osInfo.uuid(),
        osInfo.versions(),
        cpu.cpu(),
        cpu.cpuFlags(),
        graphics.graphics(),
        network.networkInterfaces(),
        memory.memLayout(),
        filesystem.diskLayout()
      ]).then(res => {
        data.system = res[0];
        data.bios = res[1];
        data.baseboard = res[2];
        data.chassis = res[3];
        data.os = res[4];
        data.uuid = res[5];
        data.versions = res[6];
        data.cpu = res[7];
        data.cpu.flags = res[8];
        data.graphics = res[9];
        data.net = res[10];
        data.memLayout = res[11];
        data.diskLayout = res[12];
        if (callback) { callback(data); }
        resolve(data);
      });
    });
  });
}


// --------------------------
// get all dynamic data - e.g. for monitoring agents
// may take some seconds to get all data
// --------------------------
// 2 additional parameters needed
// - srv: 		comma separated list of services to monitor e.g. "mysql, apache, postgresql"
// - iface:	define network interface for which you like to monitor network speed e.g. "eth0"

function getDynamicData(srv, iface, callback) {

  if (util.isFunction(iface)) {
    callback = iface;
    iface = '';
  }
  if (util.isFunction(srv)) {
    callback = srv;
    srv = '';
  }

  return new Promise((resolve) => {
    process.nextTick(() => {

      iface = iface || network.getDefaultNetworkInterface();
      srv = srv || '';

      // use closure to track ƒ completion
      let functionProcessed = (function () {
        let totalFunctions = 14;
        if (_windows) totalFunctions = 10;
        if (_freebsd || _openbsd || _netbsd) totalFunctions = 11;
        if (_sunos) totalFunctions = 6;

        return function () {
          if (--totalFunctions === 0) {
            if (callback) {
              callback(data);
            }
            resolve(data);
          }
        };
      })();

      // var totalFunctions = 14;
      // function functionProcessed() {
      //   if (--totalFunctions === 0) {
      //     if (callback) { callback(data) }
      //     resolve(data);
      //   }
      // }

      let data = {};

      // get time
      data.time = osInfo.time();

      /**
       * @namespace
       * @property {Object}  versions
       * @property {string}  versions.node
       * @property {string}  versions.v8
       */
      data.node = process.versions.node;
      data.v8 = process.versions.v8;

      cpu.cpuCurrentspeed().then(res => {
        data.cpuCurrentspeed = res;
        functionProcessed();
      });

      users.users().then(res => {
        data.users = res;
        functionProcessed();
      });

      if (!_windows) {
        processes.processes().then(res => {
          data.processes = res;
          functionProcessed();
        });
      }

      cpu.currentLoad().then(res => {
        data.currentLoad = res;
        functionProcessed();
      });

      if (!_sunos) {
        cpu.cpuTemperature().then(res => {
          data.temp = res;
          functionProcessed();
        });
      }

      if (!_openbsd && !_freebsd && !_netbsd && !_sunos) {
        network.networkStats(iface).then(res => {
          data.networkStats = res;
          functionProcessed();
        });
      }

      if (!_sunos) {
        network.networkConnections().then(res => {
          data.networkConnections = res;
          functionProcessed();
        });
      }

      memory.mem().then(res => {
        data.mem = res;
        functionProcessed();
      });

      if (!_sunos) {
        battery().then(res => {
          data.battery = res;
          functionProcessed();
        });
      }

      if (!_windows && !_sunos) {
        processes.services(srv).then(res => {
          data.services = res;
          functionProcessed();
        });
      }

      if (!_sunos) {
        filesystem.fsSize().then(res => {
          data.fsSize = res;
          functionProcessed();
        });
      }

      if (!_windows && !_openbsd && !_freebsd && !_netbsd && !_sunos) {
        filesystem.fsStats().then(res => {
          data.fsStats = res;
          functionProcessed();
        });
      }

      if (!_windows && !_openbsd && !_freebsd && !_netbsd && !_sunos) {
        filesystem.disksIO().then(res => {
          data.disksIO = res;
          functionProcessed();
        });
      }

      internet.inetLatency().then(res => {
        data.inetLatency = res;
        functionProcessed();
      });
    });
  });
}

// --------------------------
// get all data at once
// --------------------------
// 2 additional parameters needed
// - srv: 		comma separated list of services to monitor e.g. "mysql, apache, postgresql"
// - iface:	define network interface for which you like to monitor network speed e.g. "eth0"

function getAllData(srv, iface, callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let data = {};

      if (iface && util.isFunction(iface) && !callback) {
        callback = iface;
        iface = '';
      }

      if (srv && util.isFunction(srv) && !iface && !callback) {
        callback = srv;
        srv = '';
        iface = '';
      }

      getStaticData().then(res => {
        data = res;
        getDynamicData(srv, iface).then(res => {
          for (let key in res) {
            if ({}.hasOwnProperty.call(res, key)) {
              data[key] = res[key];
            }
          }
          if (callback) { callback(data); }
          resolve(data);
        });
      });
    });
  });
}

// ----------------------------------------------------------------------------------
// export all libs
// ----------------------------------------------------------------------------------

exports.version = version;
exports.system = system.system;
exports.bios = system.bios;
exports.baseboard = system.baseboard;
exports.chassis = system.chassis;

exports.time = osInfo.time;
exports.osInfo = osInfo.osInfo;
exports.versions = osInfo.versions;
exports.shell = osInfo.shell;
exports.uuid = osInfo.uuid;

exports.cpu = cpu.cpu;
exports.cpuFlags = cpu.cpuFlags;
exports.cpuCache = cpu.cpuCache;
exports.cpuCurrentspeed = cpu.cpuCurrentspeed;
exports.cpuTemperature = cpu.cpuTemperature;
exports.currentLoad = cpu.currentLoad;
exports.fullLoad = cpu.fullLoad;

exports.mem = memory.mem;
exports.memLayout = memory.memLayout;

exports.battery = battery;

exports.graphics = graphics.graphics;

exports.fsSize = filesystem.fsSize;
exports.fsOpenFiles = filesystem.fsOpenFiles;
exports.blockDevices = filesystem.blockDevices;
exports.fsStats = filesystem.fsStats;
exports.disksIO = filesystem.disksIO;
exports.diskLayout = filesystem.diskLayout;

exports.networkInterfaceDefault = network.networkInterfaceDefault;
exports.networkGatewayDefault = network.networkGatewayDefault;
exports.networkInterfaces = network.networkInterfaces;
exports.networkStats = network.networkStats;
exports.networkConnections = network.networkConnections;

exports.wifiNetworks = wifi.wifiNetworks;

exports.services = processes.services;
exports.processes = processes.processes;
exports.processLoad = processes.processLoad;

exports.users = users.users;

exports.inetChecksite = internet.inetChecksite;
exports.inetLatency = internet.inetLatency;

exports.dockerInfo = docker.dockerInfo;
exports.dockerContainers = docker.dockerContainers;
exports.dockerContainerStats = docker.dockerContainerStats;
exports.dockerContainerProcesses = docker.dockerContainerProcesses;
exports.dockerAll = docker.dockerAll;

exports.vboxInfo = vbox.vboxInfo;

exports.getStaticData = getStaticData;
exports.getDynamicData = getDynamicData;
exports.getAllData = getAllData;


/***/ }),

/***/ "./node_modules/systeminformation/lib/internet.js":
/*!********************************************************!*\
  !*** ./node_modules/systeminformation/lib/internet.js ***!
  \********************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// internet.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 12. Internet
// ----------------------------------------------------------------------------------

const exec = __webpack_require__(/*! child_process */ "child_process").exec;
const util = __webpack_require__(/*! ./util */ "./node_modules/systeminformation/lib/util.js");

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

// --------------------------
// check if external site is available

function inetChecksite(url, callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        url: url,
        ok: false,
        status: 404,
        ms: -1
      };
      if (url) {
        url = url.toLowerCase();
        let t = Date.now();
        if (_linux || _freebsd || _openbsd || _netbsd || _darwin || _sunos) {
          let args = ' -I --connect-timeout 5 -m 5 ' + url + ' 2>/dev/null | head -n 1 | cut -d " " -f2';
          let cmd = 'curl';
          exec(cmd + args, function (error, stdout) {
            let statusCode = parseInt(stdout.toString());
            result.status = statusCode || 404;
            result.ok = !error && (statusCode === 200 || statusCode === 301 || statusCode === 302 || statusCode === 304);
            result.ms = (result.ok ? Date.now() - t : -1);
            if (callback) { callback(result); }
            resolve(result);
          });
        }
        if (_windows) {   // if this is stable, this can be used for all OS types
          const http = (url.startsWith('https:') ? __webpack_require__(/*! https */ "https") : __webpack_require__(/*! http */ "http"));
          try {
            http.get(url, (res) => {
              const statusCode = res.statusCode;

              result.status = statusCode || 404;
              result.ok = (statusCode === 200 || statusCode === 301 || statusCode === 302 || statusCode === 304);

              if (statusCode !== 200) {
                res.resume();
                result.ms = (result.ok ? Date.now() - t : -1);
                if (callback) { callback(result); }
                resolve(result);
              } else {
                res.on('data', () => { });
                res.on('end', () => {
                  result.ms = (result.ok ? Date.now() - t : -1);
                  if (callback) { callback(result); }
                  resolve(result);
                });
              }
            }).on('error', () => {
              if (callback) { callback(result); }
              resolve(result);
            });
          } catch (err) {
            if (callback) { callback(result); }
            resolve(result);
          }
        }
      } else {
        if (callback) { callback(result); }
        resolve(result);
      }
    });
  });
}

exports.inetChecksite = inetChecksite;

// --------------------------
// check inet latency

function inetLatency(host, callback) {

  // fallback - if only callback is given
  if (util.isFunction(host) && !callback) {
    callback = host;
    host = '';
  }

  host = host || '8.8.8.8';

  return new Promise((resolve) => {
    process.nextTick(() => {
      let cmd;
      if (_linux || _freebsd || _openbsd || _netbsd || _darwin) {
        if (_linux) {
          cmd = 'ping -c 2 -w 3 ' + host + ' | grep rtt';
        }
        if (_freebsd || _openbsd || _netbsd) {
          cmd = 'ping -c 2 -t 3 ' + host + ' | grep round-trip';
        }
        if (_darwin) {
          cmd = 'ping -c 2 -t 3 ' + host + ' | grep avg';
        }

        exec(cmd, function (error, stdout) {
          let result = -1;
          if (!error) {
            const line = stdout.toString().split('=');
            if (line.length > 1) {
              const parts = line[1].split('/');
              if (parts.length > 1) {
                result = parseFloat(parts[1]);
              }
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        exec('ping -s -a ' + host + ' 56 2 | grep avg', { timeout: 3000 }, function (error, stdout) {
          let result = -1;
          if (!error) {
            const line = stdout.toString().split('=');
            if (line.length > 1) {
              const parts = line[1].split('/');
              if (parts.length > 1) {
                result = parseFloat(parts[1].replace(',', '.'));
              }
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_windows) {
        let result = -1;
        try {
          exec('ping ' + host + ' -n 1', util.execOptsWin, function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\r\n');
              lines.shift();
              lines.forEach(function (line) {
                if ((line.toLowerCase().match(/ms/g) || []).length === 3) {
                  let l = line.replace(/ +/g, ' ').split(' ');
                  if (l.length > 6) {
                    result = parseFloat(l[l.length - 1]);
                  }
                }
              });
            }
            if (callback) { callback(result); }
            resolve(result);
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.inetLatency = inetLatency;


/***/ }),

/***/ "./node_modules/systeminformation/lib/memory.js":
/*!******************************************************!*\
  !*** ./node_modules/systeminformation/lib/memory.js ***!
  \******************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// memory.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 5. Memory
// ----------------------------------------------------------------------------------

const os = __webpack_require__(/*! os */ "os");
const exec = __webpack_require__(/*! child_process */ "child_process").exec;
const execSync = __webpack_require__(/*! child_process */ "child_process").execSync;
const util = __webpack_require__(/*! ./util */ "./node_modules/systeminformation/lib/util.js");
const fs = __webpack_require__(/*! fs */ "fs");

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

const OSX_RAM_manufacturers = {
  '0x014F': 'Transcend Information',
  '0x2C00': 'Micron Technology Inc.',
  '0x802C': 'Micron Technology Inc.',
  '0x80AD': 'Hynix Semiconductor Inc.',
  '0x80CE': 'Samsung Electronics Inc.',
  '0xAD00': 'Hynix Semiconductor Inc.',
  '0xCE00': 'Samsung Electronics Inc.',
  '0x02FE': 'Elpida',
  '0x5105': 'Qimonda AG i. In.',
  '0x8551': 'Qimonda AG i. In.',
  '0x859B': 'Crucial',
  '0x04CD': 'G-Skill'
};

// _______________________________________________________________________________________
// |                         R A M                              |          H D           |
// |______________________|_________________________|           |                        |
// |        active             buffers/cache        |           |                        |
// |________________________________________________|___________|_________|______________|
// |                     used                            free   |   used       free      |
// |____________________________________________________________|________________________|
// |                        total                               |          swap          |
// |____________________________________________________________|________________________|

// free (older versions)
// ----------------------------------
// # free
//              total       used        free     shared    buffers     cached
// Mem:         16038 (1)   15653 (2)   384 (3)  0 (4)     236 (5)     14788 (6)
// -/+ buffers/cache:       628 (7)     15409 (8)
// Swap:        16371         83      16288
//
// |------------------------------------------------------------|
// |                           R A M                            |
// |______________________|_____________________________________|
// | active (2-(5+6) = 7) |  available (3+5+6 = 8)              |
// |______________________|_________________________|___________|
// |        active        |  buffers/cache (5+6)    |           |
// |________________________________________________|___________|
// |                   used (2)                     | free (3)  |
// |____________________________________________________________|
// |                          total (1)                         |
// |____________________________________________________________|

//
// free (since free von procps-ng 3.3.10)
// ----------------------------------
// # free
//              total       used        free     shared    buffers/cache   available
// Mem:         16038 (1)   628 (2)     386 (3)  0 (4)     15024 (5)     14788 (6)
// Swap:        16371         83      16288
//
// |------------------------------------------------------------|
// |                           R A M                            |
// |______________________|_____________________________________|
// |                      |      available (6) estimated        |
// |______________________|_________________________|___________|
// |     active (2)       |   buffers/cache (5)     | free (3)  |
// |________________________________________________|___________|
// |                          total (1)                         |
// |____________________________________________________________|
//
// Reference: http://www.software-architect.net/blog/article/date/2015/06/12/-826c6e5052.html

// /procs/meminfo - sample (all in kB)
//
// MemTotal: 32806380 kB
// MemFree: 17977744 kB
// MemAvailable: 19768972 kB
// Buffers: 517028 kB
// Cached: 2161876 kB
// SwapCached: 456 kB
// Active: 12081176 kB
// Inactive: 2164616 kB
// Active(anon): 10832884 kB
// Inactive(anon): 1477272 kB
// Active(file): 1248292 kB
// Inactive(file): 687344 kB
// Unevictable: 0 kB
// Mlocked: 0 kB
// SwapTotal: 16768892 kB
// SwapFree: 16768304 kB
// Dirty: 268 kB
// Writeback: 0 kB
// AnonPages: 11568832 kB
// Mapped: 719992 kB
// Shmem: 743272 kB
// Slab: 335716 kB
// SReclaimable: 256364 kB
// SUnreclaim: 79352 kB

function mem(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),

        active: os.totalmem() - os.freemem(),     // temporarily (fallback)
        available: os.freemem(),                  // temporarily (fallback)
        buffers: 0,
        cached: 0,
        slab: 0,
        buffcache: 0,

        swaptotal: 0,
        swapused: 0,
        swapfree: 0
      };

      if (_linux) {
        fs.readFile('/proc/meminfo', function (error, stdout) {
          if (!error) {
            const lines = stdout.toString().split('\n');
            result.total = parseInt(util.getValue(lines, 'memtotal'), 10);
            result.total = result.total ? result.total * 1024 : os.totalmem();
            result.free = parseInt(util.getValue(lines, 'memfree'), 10);
            result.free = result.free ? result.free * 1024 : os.freemem();
            result.used = result.total - result.free;

            result.buffers = parseInt(util.getValue(lines, 'buffers'), 10);
            result.buffers = result.buffers ? result.buffers * 1024 : 0;
            result.cached = parseInt(util.getValue(lines, 'cached'), 10);
            result.cached = result.cached ? result.cached * 1024 : 0;
            result.slab = parseInt(util.getValue(lines, 'slab'), 10);
            result.slab = result.slab ? result.slab * 1024 : 0;
            result.buffcache = result.buffers + result.cached + result.slab;

            let available = parseInt(util.getValue(lines, 'memavailable'), 10);
            result.available = available ? available * 1024 : result.free + result.buffcache;
            result.active = result.total - result.available;

            result.swaptotal = parseInt(util.getValue(lines, 'swaptotal'), 10);
            result.swaptotal = result.swaptotal ? result.swaptotal * 1024 : 0;
            result.swapfree = parseInt(util.getValue(lines, 'swapfree'), 10);
            result.swapfree = result.swapfree ? result.swapfree * 1024 : 0;
            result.swapused = result.swaptotal - result.swapfree;
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_freebsd || _openbsd || _netbsd) {
        exec('/sbin/sysctl -a 2>/dev/null | grep -E "hw.realmem|hw.physmem|vm.stats.vm.v_page_count|vm.stats.vm.v_wire_count|vm.stats.vm.v_active_count|vm.stats.vm.v_inactive_count|vm.stats.vm.v_cache_count|vm.stats.vm.v_free_count|vm.stats.vm.v_page_size"', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            const pagesize = parseInt(util.getValue(lines, 'vm.stats.vm.v_page_size'), 10);
            const inactive = parseInt(util.getValue(lines, 'vm.stats.vm.v_inactive_count'), 10) * pagesize;
            const cache = parseInt(util.getValue(lines, 'vm.stats.vm.v_cache_count'), 10) * pagesize;

            result.total = parseInt(util.getValue(lines, 'hw.realmem'), 10);
            if (isNaN(result.total)) result.total = parseInt(util.getValue(lines, 'hw.physmem'), 10);
            result.free = parseInt(util.getValue(lines, 'vm.stats.vm.v_free_count'), 10) * pagesize;
            result.buffcache = inactive + cache;
            result.available = result.buffcache + result.free;
            result.active = result.total - result.free - result.buffcache;

            result.swaptotal = 0;
            result.swapfree = 0;
            result.swapused = 0;

          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_darwin) {
        exec('vm_stat 2>/dev/null | grep "Pages active"', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');

            result.active = parseInt(lines[0].split(':')[1], 10) * 4096;
            result.buffcache = result.used - result.active;
            result.available = result.free + result.buffcache;
          }
          exec('sysctl -n vm.swapusage 2>/dev/null', function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              if (lines.length > 0) {
                let line = lines[0].replace(/,/g, '.').replace(/M/g, '');
                line = line.trim().split('  ');
                for (let i = 0; i < line.length; i++) {
                  if (line[i].toLowerCase().indexOf('total') !== -1) result.swaptotal = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;
                  if (line[i].toLowerCase().indexOf('used') !== -1) result.swapused = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;
                  if (line[i].toLowerCase().indexOf('free') !== -1) result.swapfree = parseFloat(line[i].split('=')[1].trim()) * 1024 * 1024;
                }
              }
            }
            if (callback) { callback(result); }
            resolve(result);
          });
        });
      }
      if (_windows) {
        let swaptotal = 0;
        let swapused = 0;
        try {
          util.wmic('pagefile get AllocatedBaseSize, CurrentUsage').then((stdout, error) => {
            if (!error) {
              let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
              lines.forEach(function (line) {
                if (line !== '') {
                  line = line.trim().split(/\s\s+/);
                  swaptotal = swaptotal + parseInt(line[0], 10);
                  swapused = swapused + parseInt(line[1], 10);
                }
              });
            }
            result.swaptotal = swaptotal * 1024 * 1024;
            result.swapused = swapused * 1024 * 1024;
            result.swapfree = result.swaptotal - result.swapused;

            if (callback) { callback(result); }
            resolve(result);
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.mem = mem;

function memLayout(callback) {

  function getManufacturer(manId) {
    if ({}.hasOwnProperty.call(OSX_RAM_manufacturers, manId)) {
      return (OSX_RAM_manufacturers[manId]);
    }
    return manId;
  }

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = [];

      if (_linux || _freebsd || _openbsd || _netbsd) {
        exec('export LC_ALL=C; dmidecode -t memory 2>/dev/null | grep -iE "Size:|Type|Speed|Manufacturer|Form Factor|Locator|Memory Device|Serial Number|Voltage|Part Number"; unset LC_ALL', function (error, stdout) {
          if (!error) {
            let devices = stdout.toString().split('Memory Device');
            devices.shift();
            devices.forEach(function (device) {
              let lines = device.split('\n');
              const sizeString = util.getValue(lines, 'Size');
              const size = sizeString.indexOf('GB') >= 0 ? parseInt(sizeString, 10) * 1024 * 1024 * 1024 : parseInt(sizeString, 10) * 1024 * 1024;
              if (parseInt(util.getValue(lines, 'Size'), 10) > 0) {
                result.push({
                  size,
                  bank: util.getValue(lines, 'Bank Locator'),
                  type: util.getValue(lines, 'Type:'),
                  clockSpeed: (util.getValue(lines, 'Configured Clock Speed:') ? parseInt(util.getValue(lines, 'Configured Clock Speed:'), 10) : (util.getValue(lines, 'Speed:') ? parseInt(util.getValue(lines, 'Speed:'), 10) : -1)),
                  formFactor: util.getValue(lines, 'Form Factor:'),
                  manufacturer: util.getValue(lines, 'Manufacturer:'),
                  partNum: util.getValue(lines, 'Part Number:'),
                  serialNum: util.getValue(lines, 'Serial Number:'),
                  voltageConfigured: parseFloat(util.getValue(lines, 'Configured Voltage:') || -1),
                  voltageMin: parseFloat(util.getValue(lines, 'Minimum Voltage:') || -1),
                  voltageMax: parseFloat(util.getValue(lines, 'Maximum Voltage:') || -1),
                });
              } else {
                result.push({
                  size: 0,
                  bank: util.getValue(lines, 'Bank Locator'),
                  type: 'Empty',
                  clockSpeed: 0,
                  formFactor: util.getValue(lines, 'Form Factor:'),
                  partNum: '',
                  serialNum: '',
                  voltageConfigured: -1,
                  voltageMin: -1,
                  voltageMax: -1,
                });
              }
            });
          }
          if (!result.length) {
            result.push({
              size: os.totalmem(),
              bank: '',
              type: '',
              clockSpeed: 0,
              formFactor: '',
              partNum: '',
              serialNum: '',
              voltageConfigured: -1,
              voltageMin: -1,
              voltageMax: -1,
            });

            // Try Raspberry PI
            try {
              let stdout = execSync('cat /proc/cpuinfo 2>/dev/null');
              let lines = stdout.toString().split('\n');
              let model = util.getValue(lines, 'hardware', ':', true).toUpperCase();
              let version = util.getValue(lines, 'revision', ':', true).toLowerCase();

              if (model === 'BCM2835' || model === 'BCM2708' || model === 'BCM2709' || model === 'BCM2835' || model === 'BCM2837') {

                const clockSpeed = {
                  '0': 400,
                  '1': 450,
                  '2': 450,
                  '3': 3200
                };
                result[0].clockSpeed = version && version[2] && clockSpeed[version[2]] || 400;
                result[0].clockSpeed = version && version[4] && version[4] === 'd' ? '500' : result[0].clockSpeed;
                result[0].type = 'LPDDR2';
                result[0].type = version && version[2] && version[2] === '3' ? 'LPDDR4' : result[0].type;
                result[0].formFactor = 'SoC';

                stdout = execSync('vcgencmd get_config sdram_freq 2>/dev/null');
                lines = stdout.toString().split('\n');
                let freq = parseInt(util.getValue(lines, 'sdram_freq', '=', true), 10) || 0;
                if (freq) {
                  result.clockSpeed = freq;
                }

                stdout = execSync('vcgencmd measure_volts sdram_p 2>/dev/null');
                lines = stdout.toString().split('\n');
                let voltage = parseFloat(util.getValue(lines, 'volt', '=', true)) || 0;
                if (voltage) {
                  result[0].voltageConfigured = voltage;
                  result[0].voltageMin = voltage;
                  result[0].voltageMax = voltage;
                }
              }
            } catch (e) {
              util.noop();
            }

          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }

      if (_darwin) {
        exec('system_profiler SPMemoryDataType', function (error, stdout) {
          if (!error) {
            let devices = stdout.toString().split('        BANK ');
            let hasBank = true;
            if (devices.length === 1) {
              devices = stdout.toString().split('        DIMM');
              hasBank = false;
            }
            devices.shift();
            devices.forEach(function (device) {
              let lines = device.split('\n');
              const bank = (hasBank ? 'BANK ' : 'DIMM') + lines[0].trim().split('/')[0];
              const size = parseInt(util.getValue(lines, '          Size'));
              if (size) {
                result.push({
                  size: size * 1024 * 1024 * 1024,
                  bank: bank,
                  type: util.getValue(lines, '          Type:'),
                  clockSpeed: parseInt(util.getValue(lines, '          Speed:'), 10),
                  formFactor: '',
                  manufacturer: getManufacturer(util.getValue(lines, '          Manufacturer:')),
                  partNum: util.getValue(lines, '          Part Number:'),
                  serialNum: util.getValue(lines, '          Serial Number:'),
                  voltageConfigured: -1,
                  voltageMin: -1,
                  voltageMax: -1,
                });
              } else {
                result.push({
                  size: 0,
                  bank: bank,
                  type: 'Empty',
                  clockSpeed: 0,
                  formFactor: '',
                  manufacturer: '',
                  partNum: '',
                  serialNum: '',
                  voltageConfigured: -1,
                  voltageMin: -1,
                  voltageMax: -1,
                });
              }
            });
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_windows) {
        const memoryTypes = 'Unknown|Other|DRAM|Synchronous DRAM|Cache DRAM|EDO|EDRAM|VRAM|SRAM|RAM|ROM|FLASH|EEPROM|FEPROM|EPROM|CDRAM|3DRAM|SDRAM|SGRAM|RDRAM|DDR|DDR2|DDR2 FB-DIMM|Reserved|DDR3|FBD2|DDR4|LPDDR|LPDDR2|LPDDR3|LPDDR4'.split('|');
        const FormFactors = 'Unknown|Other|SIP|DIP|ZIP|SOJ|Proprietary|SIMM|DIMM|TSOP|PGA|RIMM|SODIMM|SRIMM|SMD|SSMP|QFP|TQFP|SOIC|LCC|PLCC|BGA|FPBGA|LGA'.split('|');

        try {
          util.wmic('memorychip get /value').then((stdout, error) => {
            if (!error) {
              let devices = stdout.toString().split('BankL');
              devices.shift();
              devices.forEach(function (device) {
                let lines = device.split('\r\n');
                result.push({
                  size: parseInt(util.getValue(lines, 'Capacity', '='), 10) || 0,
                  bank: util.getValue(lines, 'abel', '='), // BankLabel
                  type: memoryTypes[parseInt(util.getValue(lines, 'MemoryType', '='), 10)],
                  clockSpeed: parseInt(util.getValue(lines, 'ConfiguredClockSpeed', '='), 10) || 0,
                  formFactor: FormFactors[parseInt(util.getValue(lines, 'FormFactor', '='), 10) || 0],
                  manufacturer: util.getValue(lines, 'Manufacturer', '='),
                  partNum: util.getValue(lines, 'PartNumber', '='),
                  serialNum: util.getValue(lines, 'SerialNumber', '='),
                  voltageConfigured: (parseInt(util.getValue(lines, 'ConfiguredVoltage', '='), 10) || 0) / 1000.0,
                  voltageMin: (parseInt(util.getValue(lines, 'MinVoltage', '='), 10) || 0) / 1000.0,
                  voltageMax: (parseInt(util.getValue(lines, 'MaxVoltage', '='), 10) || 0) / 1000.0,
                });
              });
            }
            if (callback) { callback(result); }
            resolve(result);
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.memLayout = memLayout;



/***/ }),

/***/ "./node_modules/systeminformation/lib/network.js":
/*!*******************************************************!*\
  !*** ./node_modules/systeminformation/lib/network.js ***!
  \*******************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// network.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 9. Network
// ----------------------------------------------------------------------------------

const os = __webpack_require__(/*! os */ "os");
const exec = __webpack_require__(/*! child_process */ "child_process").exec;
const execSync = __webpack_require__(/*! child_process */ "child_process").execSync;
const fs = __webpack_require__(/*! fs */ "fs");
const util = __webpack_require__(/*! ./util */ "./node_modules/systeminformation/lib/util.js");

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

let _network = {};
let _default_iface = '';
let _ifaces = [];
let _dhcpNics = [];
let _networkInterfaces = [];
let _mac = {};
let pathToIp;

function getDefaultNetworkInterface() {

  let ifaces = os.networkInterfaces();
  let ifacename = '';
  let ifacenameFirst = '';

  let scopeid = 9999;

  // fallback - "first" external interface (sorted by scopeid)
  for (let dev in ifaces) {
    if ({}.hasOwnProperty.call(ifaces, dev)) {
      ifaces[dev].forEach(function (details) {
        if (details && details.internal === false) {
          ifacenameFirst = ifacenameFirst || dev; // fallback if no scopeid
          if (details.scopeid && details.scopeid < scopeid) {
            ifacename = dev;
            scopeid = details.scopeid;
          }
        }
      });
    }
  }
  ifacename = ifacename || ifacenameFirst || '';

  try {
    if (_windows) {
      // https://www.inetdaemon.com/tutorials/internet/ip/routing/default_route.shtml
      const cmd = 'netstat -r';
      const result = execSync(cmd);
      const lines = result.toString().split(os.EOL);
      let defaultIp = '';
      lines.forEach(line => {
        line = line.replace(/\s+/g, ' ').trim();
        if (line.indexOf('0.0.0.0 0.0.0.0') > -1 && !(/[a-zA-Z]/.test(line))) {
          const parts = line.split(' ');
          if (parts.length >= 5) {
            defaultIp = parts[parts.length - 2];
          }
        }
      });
      if (defaultIp) {
        for (let dev in ifaces) {
          if ({}.hasOwnProperty.call(ifaces, dev)) {
            ifaces[dev].forEach(function (details) {
              if (details && details.address && details.address === defaultIp) {
                ifacename = dev;
              }
            });
          }
        }
      }
    }
    if (_linux || _darwin || _freebsd || _openbsd || _netbsd || _sunos) {
      let cmd = '';
      if (_linux) cmd = 'ip route 2> /dev/null | grep default | awk \'{print $5}\'';
      if (_darwin) cmd = 'route get 0.0.0.0 2>/dev/null | grep interface: | awk \'{print $2}\'';
      if (_freebsd || _openbsd || _netbsd || _sunos) cmd = 'route get 0.0.0.0 | grep interface:';
      let result = execSync(cmd);
      ifacename = result.toString().split('\n')[0];
      if (ifacename.indexOf(':') > -1) {
        ifacename = ifacename.split(':')[1].trim();
      }
    }
  } catch (e) {
    util.noop();
  }
  if (ifacename) _default_iface = ifacename;
  return _default_iface;
}

exports.getDefaultNetworkInterface = getDefaultNetworkInterface;

function getMacAddresses() {
  let iface = '';
  let mac = '';
  let result = {};
  if (_linux || _freebsd || _openbsd || _netbsd) {
    if (typeof pathToIp === 'undefined') {
      try {
        const lines = execSync('which ip').toString().split('\n');
        if (lines.length && lines[0].indexOf(':') === -1 && lines[0].indexOf('/') === 0) {
          pathToIp = lines[0];
        } else {
          pathToIp = '';
        }
      } catch (e) {
        pathToIp = '';
      }
    }
    const cmd = 'export LC_ALL=C; ' + ((pathToIp) ? pathToIp + ' link show up' : '/sbin/ifconfig') + '; unset LC_ALL';
    let res = execSync(cmd);
    const lines = res.toString().split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] && lines[i][0] !== ' ') {
        if (pathToIp) {
          let nextline = lines[i + 1].trim().split(' ');
          if (nextline[0] === 'link/ether') {
            iface = lines[i].split(' ')[1];
            iface = iface.slice(0, iface.length - 1);
            mac = nextline[1];
          }
        } else {
          iface = lines[i].split(' ')[0];
          mac = lines[i].split('HWaddr ')[1];
        }

        if (iface && mac) {
          result[iface] = mac.trim();
          iface = '';
          mac = '';
        }
      }
    }
  }
  if (_darwin) {
    const cmd = '/sbin/ifconfig';
    let res = execSync(cmd);
    const lines = res.toString().split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] && lines[i][0] !== '\t' && lines[i].indexOf(':') > 0) {
        iface = lines[i].split(':')[0];
      } else if (lines[i].indexOf('\tether ') === 0) {
        mac = lines[i].split('\tether ')[1];
        if (iface && mac) {
          result[iface] = mac.trim();
          iface = '';
          mac = '';
        }
      }
    }
  }
  return result;
}

function networkInterfaceDefault(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = getDefaultNetworkInterface();
      if (callback) { callback(result); }
      resolve(result);
    });
  });
}

exports.networkInterfaceDefault = networkInterfaceDefault;

// --------------------------
// NET - interfaces

function parseLinesWindowsNics(sections, nconfigsections) {
  let nics = [];
  for (let i in sections) {
    if ({}.hasOwnProperty.call(sections, i)) {

      if (sections[i].trim() !== '') {

        let lines = sections[i].trim().split('\r\n');
        let linesNicConfig = nconfigsections[i].trim().split('\r\n');
        let netEnabled = util.getValue(lines, 'NetEnabled', '=');

        if (netEnabled !== '') {
          const speed = parseInt(util.getValue(lines, 'speed', '=').trim(), 10) / 1000000;
          nics.push({
            mac: util.getValue(lines, 'MACAddress', '=').toLowerCase(),
            dhcp: util.getValue(linesNicConfig, 'dhcpEnabled', '=').toLowerCase(),
            name: util.getValue(lines, 'Name', '=').replace(/\]/g, ')').replace(/\[/g, '('),
            netEnabled: netEnabled === 'TRUE',
            speed: isNaN(speed) ? -1 : speed,
            operstate: util.getValue(lines, 'NetConnectionStatus', '=') === '2' ? 'up' : 'down',
            type: util.getValue(lines, 'AdapterTypeID', '=') === '9' ? 'wireless' : 'wired'
          });
        }
      }
    }
  }
  return nics;
}

function getWindowsNics() {
  const cmd = util.getWmic() + ' nic get MACAddress, name, NetEnabled, Speed, NetConnectionStatus, AdapterTypeId /value';
  const cmdnicconfig = util.getWmic() + ' nicconfig get dhcpEnabled /value';
  try {
    const nsections = execSync(cmd, util.execOptsWin).split(/\n\s*\n/);
    const nconfigsections = execSync(cmdnicconfig, util.execOptsWin).split(/\n\s*\n/);
    return (parseLinesWindowsNics(nsections, nconfigsections));
  } catch (e) {
    return [];
  }
}

function getWindowsDNSsuffixes() {

  let iface = {};

  let dnsSuffixes = {
    primaryDNS: '',
    exitCode: 0,
    ifaces: [],
  };

  try {
    const ipconfig = execSync('ipconfig /all', util.execOptsWin);
    const ipconfigArray = ipconfig.split('\r\n\r\n');

    ipconfigArray.forEach((element, index) => {

      if (index == 1) {
        const longPrimaryDNS = element.split('\r\n').filter((element) => {
          return element.toUpperCase().includes('DNS');
        });
        const primaryDNS = longPrimaryDNS[0].substring(longPrimaryDNS[0].lastIndexOf(':') + 1);
        dnsSuffixes.primaryDNS = primaryDNS.trim();
        if (!dnsSuffixes.primaryDNS) dnsSuffixes.primaryDNS = 'Not defined';
      }
      if (index > 1) {
        if (index % 2 == 0) {
          const name = element.substring(element.lastIndexOf(' ') + 1).replace(':', '');
          iface.name = name;
        } else {
          const connectionSpecificDNS = element.split('\r\n').filter((element) => {
            return element.toUpperCase().includes('DNS');
          });
          const dnsSuffix = connectionSpecificDNS[0].substring(connectionSpecificDNS[0].lastIndexOf(':') + 1);
          iface.dnsSuffix = dnsSuffix.trim();
          dnsSuffixes.ifaces.push(iface);
          iface = {};
        }
      }
    });

    return dnsSuffixes;
  } catch (error) {
    // console.log('An error occurred trying to bring the Connection-specific DNS suffix', error.message);
    return {
      primaryDNS: '',
      exitCode: 0,
      ifaces: [],
    };
  }
}

function getWindowsIfaceDNSsuffix(ifaces, ifacename) {
  let dnsSuffix = '';
  // Adding (.) to ensure ifacename compatibility when duplicated iface-names
  const interfaceName = ifacename + '.';
  try {
    const connectionDnsSuffix = ifaces.filter((iface) => {
      return interfaceName.includes(iface.name + '.');
    }).map((iface) => iface.dnsSuffix);
    if (connectionDnsSuffix[0]) {
      dnsSuffix = connectionDnsSuffix[0];
    }
    if (!dnsSuffix) dnsSuffix = '';
    return dnsSuffix;
  } catch (error) {
    // console.log('Error getting Connection-specific DNS suffix: ', error.message);
    return 'Unknown';
  }
}

function getWindowsWiredProfilesInformation() {
  try {
    const result = execSync('netsh lan show profiles', util.execOptsWin);
    const profileList = result.split('\r\nProfile on interface');
    return profileList;
  } catch (error) {
    if (error.status === 1 && error.stdout.includes('AutoConfig')) {
      return 'Disabled';
    }
    return [];
  }
}

function getWindowsWirelessIfaceSSID(interfaceName) {
  try {
    const result = execSync(`netsh wlan show  interface name="${interfaceName}" | findstr "SSID"`, util.execOptsWin);
    const SSID = result.split('\r\n').shift();
    const parseSSID = SSID.split(':').pop();
    return parseSSID;
  } catch (error) {
    return 'Unknown';
  }
}
function getWindowsIEEE8021x(connectionType, iface, ifaces) {
  let i8021x = {
    state: 'Unknown',
    protocol: 'Unknown',
  };

  if (ifaces === 'Disabled') {
    i8021x.state = 'Disabled';
    i8021x.protocol = 'Not defined';
    return i8021x;
  }

  if (connectionType == 'wired' && ifaces.length > 0) {
    try {
      // Get 802.1x information by interface name
      const iface8021xInfo = ifaces.find((element) => {
        return element.includes(iface + '\r\n');
      });
      const arrayIface8021xInfo = iface8021xInfo.split('\r\n');
      const state8021x = arrayIface8021xInfo.find((element) => {
        return element.includes('802.1x');
      });

      if (state8021x.includes('Disabled')) {
        i8021x.state = 'Disabled';
        i8021x.protocol = 'Not defined';
      } else if (state8021x.includes('Enabled')) {
        const protocol8021x = arrayIface8021xInfo.find((element) => {
          return element.includes('EAP');
        });
        i8021x.protocol = protocol8021x.split(':').pop();
        i8021x.state = 'Enabled';
      }
    } catch (error) {
      // console.log('Error getting wired information:', error);
      return i8021x;
    }
  } else if (connectionType == 'wireless') {

    let i8021xState = '';
    let i8021xProtocol = '';



    try {
      const SSID = getWindowsWirelessIfaceSSID(iface);
      if (SSID !== 'Unknown') {
        i8021xState = execSync(`netsh wlan show profiles "${SSID}" | findstr "802.1X"`, util.execOptsWin);
        i8021xProtocol = execSync(`netsh wlan show profiles "${SSID}" | findstr "EAP"`, util.execOptsWin);
      }

      if (i8021xState.includes(':') && i8021xProtocol.includes(':')) {
        i8021x.state = i8021xState.split(':').pop();
        i8021x.protocol = i8021xProtocol.split(':').pop();
      }
    } catch (error) {
      // console.log('Error getting wireless information:', error);
      if (error.status === 1 && error.stdout.includes('AutoConfig')) {
        i8021x.state = 'Disabled';
        i8021x.protocol = 'Not defined';
      }
      return i8021x;
    }
  }

  return i8021x;
}

function splitSectionsNics(lines) {
  const result = [];
  let section = [];
  lines.forEach(function (line) {
    if (!line.startsWith('\t') && !line.startsWith(' ')) {
      if (section.length) {
        result.push(section);
        section = [];
      }
    }
    section.push(line);
  });
  if (section.length) {
    result.push(section);
  }
  return result;
}

function parseLinesDarwinNics(sections) {
  let nics = [];
  sections.forEach(section => {
    let nic = {
      iface: '',
      mtu: -1,
      mac: '',
      ip6: '',
      ip4: '',
      speed: -1,
      type: '',
      operstate: '',
      duplex: '',
      internal: false
    };
    const first = section[0];
    nic.iface = first.split(':')[0].trim();
    let parts = first.split('> mtu');
    nic.mtu = parts.length > 1 ? parseInt(parts[1], 10) : -1;
    if (isNaN(nic.mtu)) {
      nic.mtu = -1;
    }
    nic.internal = parts[0].indexOf('LOOPBACK') > -1;
    section.forEach(line => {
      if (line.trim().startsWith('ether ')) {
        nic.mac = line.split('ether ')[1].toLowerCase().trim();
      }
      if (line.trim().startsWith('inet6 ') && !nic.ip6) {
        nic.ip6 = line.split('inet6 ')[1].toLowerCase().split('%')[0].split(' ')[0];
      }
      if (line.trim().startsWith('inet ') && !nic.ip4) {
        nic.ip4 = line.split('inet ')[1].toLowerCase().split(' ')[0];
      }
    });
    let speed = util.getValue(section, 'link rate');
    nic.speed = speed ? parseFloat(speed) : -1;
    if (nic.speed === -1) {
      speed = util.getValue(section, 'uplink rate');
      nic.speed = speed ? parseFloat(speed) : -1;
      if (nic.speed > -1 && speed.toLowerCase().indexOf('gbps') >= 0) {
        nic.speed = nic.speed * 1000;
      }
    } else {
      if (speed.toLowerCase().indexOf('gbps') >= 0) {
        nic.speed = nic.speed * 1000;
      }
    }
    nic.type = util.getValue(section, 'type').toLowerCase().indexOf('wi-fi') > -1 ? 'wireless' : 'wired';
    nic.operstate = util.getValue(section, 'status').toLowerCase().indexOf('active') > -1 ? 'up' : 'down';
    nic.duplex = util.getValue(section, 'media').toLowerCase().indexOf('half-duplex') > -1 ? 'half' : 'full';
    if (nic.ip6 || nic.ip4 || nic.mac) {
      nics.push(nic);
    }
  });
  return nics;
}

function getDarwinNics() {
  const cmd = '/sbin/ifconfig -v';
  try {
    const lines = execSync(cmd, { maxBuffer: 1024 * 20000 }).toString().split('\n');
    const nsections = splitSectionsNics(lines);
    return (parseLinesDarwinNics(nsections));
  } catch (e) {
    return [];
  }
}

function getLinuxIfaceConnectionName(interfaceName) {
  const cmd = `nmcli device status 2>/dev/null | grep ${interfaceName}`;

  try {
    const result = execSync(cmd).toString();
    const resultFormat = result.replace(/\s+/g, ' ').trim();
    const connectionNameLines = resultFormat.split(' ').slice(3);
    const connectionName = connectionNameLines.join(' ');
    return connectionName != '--' ? connectionName : '';
  } catch (e) {
    return '';
  }
}

function checkLinuxDCHPInterfaces(file) {
  let result = [];
  let cmd = `cat ${file} 2> /dev/null | grep 'iface\\|source'`;
  const lines = execSync(cmd, { maxBuffer: 1024 * 20000 }).toString().split('\n');

  lines.forEach(line => {
    const parts = line.replace(/\s+/g, ' ').trim().split(' ');
    if (parts.length >= 4) {
      if (line.toLowerCase().indexOf(' inet ') >= 0 && line.toLowerCase().indexOf('dhcp') >= 0) {
        result.push(parts[1]);
      }
    }
    if (line.toLowerCase().includes('source')) {
      let file = line.split(' ')[1];
      result = result.concat(checkLinuxDCHPInterfaces(file));
    }
  });
  return result;
}

function getLinuxDHCPNics() {
  // alternate methods getting interfaces using DHCP
  let cmd = 'ip a 2> /dev/null';
  let result = [];
  try {
    const lines = execSync(cmd, { maxBuffer: 1024 * 20000 }).toString().split('\n');
    const nsections = splitSectionsNics(lines);
    result = (parseLinuxDHCPNics(nsections));
  } catch (e) {
    util.noop();
  }
  try {
    result = checkLinuxDCHPInterfaces('/etc/network/interfaces');
  } catch (e) {
    util.noop();
  }
  return result;
}

function parseLinuxDHCPNics(sections) {
  const result = [];
  if (sections && sections.length) {
    sections.forEach(lines => {
      if (lines && lines.length) {
        const parts = lines[0].split(':');
        if (parts.length > 2) {
          for (let line of lines) {
            if (line.indexOf(' inet ') >= 0 && line.indexOf(' dynamic ') >= 0) {
              const parts2 = line.split(' ');
              const nic = parts2[parts2.length - 1].trim();
              result.push(nic);
              break;
            }
          }
        }
      }
    });
  }
  return result;
}

function getLinuxIfaceDHCPstatus(iface, connectionName, DHCPNics) {
  let result = false;
  if (connectionName) {
    const cmd = `nmcli connection show "${connectionName}" 2>/dev/null \| grep ipv4.method;`;
    try {
      const lines = execSync(cmd).toString();
      const resultFormat = lines.replace(/\s+/g, ' ').trim();

      let dhcStatus = resultFormat.split(' ').slice(1).toString();
      switch (dhcStatus) {
      case 'auto':
        result = true;
        break;

      default:
        result = false;
        break;
      }
      return result;
    } catch (e) {
      return (DHCPNics.indexOf(iface) >= 0);
    }
  } else {
    return (DHCPNics.indexOf(iface) >= 0);
  }
}

function getDarwinIfaceDHCPstatus(iface) {
  let result = false;
  const cmd = `ipconfig getpacket "${iface}" 2>/dev/null \| grep lease_time;`;
  try {
    const lines = execSync(cmd).toString().split('\n');
    if (lines.length && lines[0].startsWith('lease_time')) {
      result = true;
    }
  } catch (e) {
    util.noop();
  }
  return result;
}

function getLinuxIfaceDNSsuffix(connectionName) {
  if (connectionName) {
    const cmd = `nmcli connection show "${connectionName}" 2>/dev/null \| grep ipv4.dns-search;`;
    try {
      const result = execSync(cmd).toString();
      const resultFormat = result.replace(/\s+/g, ' ').trim();
      const dnsSuffix = resultFormat.split(' ').slice(1).toString();
      return dnsSuffix == '--' ? 'Not defined' : dnsSuffix;
    } catch (e) {
      return 'Unknown';
    }
  } else {
    return 'Unknown';
  }
}

function getLinuxIfaceIEEE8021xAuth(connectionName) {
  if (connectionName) {
    const cmd = `nmcli connection show "${connectionName}" 2>/dev/null \| grep 802-1x.eap;`;
    try {
      const result = execSync(cmd).toString();
      const resultFormat = result.replace(/\s+/g, ' ').trim();
      const authenticationProtocol = resultFormat.split(' ').slice(1).toString();


      return authenticationProtocol == '--' ? '' : authenticationProtocol;
    } catch (e) {
      return 'Not defined';
    }
  } else {
    return 'Not defined';
  }
}

function getLinuxIfaceIEEE8021xState(authenticationProtocol) {
  if (authenticationProtocol) {
    if (authenticationProtocol == 'Not defined') {
      return 'Disabled';
    }
    return 'Enabled';
  } else {
    return 'Unknown';
  }
}

function testVirtualNic(iface, ifaceName, mac) {
  const virtualMacs = ['00:00:00:00:00:00', '00:03:FF', '00:05:69', '00:0C:29', '00:0F:4B', '00:0F:4B', '00:13:07', '00:13:BE', '00:15:5d', '00:16:3E', '00:1C:42', '00:21:F6', '00:21:F6', '00:24:0B', '00:24:0B', '00:50:56', '00:A0:B1', '00:E0:C8', '08:00:27', '0A:00:27', '18:92:2C', '16:DF:49', '3C:F3:92', '54:52:00', 'FC:15:97'];
  if (mac) {
    return virtualMacs.filter(item => { return mac.toUpperCase().toUpperCase().startsWith(item.substr(0, mac.length)); }).length > 0 ||
      iface.toLowerCase().indexOf(' virtual ') > -1 ||
      ifaceName.toLowerCase().indexOf(' virtual ') > -1 ||
      iface.toLowerCase().indexOf('vethernet ') > -1 ||
      ifaceName.toLowerCase().indexOf('vethernet ') > -1 ||
      iface.toLowerCase().startsWith('veth') ||
      ifaceName.toLowerCase().startsWith('veth') ||
      iface.toLowerCase().startsWith('vboxnet') ||
      ifaceName.toLowerCase().startsWith('vboxnet');
  } else return false;
}

function networkInterfaces(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let ifaces = os.networkInterfaces();
      if (_windows) {
        getWindowsNics().forEach(nic => {
          let found = false;
          Object.keys(ifaces).forEach(key => {
            if (!found) {
              ifaces[key].forEach(value => {
                if (Object.keys(value).indexOf('mac') >= 0) {
                  found = value['mac'] === nic.mac;
                }
              });
            }
          });

          if (!found) {
            ifaces[nic.name] = [{ mac: nic.mac }];
          }
        });
      }
      let result = [];
      let nics = [];
      let dnsSuffixes = [];
      let nics8021xInfo = [];
      // seperate handling in OSX
      if (_darwin || _freebsd || _openbsd || _netbsd) {
        nics = getDarwinNics();

        nics.forEach(nic => {

          result.push({
            iface: nic.iface,
            ifaceName: nic.iface,
            ip4: nic.ip4,
            ip6: nic.ip6,
            mac: nic.mac,
            internal: nic.internal,
            virtual: nic.internal ? false : testVirtualNic(nic.iface, nic.iface, nic.mac),
            operstate: nic.operstate,
            type: nic.type,
            duplex: nic.duplex,
            mtu: nic.mtu,
            speed: nic.speed,
            dhcp: getDarwinIfaceDHCPstatus(nic.iface),
            dnsSuffix: '',
            ieee8021xAuth: '',
            ieee8021xState: '',
            carrierChanges: 0
          });
        });
        if (callback) { callback(result); }
        resolve(result);
      } else {
        if (JSON.stringify(ifaces) === JSON.stringify(_ifaces)) {
          // no changes - just return object
          result = _networkInterfaces;

          if (callback) { callback(result); }
          resolve(result);
        } else {
          _ifaces = ifaces;
          if (_windows) {
            nics8021xInfo = getWindowsWiredProfilesInformation();
            nics = getWindowsNics();
            dnsSuffixes = getWindowsDNSsuffixes();
          }
          if (_linux) {
            _dhcpNics = getLinuxDHCPNics();
          }
          for (let dev in ifaces) {
            let ip4 = '';
            let ip6 = '';
            let mac = '';
            let duplex = '';
            let mtu = '';
            let speed = -1;
            let carrierChanges = 0;
            let operstate = 'down';
            let dhcp = false;
            let dnsSuffix = '';
            let ieee8021xAuth = '';
            let ieee8021xState = '';
            let type = '';

            if ({}.hasOwnProperty.call(ifaces, dev)) {
              let ifaceName = dev;
              ifaces[dev].forEach(function (details) {
                if (details.family === 'IPv4') {
                  ip4 = details.address;
                }
                if (details.family === 'IPv6') {
                  if (!ip6 || ip6.match(/^fe80::/i)) {
                    ip6 = details.address;
                  }
                }
                mac = details.mac;
                // fallback due to https://github.com/nodejs/node/issues/13581 (node 8.1 - node 8.2)
                if (mac.indexOf('00:00:0') > -1 && (_linux || _darwin)) {
                  if (Object.keys(_mac).length === 0) {
                    _mac = getMacAddresses();
                  }
                  mac = _mac[dev] || '';
                }
              });
              if (_linux) {
                let iface = dev.split(':')[0].trim().toLowerCase();
                const cmd = `echo -n "addr_assign_type: "; cat /sys/class/net/${iface}/addr_assign_type 2>/dev/null; echo;
            echo -n "address: "; cat /sys/class/net/${iface}/address 2>/dev/null; echo;
            echo -n "addr_len: "; cat /sys/class/net/${iface}/addr_len 2>/dev/null; echo;
            echo -n "broadcast: "; cat /sys/class/net/${iface}/broadcast 2>/dev/null; echo;
            echo -n "carrier: "; cat /sys/class/net/${iface}/carrier 2>/dev/null; echo;
            echo -n "carrier_changes: "; cat /sys/class/net/${iface}/carrier_changes 2>/dev/null; echo;
            echo -n "dev_id: "; cat /sys/class/net/${iface}/dev_id 2>/dev/null; echo;
            echo -n "dev_port: "; cat /sys/class/net/${iface}/dev_port 2>/dev/null; echo;
            echo -n "dormant: "; cat /sys/class/net/${iface}/dormant 2>/dev/null; echo;
            echo -n "duplex: "; cat /sys/class/net/${iface}/duplex 2>/dev/null; echo;
            echo -n "flags: "; cat /sys/class/net/${iface}/flags 2>/dev/null; echo;
            echo -n "gro_flush_timeout: "; cat /sys/class/net/${iface}/gro_flush_timeout 2>/dev/null; echo;
            echo -n "ifalias: "; cat /sys/class/net/${iface}/ifalias 2>/dev/null; echo;
            echo -n "ifindex: "; cat /sys/class/net/${iface}/ifindex 2>/dev/null; echo;
            echo -n "iflink: "; cat /sys/class/net/${iface}/iflink 2>/dev/null; echo;
            echo -n "link_mode: "; cat /sys/class/net/${iface}/link_mode 2>/dev/null; echo;
            echo -n "mtu: "; cat /sys/class/net/${iface}/mtu 2>/dev/null; echo;
            echo -n "netdev_group: "; cat /sys/class/net/${iface}/netdev_group 2>/dev/null; echo;
            echo -n "operstate: "; cat /sys/class/net/${iface}/operstate 2>/dev/null; echo;
            echo -n "proto_down: "; cat /sys/class/net/${iface}/proto_down 2>/dev/null; echo;
            echo -n "speed: "; cat /sys/class/net/${iface}/speed 2>/dev/null; echo;
            echo -n "tx_queue_len: "; cat /sys/class/net/${iface}/tx_queue_len 2>/dev/null; echo;
            echo -n "type: "; cat /sys/class/net/${iface}/type 2>/dev/null; echo;
            echo -n "wireless: "; cat /proc/net/wireless 2>/dev/null \| grep ${iface}; echo;
            echo -n "wirelessspeed: "; iw dev ${iface} link 2>&1 \| grep bitrate; echo;`;

                let lines = [];
                try {
                  lines = execSync(cmd).toString().split('\n');
                  const connectionName = getLinuxIfaceConnectionName(iface);
                  dhcp = getLinuxIfaceDHCPstatus(iface, connectionName, _dhcpNics);
                  dnsSuffix = getLinuxIfaceDNSsuffix(connectionName);
                  ieee8021xAuth = getLinuxIfaceIEEE8021xAuth(connectionName);
                  ieee8021xState = getLinuxIfaceIEEE8021xState(ieee8021xAuth);
                } catch (e) {
                  util.noop();
                }
                duplex = util.getValue(lines, 'duplex');
                duplex = duplex.startsWith('cat') ? '' : duplex;
                mtu = parseInt(util.getValue(lines, 'mtu'), 10);
                let myspeed = parseInt(util.getValue(lines, 'speed'), 10);
                speed = isNaN(myspeed) ? -1 : myspeed;
                let wirelessspeed = util.getValue(lines, 'wirelessspeed').split('tx bitrate: ');
                if (speed === -1 && wirelessspeed.length === 2) {
                  myspeed = parseFloat(wirelessspeed[1]);
                  speed = isNaN(myspeed) ? -1 : myspeed;
                }
                carrierChanges = parseInt(util.getValue(lines, 'carrier_changes'), 10);
                operstate = util.getValue(lines, 'operstate');
                type = operstate === 'up' ? (util.getValue(lines, 'wireless').trim() ? 'wireless' : 'wired') : 'unknown';
                if (iface === 'lo' || iface.startsWith('bond')) { type = 'virtual'; }
              }
              if (_windows) {


                dnsSuffix = getWindowsIfaceDNSsuffix(dnsSuffixes.ifaces, dev);
                nics.forEach(detail => {
                  if (detail.mac === mac) {
                    ifaceName = detail.name;
                    dhcp = detail.dhcp;
                    operstate = detail.operstate;
                    speed = detail.speed;
                    type = detail.type;
                  }
                });

                if (dev.toLowerCase().indexOf('wlan') >= 0 || ifaceName.toLowerCase().indexOf('wlan') >= 0 || ifaceName.toLowerCase().indexOf('802.11n') >= 0 || ifaceName.toLowerCase().indexOf('wireless') >= 0 || ifaceName.toLowerCase().indexOf('wi-fi') >= 0 || ifaceName.toLowerCase().indexOf('wifi') >= 0) {
                  type = 'wireless';
                }

                const IEEE8021x = getWindowsIEEE8021x(type, dev, nics8021xInfo);
                ieee8021xAuth = IEEE8021x.protocol;
                ieee8021xState = IEEE8021x.state;
              }
              let internal = (ifaces[dev] && ifaces[dev][0]) ? ifaces[dev][0].internal : null;
              const virtual = internal ? false : testVirtualNic(dev, ifaceName, mac);
              result.push({
                iface: dev,
                ifaceName,
                ip4,
                ip6,
                mac,
                internal,
                virtual,
                operstate,
                type,
                duplex,
                mtu,
                speed,
                dhcp,
                dnsSuffix,
                ieee8021xAuth,
                ieee8021xState,
                carrierChanges,
              });
            }
          }
          _networkInterfaces = result;
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.networkInterfaces = networkInterfaces;

// --------------------------
// NET - Speed

function calcNetworkSpeed(iface, rx_bytes, tx_bytes, operstate, rx_dropped, rx_errors, tx_dropped, tx_errors) {
  let result = {
    iface,
    operstate,
    rx_bytes,
    rx_dropped,
    rx_errors,
    tx_bytes,
    tx_dropped,
    tx_errors,
    rx_sec: -1,
    tx_sec: -1,
    ms: 0
  };

  if (_network[iface] && _network[iface].ms) {
    result.ms = Date.now() - _network[iface].ms;
    result.rx_sec = (rx_bytes - _network[iface].rx_bytes) >= 0 ? (rx_bytes - _network[iface].rx_bytes) / (result.ms / 1000) : 0;
    result.tx_sec = (tx_bytes - _network[iface].tx_bytes) >= 0 ? (tx_bytes - _network[iface].tx_bytes) / (result.ms / 1000) : 0;
    _network[iface].rx_bytes = rx_bytes;
    _network[iface].tx_bytes = tx_bytes;
    _network[iface].rx_sec = result.rx_sec;
    _network[iface].tx_sec = result.tx_sec;
    _network[iface].ms = Date.now();
    _network[iface].last_ms = result.ms;
    _network[iface].operstate = operstate;
  } else {
    if (!_network[iface]) _network[iface] = {};
    _network[iface].rx_bytes = rx_bytes;
    _network[iface].tx_bytes = tx_bytes;
    _network[iface].rx_sec = -1;
    _network[iface].tx_sec = -1;
    _network[iface].ms = Date.now();
    _network[iface].last_ms = 0;
    _network[iface].operstate = operstate;
  }
  return result;
}

function networkStats(ifaces, callback) {

  let ifacesArray = [];
  // fallback - if only callback is given
  if (util.isFunction(ifaces) && !callback) {
    callback = ifaces;
    ifacesArray = [getDefaultNetworkInterface()];
  } else {
    ifaces = ifaces || getDefaultNetworkInterface();
    ifaces = ifaces.trim().toLowerCase().replace(/,+/g, '|');
    ifacesArray = ifaces.split('|');
  }

  return new Promise((resolve) => {
    process.nextTick(() => {

      const result = [];

      const workload = [];
      if (ifacesArray.length && ifacesArray[0].trim() === '*') {
        ifacesArray = [];
        networkInterfaces().then(allIFaces => {
          for (let iface of allIFaces) {
            ifacesArray.push(iface.iface);
          }
          networkStats(ifacesArray.join(',')).then(result => {
            if (callback) { callback(result); }
            resolve(result);
          });
        });
      } else {
        for (let iface of ifacesArray) {
          workload.push(networkStatsSingle(iface.trim()));
        }
        if (workload.length) {
          Promise.all(
            workload
          ).then(data => {
            if (callback) { callback(data); }
            resolve(data);
          });
        } else {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

function networkStatsSingle(iface) {

  function parseLinesWindowsPerfData(sections) {
    let perfData = [];
    for (let i in sections) {
      if ({}.hasOwnProperty.call(sections, i)) {
        if (sections[i].trim() !== '') {
          let lines = sections[i].trim().split('\r\n');
          perfData.push({
            name: util.getValue(lines, 'Name', '=').replace(/[()\[\] ]+/g, '').toLowerCase(),
            rx_bytes: parseInt(util.getValue(lines, 'BytesReceivedPersec', '='), 10),
            rx_errors: parseInt(util.getValue(lines, 'PacketsReceivedErrors', '='), 10),
            rx_dropped: parseInt(util.getValue(lines, 'PacketsReceivedDiscarded', '='), 10),
            tx_bytes: parseInt(util.getValue(lines, 'BytesSentPersec', '='), 10),
            tx_errors: parseInt(util.getValue(lines, 'PacketsOutboundErrors', '='), 10),
            tx_dropped: parseInt(util.getValue(lines, 'PacketsOutboundDiscarded', '='), 10)
          });
        }
      }
    }
    return perfData;
  }

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        iface: iface,
        operstate: 'unknown',
        rx_bytes: 0,
        rx_dropped: 0,
        rx_errors: 0,
        tx_bytes: 0,
        tx_dropped: 0,
        tx_errors: 0,
        rx_sec: -1,
        tx_sec: -1,
        ms: 0
      };

      let operstate = 'unknown';
      let rx_bytes = 0;
      let tx_bytes = 0;
      let rx_dropped = 0;
      let rx_errors = 0;
      let tx_dropped = 0;
      let tx_errors = 0;

      let cmd, lines, stats;
      if (!_network[iface] || (_network[iface] && !_network[iface].ms) || (_network[iface] && _network[iface].ms && Date.now() - _network[iface].ms >= 500)) {
        if (_linux) {
          if (fs.existsSync('/sys/class/net/' + iface)) {
            cmd =
              'cat /sys/class/net/' + iface + '/operstate; ' +
              'cat /sys/class/net/' + iface + '/statistics/rx_bytes; ' +
              'cat /sys/class/net/' + iface + '/statistics/tx_bytes; ' +
              'cat /sys/class/net/' + iface + '/statistics/rx_dropped; ' +
              'cat /sys/class/net/' + iface + '/statistics/rx_errors; ' +
              'cat /sys/class/net/' + iface + '/statistics/rx_dropped; ' +
              'cat /sys/class/net/' + iface + '/statistics/tx_errors; ';
            exec(cmd, function (error, stdout) {
              if (!error) {
                lines = stdout.toString().split('\n');
                operstate = lines[0].trim();
                rx_bytes = parseInt(lines[1], 10);
                tx_bytes = parseInt(lines[2], 10);
                rx_dropped = parseInt(lines[3], 10);
                rx_errors = parseInt(lines[4], 10);
                tx_dropped = parseInt(lines[5], 10);
                tx_errors = parseInt(lines[6], 10);

                result = calcNetworkSpeed(iface, rx_bytes, tx_bytes, operstate, rx_dropped, rx_errors, tx_dropped, tx_errors);

              }
              resolve(result);
            });
          } else {
            resolve(result);
          }
        }
        if (_freebsd || _openbsd || _netbsd) {
          cmd = 'netstat -ibndI ' + iface;
          exec(cmd, function (error, stdout) {
            if (!error) {
              lines = stdout.toString().split('\n');
              for (let i = 1; i < lines.length; i++) {
                const line = lines[i].replace(/ +/g, ' ').split(' ');
                if (line && line[0] && line[7] && line[10]) {
                  rx_bytes = rx_bytes + parseInt(line[7]);
                  if (stats[6].trim() !== '-') { rx_dropped = rx_dropped + parseInt(stats[6]); }
                  if (stats[5].trim() !== '-') { rx_errors = rx_errors + parseInt(stats[5]); }
                  tx_bytes = tx_bytes + parseInt(line[10]);
                  if (stats[12].trim() !== '-') { tx_dropped = tx_dropped + parseInt(stats[12]); }
                  if (stats[9].trim() !== '-') { tx_errors = tx_errors + parseInt(stats[9]); }
                  operstate = 'up';
                }
              }
              result = calcNetworkSpeed(iface, rx_bytes, tx_bytes, operstate, rx_dropped, rx_errors, tx_dropped, tx_errors);
            }
            resolve(result);
          });
        }
        if (_darwin) {
          cmd = 'ifconfig ' + iface + ' | grep "status"';
          exec(cmd, function (error, stdout) {
            result.operstate = (stdout.toString().split(':')[1] || '').trim();
            result.operstate = (result.operstate || '').toLowerCase();
            result.operstate = (result.operstate === 'active' ? 'up' : (result.operstate === 'inactive' ? 'down' : 'unknown'));
            cmd = 'netstat -bdI ' + iface;
            exec(cmd, function (error, stdout) {
              if (!error) {
                lines = stdout.toString().split('\n');
                // if there is less than 2 lines, no information for this interface was found
                if (lines.length > 1 && lines[1].trim() !== '') {
                  // skip header line
                  // use the second line because it is tied to the NIC instead of the ipv4 or ipv6 address
                  stats = lines[1].replace(/ +/g, ' ').split(' ');
                  rx_bytes = parseInt(stats[6]);
                  rx_dropped = parseInt(stats[11]);
                  rx_errors = parseInt(stats[5]);
                  tx_bytes = parseInt(stats[9]);
                  tx_dropped = parseInt(stats[11]);
                  tx_errors = parseInt(stats[8]);

                  result = calcNetworkSpeed(iface, rx_bytes, tx_bytes, result.operstate, rx_dropped, rx_errors, tx_dropped, tx_errors);
                }
              }
              resolve(result);
            });
          });
        }
        if (_windows) {
          let perfData = [];
          let ifaceName = iface;

          // Performance Data
          util.wmic('path Win32_PerfRawData_Tcpip_NetworkInterface Get name,BytesReceivedPersec,BytesSentPersec,BytesTotalPersec,PacketsOutboundDiscarded,PacketsOutboundErrors,PacketsReceivedDiscarded,PacketsReceivedErrors /value').then((stdout, error) => {
            if (!error) {
              const psections = stdout.toString().split(/\n\s*\n/);
              perfData = parseLinesWindowsPerfData(psections);
            }

            // Network Interfaces
            networkInterfaces().then(interfaces => {
              // get bytes sent, received from perfData by name
              rx_bytes = 0;
              tx_bytes = 0;
              perfData.forEach(detail => {
                interfaces.forEach(det => {
                  if ((det.iface.toLowerCase() === iface.toLowerCase() ||
                    det.mac.toLowerCase() === iface.toLowerCase() ||
                    det.ip4.toLowerCase() === iface.toLowerCase() ||
                    det.ip6.toLowerCase() === iface.toLowerCase() ||
                    (det.ifaceName.replace(/[()\[\] ]+/g, '').toLowerCase() === iface.replace(/[()\[\] ]+/g, '').toLowerCase()) &&
                    det.ifaceName.replace(/[()\[\] ]+/g, '').toLowerCase() === detail.name)) {
                    ifaceName = det.iface;
                    rx_bytes = detail.rx_bytes;
                    rx_dropped = detail.rx_dropped;
                    rx_errors = detail.rx_errors;
                    tx_bytes = detail.tx_bytes;
                    tx_dropped = detail.tx_dropped;
                    tx_errors = detail.tx_errors;
                    operstate = det.operstate;
                  }
                });
              });

              if (rx_bytes && tx_bytes) {
                result = calcNetworkSpeed(ifaceName, parseInt(rx_bytes), parseInt(tx_bytes), operstate, rx_dropped, rx_errors, tx_dropped, tx_errors);
              }
              resolve(result);
            });
          });
        }
      } else {
        result.rx_bytes = _network[iface].rx_bytes;
        result.tx_bytes = _network[iface].tx_bytes;
        result.rx_sec = _network[iface].rx_sec;
        result.tx_sec = _network[iface].tx_sec;
        result.ms = _network[iface].last_ms;
        result.operstate = _network[iface].operstate;
        resolve(result);
      }
    });
  });
}

exports.networkStats = networkStats;

// --------------------------
// NET - connections (sockets)

function networkConnections(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux || _freebsd || _openbsd || _netbsd) {
        let cmd = 'export LC_ALL=C; netstat -tunap | grep "ESTABLISHED\\|SYN_SENT\\|SYN_RECV\\|FIN_WAIT1\\|FIN_WAIT2\\|TIME_WAIT\\|CLOSE\\|CLOSE_WAIT\\|LAST_ACK\\|LISTEN\\|CLOSING\\|UNKNOWN"; unset LC_ALL';
        if (_freebsd || _openbsd || _netbsd) cmd = 'export LC_ALL=C; netstat -na | grep "ESTABLISHED\\|SYN_SENT\\|SYN_RECV\\|FIN_WAIT1\\|FIN_WAIT2\\|TIME_WAIT\\|CLOSE\\|CLOSE_WAIT\\|LAST_ACK\\|LISTEN\\|CLOSING\\|UNKNOWN"; unset LC_ALL';
        exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
          let lines = stdout.toString().split('\n');
          if (!error && (lines.length > 1 || lines[0] != '')) {
            lines.forEach(function (line) {
              line = line.replace(/ +/g, ' ').split(' ');
              if (line.length >= 7) {
                let localip = line[3];
                let localport = '';
                let localaddress = line[3].split(':');
                if (localaddress.length > 1) {
                  localport = localaddress[localaddress.length - 1];
                  localaddress.pop();
                  localip = localaddress.join(':');
                }
                let peerip = line[4];
                let peerport = '';
                let peeraddress = line[4].split(':');
                if (peeraddress.length > 1) {
                  peerport = peeraddress[peeraddress.length - 1];
                  peeraddress.pop();
                  peerip = peeraddress.join(':');
                }
                let connstate = line[5];
                // if (connstate === 'VERBUNDEN') connstate = 'ESTABLISHED';
                let proc = line[6].split('/');

                if (connstate) {
                  result.push({
                    protocol: line[0],
                    localaddress: localip,
                    localport: localport,
                    peeraddress: peerip,
                    peerport: peerport,
                    state: connstate,
                    pid: proc[0] && proc[0] !== '-' ? parseInt(proc[0], 10) : -1,
                    process: proc[1] ? proc[1].split(' ')[0] : ''
                  });
                }
              }
            });
            if (callback) {
              callback(result);
            }
            resolve(result);
          } else {
            cmd = 'ss -tunap | grep "ESTAB\\|SYN-SENT\\|SYN-RECV\\|FIN-WAIT1\\|FIN-WAIT2\\|TIME-WAIT\\|CLOSE\\|CLOSE-WAIT\\|LAST-ACK\\|LISTEN\\|CLOSING"';
            exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {

              if (!error) {
                let lines = stdout.toString().split('\n');
                lines.forEach(function (line) {
                  line = line.replace(/ +/g, ' ').split(' ');
                  if (line.length >= 6) {
                    let localip = line[4];
                    let localport = '';
                    let localaddress = line[4].split(':');
                    if (localaddress.length > 1) {
                      localport = localaddress[localaddress.length - 1];
                      localaddress.pop();
                      localip = localaddress.join(':');
                    }
                    let peerip = line[5];
                    let peerport = '';
                    let peeraddress = line[5].split(':');
                    if (peeraddress.length > 1) {
                      peerport = peeraddress[peeraddress.length - 1];
                      peeraddress.pop();
                      peerip = peeraddress.join(':');
                    }
                    let connstate = line[1];
                    if (connstate === 'ESTAB') connstate = 'ESTABLISHED';
                    if (connstate === 'TIME-WAIT') connstate = 'TIME_WAIT';
                    let pid = -1;
                    let process = '';
                    if (line.length >= 7 && line[6].indexOf('users:') > -1) {
                      let proc = line[6].replace('users:(("', '').replace(/"/g, '').split(',');
                      if (proc.length > 2) {
                        process = proc[0].split(' ')[0];
                        pid = parseInt(proc[1], 10);
                      }
                    }
                    if (connstate) {
                      result.push({
                        protocol: line[0],
                        localaddress: localip,
                        localport: localport,
                        peeraddress: peerip,
                        peerport: peerport,
                        state: connstate,
                        pid,
                        process
                      });
                    }
                  }
                });
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          }
        });
      }
      if (_darwin) {
        let cmd = 'netstat -natv | grep "ESTABLISHED\\|SYN_SENT\\|SYN_RECV\\|FIN_WAIT1\\|FIN_WAIT2\\|TIME_WAIT\\|CLOSE\\|CLOSE_WAIT\\|LAST_ACK\\|LISTEN\\|CLOSING\\|UNKNOWN"';
        exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
          if (!error) {

            let lines = stdout.toString().split('\n');

            lines.forEach(function (line) {
              line = line.replace(/ +/g, ' ').split(' ');
              if (line.length >= 8) {
                let localip = line[3];
                let localport = '';
                let localaddress = line[3].split('.');
                if (localaddress.length > 1) {
                  localport = localaddress[localaddress.length - 1];
                  localaddress.pop();
                  localip = localaddress.join('.');
                }
                let peerip = line[4];
                let peerport = '';
                let peeraddress = line[4].split('.');
                if (peeraddress.length > 1) {
                  peerport = peeraddress[peeraddress.length - 1];
                  peeraddress.pop();
                  peerip = peeraddress.join('.');
                }
                let connstate = line[5];
                let pid = parseInt(line[8], 10);
                if (connstate) {
                  result.push({
                    protocol: line[0],
                    localaddress: localip,
                    localport: localport,
                    peeraddress: peerip,
                    peerport: peerport,
                    state: connstate,
                    pid: pid,
                    process: ''
                  });
                }
              }
            });
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        });
      }
      if (_windows) {
        let cmd = 'netstat -nao';
        try {
          exec(cmd, util.execOptsWin, function (error, stdout) {
            if (!error) {

              let lines = stdout.toString().split('\r\n');

              lines.forEach(function (line) {
                line = line.trim().replace(/ +/g, ' ').split(' ');
                if (line.length >= 4) {
                  let localip = line[1];
                  let localport = '';
                  let localaddress = line[1].split(':');
                  if (localaddress.length > 1) {
                    localport = localaddress[localaddress.length - 1];
                    localaddress.pop();
                    localip = localaddress.join(':');
                  }
                  let peerip = line[2];
                  let peerport = '';
                  let peeraddress = line[2].split(':');
                  if (peeraddress.length > 1) {
                    peerport = peeraddress[peeraddress.length - 1];
                    peeraddress.pop();
                    peerip = peeraddress.join(':');
                  }
                  let pid = line[4];
                  let connstate = line[3];
                  if (connstate === 'HERGESTELLT') connstate = 'ESTABLISHED';
                  if (connstate.startsWith('ABH')) connstate = 'LISTEN';
                  if (connstate === 'SCHLIESSEN_WARTEN') connstate = 'CLOSE_WAIT';
                  if (connstate === 'WARTEND') connstate = 'TIME_WAIT';
                  if (connstate === 'SYN_GESENDET') connstate = 'SYN_SENT';

                  if (connstate === 'LISTENING') connstate = 'LISTEN';
                  if (connstate === 'SYN_RECEIVED') connstate = 'SYN_RECV';
                  if (connstate === 'FIN_WAIT_1') connstate = 'FIN_WAIT1';
                  if (connstate === 'FIN_WAIT_2') connstate = 'FIN_WAIT2';
                  if (connstate) {
                    result.push({
                      protocol: line[0].toLowerCase(),
                      localaddress: localip,
                      localport: localport,
                      peeraddress: peerip,
                      peerport: peerport,
                      state: connstate,
                      pid,
                      process: ''
                    });
                  }
                }
              });
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.networkConnections = networkConnections;

function networkGatewayDefault(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = '';
      if (_linux || _freebsd || _openbsd || _netbsd) {
        let cmd = 'ip route get 1';
        try {
          exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');
              const line = lines && lines[0] ? lines[0] : '';
              let parts = line.split(' via ');
              if (parts && parts[1]) {
                parts = parts[1].split(' ');
                result = parts[0];
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
      if (_darwin) {
        let cmd = 'route -n get default';
        try {
          exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n').map(line => line.trim());
              result = util.getValue(lines, 'gateway');
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
      if (_windows) {
        try {
          exec('netstat -r', util.execOptsWin, function (error, stdout) {
            const lines = stdout.toString().split(os.EOL);
            lines.forEach(line => {
              line = line.replace(/\s+/g, ' ').trim();
              if (line.indexOf('0.0.0.0 0.0.0.0') > -1 && !(/[a-zA-Z]/.test(line))) {
                const parts = line.split(' ');
                if (parts.length >= 5 && (parts[parts.length - 3]).indexOf('.') > -1) {
                  result = parts[parts.length - 3];
                }
              }
            });
            if (!result) {
              util.powerShell('Get-CimInstance -ClassName Win32_IP4RouteTable | Where-Object { $_.Destination -eq \'0.0.0.0\' -and $_.Mask -eq \'0.0.0.0\' }')
                .then(data => {
                  let lines = data.toString().split('\r\n');
                  if (lines.length > 1 && !result) {
                    result = util.getValue(lines, 'NextHop');
                    if (callback) {
                      callback(result);
                    }
                    resolve(result);
                    // } else {
                    //   exec('ipconfig', util.execOptsWin, function (error, stdout) {
                    //     let lines = stdout.toString().split('\r\n');
                    //     lines.forEach(function (line) {
                    //       line = line.trim().replace(/\. /g, '');
                    //       line = line.trim().replace(/ +/g, '');
                    //       const parts = line.split(':');
                    //       if ((parts[0].toLowerCase().startsWith('standardgate') || parts[0].toLowerCase().indexOf('gateway') > -1 || parts[0].toLowerCase().indexOf('enlace') > -1) && parts[1]) {
                    //         result = parts[1];
                    //       }
                    //     });
                    //     if (callback) { callback(result); }
                    //     resolve(result);
                    //   });
                  }
                });
            } else {
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.networkGatewayDefault = networkGatewayDefault;


/***/ }),

/***/ "./node_modules/systeminformation/lib/osinfo.js":
/*!******************************************************!*\
  !*** ./node_modules/systeminformation/lib/osinfo.js ***!
  \******************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// osinfo.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 3. Operating System
// ----------------------------------------------------------------------------------

const os = __webpack_require__(/*! os */ "os");
const exec = __webpack_require__(/*! child_process */ "child_process").exec;
const util = __webpack_require__(/*! ./util */ "./node_modules/systeminformation/lib/util.js");
const fs = __webpack_require__(/*! fs */ "fs");

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

const NOT_SUPPORTED = 'not supported';

// --------------------------
// Get current time and OS uptime

function time() {
  let t = new Date().toString().split(' ');

  return {
    current: Date.now(),
    uptime: os.uptime(),
    timezone: (t.length >= 7) ? t[5] : '',
    timezoneName: (t.length >= 7) ? t.slice(6).join(' ').replace(/\(/g, '').replace(/\)/g, '') : ''
  };
}

exports.time = time;

// --------------------------
// Get logo filename of OS distribution

function getLogoFile(distro) {
  distro = distro || '';
  distro = distro.toLowerCase();
  let result = _platform;
  if (_windows) {
    result = 'windows';
  }
  else if (distro.indexOf('mac os') !== -1) {
    result = 'apple';
  }
  else if (distro.indexOf('arch') !== -1) {
    result = 'arch';
  }
  else if (distro.indexOf('centos') !== -1) {
    result = 'centos';
  }
  else if (distro.indexOf('coreos') !== -1) {
    result = 'coreos';
  }
  else if (distro.indexOf('debian') !== -1) {
    result = 'debian';
  }
  else if (distro.indexOf('deepin') !== -1) {
    result = 'deepin';
  }
  else if (distro.indexOf('elementary') !== -1) {
    result = 'elementary';
  }
  else if (distro.indexOf('fedora') !== -1) {
    result = 'fedora';
  }
  else if (distro.indexOf('gentoo') !== -1) {
    result = 'gentoo';
  }
  else if (distro.indexOf('mageia') !== -1) {
    result = 'mageia';
  }
  else if (distro.indexOf('mandriva') !== -1) {
    result = 'mandriva';
  }
  else if (distro.indexOf('manjaro') !== -1) {
    result = 'manjaro';
  }
  else if (distro.indexOf('mint') !== -1) {
    result = 'mint';
  }
  else if (distro.indexOf('mx') !== -1) {
    result = 'mx';
  }
  else if (distro.indexOf('openbsd') !== -1) {
    result = 'openbsd';
  }
  else if (distro.indexOf('freebsd') !== -1) {
    result = 'freebsd';
  }
  else if (distro.indexOf('opensuse') !== -1) {
    result = 'opensuse';
  }
  else if (distro.indexOf('pclinuxos') !== -1) {
    result = 'pclinuxos';
  }
  else if (distro.indexOf('puppy') !== -1) {
    result = 'puppy';
  }
  else if (distro.indexOf('raspbian') !== -1) {
    result = 'raspbian';
  }
  else if (distro.indexOf('reactos') !== -1) {
    result = 'reactos';
  }
  else if (distro.indexOf('redhat') !== -1) {
    result = 'redhat';
  }
  else if (distro.indexOf('slackware') !== -1) {
    result = 'slackware';
  }
  else if (distro.indexOf('sugar') !== -1) {
    result = 'sugar';
  }
  else if (distro.indexOf('steam') !== -1) {
    result = 'steam';
  }
  else if (distro.indexOf('suse') !== -1) {
    result = 'suse';
  }
  else if (distro.indexOf('mate') !== -1) {
    result = 'ubuntu-mate';
  }
  else if (distro.indexOf('lubuntu') !== -1) {
    result = 'lubuntu';
  }
  else if (distro.indexOf('xubuntu') !== -1) {
    result = 'xubuntu';
  }
  else if (distro.indexOf('ubuntu') !== -1) {
    result = 'ubuntu';
  }
  else if (distro.indexOf('solaris') !== -1) {
    result = 'solaris';
  }
  else if (distro.indexOf('tails') !== -1) {
    result = 'tails';
  }
  else if (distro.indexOf('robolinux') !== -1) {
    result = 'robolinux';
  } else if (_linux && distro) {
    result = distro.toLowerCase().trim().replace(/\s+/g, '-');
  }
  return result;
}

// --------------------------
// OS Information

function osInfo(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {

        platform: (_platform === 'Windows_NT' ? 'Windows' : _platform),
        distro: 'unknown',
        release: 'unknown',
        codename: '',
        kernel: os.release(),
        arch: os.arch(),
        hostname: os.hostname(),
        codepage: '',
        logofile: '',
        serial: '',
        build: '',
        servicepack: '',
        uefi: false
      };

      if (_linux) {

        exec('cat /etc/*-release; cat /usr/lib/os-release; cat /etc/openwrt_release', function (error, stdout) {
          //if (!error) {
          /**
           * @namespace
           * @property {string}  DISTRIB_ID
           * @property {string}  NAME
           * @property {string}  DISTRIB_RELEASE
           * @property {string}  VERSION_ID
           * @property {string}  DISTRIB_CODENAME
           */
          let release = {};
          let lines = stdout.toString().split('\n');
          lines.forEach(function (line) {
            if (line.indexOf('=') !== -1) {
              release[line.split('=')[0].trim().toUpperCase()] = line.split('=')[1].trim();
            }
          });
          let releaseVersion = (release.VERSION || '').replace(/"/g, '');
          let codename = (release.DISTRIB_CODENAME || release.VERSION_CODENAME || '').replace(/"/g, '');
          if (releaseVersion.indexOf('(') >= 0) {
            codename = releaseVersion.split('(')[1].replace(/[()]/g, '').trim();
            releaseVersion = releaseVersion.split('(')[0].trim();
          }
          result.distro = (release.DISTRIB_ID || release.NAME || 'unknown').replace(/"/g, '');
          result.logofile = getLogoFile(result.distro);
          result.release = (releaseVersion || release.DISTRIB_RELEASE || release.VERSION_ID || 'unknown').replace(/"/g, '');
          result.codename = codename;
          result.codepage = util.getCodepage();
          result.build = (release.BUILD_ID || '').replace(/"/g, '').trim();
          isUefiLinux().then(uefi => {
            result.uefi = uefi;
            uuid().then(data => {
              result.serial = data.os;
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          });
          //}
        });
      }
      if (_freebsd || _openbsd || _netbsd) {

        exec('sysctl kern.ostype kern.osrelease kern.osrevision kern.hostuuid machdep.bootmethod', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().split('\n');
            result.distro = util.getValue(lines, 'kern.ostype');
            result.logofile = getLogoFile(result.distro);
            result.release = util.getValue(lines, 'kern.osrelease').split('-')[0];
            result.serial = util.getValue(lines, 'kern.uuid');
            result.codename = '';
            result.codepage = util.getCodepage();
            result.uefi = util.getValue(lines, 'machdep.bootmethod').toLowerCase().indexOf('uefi') >= 0;
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_darwin) {
        exec('sw_vers; sysctl kern.ostype kern.osrelease kern.osrevision kern.uuid', function (error, stdout) {
          let lines = stdout.toString().split('\n');
          result.serial = util.getValue(lines, 'kern.uuid');
          result.distro = util.getValue(lines, 'ProductName');
          result.release = util.getValue(lines, 'ProductVersion');
          result.build = util.getValue(lines, 'BuildVersion');
          result.logofile = getLogoFile(result.distro);
          result.codename = 'macOS';
          result.codename = (result.release.indexOf('10.4') > -1 ? 'Mac OS X Tiger' : result.codename);
          result.codename = (result.release.indexOf('10.4') > -1 ? 'Mac OS X Tiger' : result.codename);
          result.codename = (result.release.indexOf('10.4') > -1 ? 'Mac OS X Tiger' : result.codename);
          result.codename = (result.release.indexOf('10.5') > -1 ? 'Mac OS X Leopard' : result.codename);
          result.codename = (result.release.indexOf('10.6') > -1 ? 'Mac OS X Snow Leopard' : result.codename);
          result.codename = (result.release.indexOf('10.7') > -1 ? 'Mac OS X Lion' : result.codename);
          result.codename = (result.release.indexOf('10.8') > -1 ? 'OS X Mountain Lion' : result.codename);
          result.codename = (result.release.indexOf('10.9') > -1 ? 'OS X Mavericks' : result.codename);
          result.codename = (result.release.indexOf('10.10') > -1 ? 'OS X Yosemite' : result.codename);
          result.codename = (result.release.indexOf('10.11') > -1 ? 'OS X El Capitan' : result.codename);
          result.codename = (result.release.indexOf('10.12') > -1 ? 'macOS Sierra' : result.codename);
          result.codename = (result.release.indexOf('10.13') > -1 ? 'macOS High Sierra' : result.codename);
          result.codename = (result.release.indexOf('10.14') > -1 ? 'macOS Mojave' : result.codename);
          result.codename = (result.release.indexOf('10.15') > -1 ? 'macOS Catalina' : result.codename);
          result.uefi = true;
          result.codepage = util.getCodepage();
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_sunos) {
        result.release = result.kernel;
        exec('uname -o', function (error, stdout) {
          let lines = stdout.toString().split('\n');
          result.distro = lines[0];
          result.logofile = getLogoFile(result.distro);
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_windows) {
        result.logofile = getLogoFile();
        result.release = result.kernel;
        try {
          util.wmic('os get /value').then((stdout) => {
            let lines = stdout.toString().split('\r\n');
            result.distro = util.getValue(lines, 'Caption', '=').trim();
            result.serial = util.getValue(lines, 'SerialNumber', '=').trim();
            result.build = util.getValue(lines, 'BuildNumber', '=').trim();
            result.servicepack = util.getValue(lines, 'ServicePackMajorVersion', '=').trim() + '.' + util.getValue(lines, 'ServicePackMinorVersion', '=').trim();
            result.codepage = util.getCodepage();
            isUefiWindows().then(uefi => {
              result.uefi = uefi;
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.osInfo = osInfo;

function isUefiLinux() {
  return new Promise((resolve) => {
    process.nextTick(() => {
      fs.stat('/sys/firmware/efi', function (err) {
        if (!err) {
          resolve(true);
        }
        else {
          resolve(false);
        }
      });
    });
  });
}

function isUefiWindows() {
  return new Promise((resolve) => {
    process.nextTick(() => {
      try {
        exec('findstr /C:"Detected boot environment" "%windir%\\Panther\\setupact.log"', util.execOptsWin, function (error, stdout) {
          if (!error) {
            const line = stdout.toString().split('\n\r')[0];
            resolve(line.toLowerCase().indexOf('uefi') >= 0);
          }
          resolve(false);
        });
      } catch (e) {
        resolve(false);
      }
    });
  });
}

function versions(apps, callback) {
  let versionObject = {
    kernel: os.release(),
    openssl: '',
    systemOpenssl: '',
    systemOpensslLib: '',
    node: process.versions.node,
    v8: process.versions.v8,
    npm: '',
    yarn: '',
    pm2: '',
    gulp: '',
    grunt: '',
    git: '',
    tsc: '',
    mysql: '',
    redis: '',
    mongodb: '',
    apache: '',
    nginx: '',
    php: '',
    docker: '',
    postfix: '',
    postgresql: '',
    perl: '',
    python: '',
    python3: '',
    pip: '',
    pip3: '',
    java: '',
    gcc: '',
    virtualbox: '',
    dotnet: ''
  };

  function checkVersionParam(apps) {
    if (apps === '*') {
      return {
        versions: versionObject,
        counter: 26
      };
    }
    if (!Array.isArray(apps)) {
      apps = apps.trim().toLowerCase().replace(/,+/g, '|').replace(/ /g, '|');
      apps = apps.split('|');
      const result = {
        versions: {},
        counter: 0
      };
      apps.forEach(el => {
        if (el) {
          for (let key in versionObject) {
            if ({}.hasOwnProperty.call(versionObject, key)) {
              if (key.toLowerCase() === el.toLowerCase() && !{}.hasOwnProperty.call(result.versions, key)) {
                result.versions[key] = versionObject[key];
                if (key === 'openssl') {
                  result.versions.systemOpenssl = '';
                  result.versions.systemOpensslLib = '';
                }

                if (!result.versions[key]) { result.counter++; }
              }
            }
          }
        }
      });
      return result;
    }
  }

  return new Promise((resolve) => {
    process.nextTick(() => {
      if (util.isFunction(apps) && !callback) {
        callback = apps;
        apps = '*';
      } else {
        apps = apps || '*';
      }
      const appsObj = checkVersionParam(apps);
      let totalFunctions = appsObj.counter;

      let functionProcessed = (function () {
        return function () {
          if (--totalFunctions === 0) {
            if (callback) {
              callback(appsObj.versions);
            }
            resolve(appsObj.versions);
          }
        };
      })();

      try {
        if ({}.hasOwnProperty.call(appsObj.versions, 'openssl')) {
          appsObj.versions.openssl = process.versions.openssl;
          exec('openssl version', function (error, stdout) {
            if (!error) {
              let openssl_string = stdout.toString().split('\n')[0].trim();
              let openssl = openssl_string.split(' ');
              appsObj.versions.systemOpenssl = openssl.length > 0 ? openssl[1] : openssl[0];
              appsObj.versions.systemOpensslLib = openssl.length > 0 ? openssl[0] : 'openssl';
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'npm')) {
          exec('npm -v', function (error, stdout) {
            if (!error) {
              appsObj.versions.npm = stdout.toString().split('\n')[0];
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'pm2')) {
          exec('pm2 -v', function (error, stdout) {
            if (!error) {
              let pm2 = stdout.toString().split('\n')[0].trim();
              if (!pm2.startsWith('[PM2]')) {
                appsObj.versions.pm2 = pm2;
              }
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'yarn')) {
          exec('yarn --version', function (error, stdout) {
            if (!error) {
              appsObj.versions.yarn = stdout.toString().split('\n')[0];
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'gulp')) {
          exec('gulp --version', function (error, stdout) {
            if (!error) {
              const gulp = stdout.toString().split('\n')[0] || '';
              appsObj.versions.gulp = (gulp.toLowerCase().split('version')[1] || '').trim();
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'tsc')) {
          exec('tsc --version', function (error, stdout) {
            if (!error) {
              const tsc = stdout.toString().split('\n')[0] || '';
              appsObj.versions.tsc = (tsc.toLowerCase().split('version')[1] || '').trim();
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'grunt')) {
          exec('grunt --version', function (error, stdout) {
            if (!error) {
              const grunt = stdout.toString().split('\n')[0] || '';
              appsObj.versions.grunt = (grunt.toLowerCase().split('cli v')[1] || '').trim();
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'git')) {
          if (_darwin) {
            const gitHomebrewExists = fs.existsSync('/usr/local/Cellar/git');
            if (util.darwinXcodeExists() || gitHomebrewExists) {
              exec('git --version', function (error, stdout) {
                if (!error) {
                  let git = stdout.toString().split('\n')[0] || '';
                  git = (git.toLowerCase().split('version')[1] || '').trim();
                  appsObj.versions.git = (git.split(' ')[0] || '').trim();
                }
                functionProcessed();
              });
            } else {
              functionProcessed();
            }
          } else {
            exec('git --version', function (error, stdout) {
              if (!error) {
                let git = stdout.toString().split('\n')[0] || '';
                git = (git.toLowerCase().split('version')[1] || '').trim();
                appsObj.versions.git = (git.split(' ')[0] || '').trim();
              }
              functionProcessed();
            });
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'apache')) {
          exec('apachectl -v 2>&1', function (error, stdout) {
            if (!error) {
              const apache = (stdout.toString().split('\n')[0] || '').split(':');
              appsObj.versions.apache = (apache.length > 1 ? apache[1].replace('Apache', '').replace('/', '').trim() : '');
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'nginx')) {
          exec('nginx -v 2>&1', function (error, stdout) {
            if (!error) {
              const nginx = stdout.toString().split('\n')[0] || '';
              appsObj.versions.nginx = (nginx.toLowerCase().split('/')[1] || '').trim();
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'mysql')) {
          exec('mysql -V', function (error, stdout) {
            if (!error) {
              let mysql = stdout.toString().split('\n')[0] || '';
              mysql = mysql.toLowerCase();
              if (mysql.indexOf(',') > -1) {
                mysql = (mysql.split(',')[0] || '').trim();
                const parts = mysql.split(' ');
                appsObj.versions.mysql = (parts[parts.length - 1] || '').trim();
              } else {
                if (mysql.indexOf(' ver ') > -1) {
                  mysql = mysql.split(' ver ')[1];
                  appsObj.versions.mysql = mysql.split(' ')[0];
                }
              }
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'php')) {
          exec('php -v', function (error, stdout) {
            if (!error) {
              const php = stdout.toString().split('\n')[0] || '';
              let parts = php.split('(');
              if (parts[0].indexOf('-')) {
                parts = parts[0].split('-');
              }
              appsObj.versions.php = parts[0].replace(/[^0-9.]/g, '');
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'redis')) {
          exec('redis-server --version', function (error, stdout) {
            if (!error) {
              const redis = stdout.toString().split('\n')[0] || '';
              const parts = redis.split(' ');
              appsObj.versions.redis = util.getValue(parts, 'v', '=', true);
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'docker')) {
          exec('docker --version', function (error, stdout) {
            if (!error) {
              const docker = stdout.toString().split('\n')[0] || '';
              const parts = docker.split(' ');
              appsObj.versions.docker = parts.length > 2 && parts[2].endsWith(',') ? parts[2].slice(0, -1) : '';
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'postfix')) {
          exec('postconf -d | grep mail_version', function (error, stdout) {
            if (!error) {
              const postfix = stdout.toString().split('\n') || [];
              appsObj.versions.postfix = util.getValue(postfix, 'mail_version', '=', true);
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'mongodb')) {
          exec('mongod --version', function (error, stdout) {
            if (!error) {
              const mongodb = stdout.toString().split('\n')[0] || '';
              appsObj.versions.mongodb = (mongodb.toLowerCase().split(',')[0] || '').replace(/[^0-9.]/g, '');
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'postgresql')) {
          if (_linux) {
            exec('locate bin/postgres', function (error, stdout) {
              if (!error) {
                const postgresqlBin = stdout.toString().split('\n').sort();
                if (postgresqlBin.length) {
                  exec(postgresqlBin[postgresqlBin.length - 1] + ' -V', function (error, stdout) {
                    if (!error) {
                      const postgresql = stdout.toString().split('\n')[0].split(' ') || [];
                      appsObj.versions.postgresql = postgresql.length ? postgresql[postgresql.length - 1] : '';
                    }
                    functionProcessed();
                  });
                } else {
                  functionProcessed();
                }
              } else {
                exec('psql -V', function (error, stdout) {
                  if (!error) {
                    const postgresql = stdout.toString().split('\n')[0].split(' ') || [];
                    appsObj.versions.postgresql = postgresql.length ? postgresql[postgresql.length - 1] : '';
                    appsObj.versions.postgresql = appsObj.versions.postgresql.split('-')[0];
                  }
                  functionProcessed();
                });
                functionProcessed();
              }
            });
          } else {
            if (_windows) {
              util.wmic('service get /value').then((stdout) => {
                let serviceSections = stdout.split(/\n\s*\n/);
                for (let i = 0; i < serviceSections.length; i++) {
                  if (serviceSections[i].trim() !== '') {
                    let lines = serviceSections[i].trim().split('\r\n');
                    let srvCaption = util.getValue(lines, 'caption', '=', true).toLowerCase();
                    if (srvCaption.indexOf('postgresql') > -1) {
                      const parts = srvCaption.split(' server ');
                      if (parts.length > 1) {
                        appsObj.versions.postgresql = parts[1];
                      }
                    }
                  }
                }
                functionProcessed();
              });
            } else {
              exec('postgres -V', function (error, stdout) {
                if (!error) {
                  const postgresql = stdout.toString().split('\n')[0].split(' ') || [];
                  appsObj.versions.postgresql = postgresql.length ? postgresql[postgresql.length - 1] : '';
                }
                functionProcessed();
              });
            }
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'perl')) {
          exec('perl -v', function (error, stdout) {
            if (!error) {
              const perl = stdout.toString().split('\n') || '';
              while (perl.length > 0 && perl[0].trim() === '') {
                perl.shift();
              }
              if (perl.length > 0) {
                appsObj.versions.perl = perl[0].split('(').pop().split(')')[0].replace('v', '');
              }
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'python')) {
          exec('python -V 2>&1', function (error, stdout) {
            if (!error) {
              const python = stdout.toString().split('\n')[0] || '';
              appsObj.versions.python = python.toLowerCase().replace('python', '').trim();
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'python3')) {
          exec('python3 -V 2>&1', function (error, stdout) {
            if (!error) {
              const python = stdout.toString().split('\n')[0] || '';
              appsObj.versions.python3 = python.toLowerCase().replace('python', '').trim();
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'pip')) {
          exec('pip -V 2>&1', function (error, stdout) {
            if (!error) {
              const pip = stdout.toString().split('\n')[0] || '';
              const parts = pip.split(' ');
              appsObj.versions.pip = parts.length >= 2 ? parts[1] : '';
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'pip3')) {
          exec('pip3 -V 2>&1', function (error, stdout) {
            if (!error) {
              const pip = stdout.toString().split('\n')[0] || '';
              const parts = pip.split(' ');
              appsObj.versions.pip3 = parts.length >= 2 ? parts[1] : '';
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'java')) {
          if (_darwin) {
            // check if any JVM is installed but avoid dialog box that Java needs to be installed
            exec('/usr/libexec/java_home -V 2>&1', function (error, stdout) {
              if (!error && stdout.toString().toLowerCase().indexOf('no java runtime') === -1) {
                // now this can be done savely
                exec('java -version 2>&1', function (error, stdout) {
                  if (!error) {
                    const java = stdout.toString().split('\n')[0] || '';
                    const parts = java.split('"');
                    appsObj.versions.java = parts.length === 3 ? parts[1].trim() : '';
                  }
                  functionProcessed();
                });
              } else {
                functionProcessed();
              }
            });
          } else {
            exec('java -version 2>&1', function (error, stdout) {
              if (!error) {
                const java = stdout.toString().split('\n')[0] || '';
                const parts = java.split('"');
                appsObj.versions.java = parts.length === 3 ? parts[1].trim() : '';
              }
              functionProcessed();
            });
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'gcc')) {
          if ((_darwin && util.darwinXcodeExists()) || !_darwin) {
            exec('gcc -dumpversion', function (error, stdout) {
              if (!error) {
                appsObj.versions.gcc = stdout.toString().split('\n')[0].trim() || '';
              }
              if (appsObj.versions.gcc.indexOf('.') > -1) {
                functionProcessed();
              } else {
                exec('gcc --version', function (error, stdout) {
                  if (!error) {
                    const gcc = stdout.toString().split('\n')[0].trim();
                    if (gcc.indexOf('gcc') > -1 && gcc.indexOf(')') > -1) {
                      const parts = gcc.split(')');
                      appsObj.versions.gcc = parts[1].trim() || appsObj.versions.gcc;
                    }
                  }
                  functionProcessed();
                });
              }
            });
          } else {
            functionProcessed();
          }
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'virtualbox')) {
          exec(util.getVboxmanage() + ' -v 2>&1', function (error, stdout) {
            if (!error) {
              const vbox = stdout.toString().split('\n')[0] || '';
              const parts = vbox.split('r');
              appsObj.versions.virtualbox = parts[0];
            }
            functionProcessed();
          });
        }
        if ({}.hasOwnProperty.call(appsObj.versions, 'dotnet')) {
          exec('dotnet --version 2>&1', function (error, stdout) {
            if (!error) {
              const dotnet = stdout.toString().split('\n')[0] || '';
              appsObj.versions.dotnet = dotnet.trim();
            }
            functionProcessed();
          });
        }
      } catch (e) {
        if (callback) { callback(appsObj.versions); }
        resolve(appsObj.versions);
      }
    });
  });
}

exports.versions = versions;

function shell(callback) {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (_windows) {
        let error = new Error(NOT_SUPPORTED);
        if (callback) {
          callback(NOT_SUPPORTED);
        }
        reject(error);
      }

      let result = '';
      exec('echo $SHELL', function (error, stdout) {
        if (!error) {
          result = stdout.toString().split('\n')[0];
        }
        if (callback) {
          callback(result);
        }
        resolve(result);
      });
    });
  });
}

exports.shell = shell;

function uuid(callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        os: ''
      };
      let parts;

      if (_darwin) {
        exec('ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID', function (error, stdout) {
          if (!error) {
            parts = stdout.toString().split('\n')[0].replace(/"/g, '').split('=');
            result.os = parts.length > 1 ? parts[1].trim().toLowerCase() : '';
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_linux) {
        exec('( cat /var/lib/dbus/machine-id /etc/machine-id 2> /dev/null || hostname ) | head -n 1 || :', function (error, stdout) {
          if (!error) {
            result.os = stdout.toString().split('\n')[0].trim().toLowerCase();
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_freebsd || _openbsd || _netbsd) {
        exec('kenv -q smbios.system.uuid', function (error, stdout) {
          if (!error) {
            result.os = stdout.toString().split('\n')[0].trim().toLowerCase();
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
      if (_windows) {
        exec('%windir%\\System32\\reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid', util.execOptsWin, function (error, stdout) {
          if (!error) {
            parts = stdout.toString().split('\n\r')[0].split('REG_SZ');
            result.os = parts.length > 1 ? parts[1].replace(/\r+|\n+|\s+/ig, '').toLowerCase() : '';
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      }
    });
  });
}

exports.uuid = uuid;


/***/ }),

/***/ "./node_modules/systeminformation/lib/processes.js":
/*!*********************************************************!*\
  !*** ./node_modules/systeminformation/lib/processes.js ***!
  \*********************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// processes.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 10. Processes
// ----------------------------------------------------------------------------------

const os = __webpack_require__(/*! os */ "os");
const exec = __webpack_require__(/*! child_process */ "child_process").exec;
const execSync = __webpack_require__(/*! child_process */ "child_process").execSync;

const util = __webpack_require__(/*! ./util */ "./node_modules/systeminformation/lib/util.js");

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

let _processes_cpu = {
  all: 0,
  list: {},
  ms: 0,
  result: {}
};
let _services_cpu = {
  all: 0,
  list: {},
  ms: 0,
  result: {}
};
let _process_cpu = {
  all: 0,
  list: {},
  ms: 0,
  result: {}
};

let _winStatusValues = {
  '0': 'unknown',
  '1': 'other',
  '2': 'ready',
  '3': 'running',
  '4': 'blocked',
  '5': 'suspended blocked',
  '6': 'suspended ready',
  '7': 'terminated',
  '8': 'stopped',
  '9': 'growing',
};


function parseTimeWin(time) {
  time = time || '';
  if (time) {
    return (time.substr(0, 4) + '-' + time.substr(4, 2) + '-' + time.substr(6, 2) + ' ' + time.substr(8, 2) + ':' + time.substr(10, 2) + ':' + time.substr(12, 2));
  } else {
    return '';
  }
}

function parseTimeUnix(time) {
  let result = time;
  let parts = time.replace(/ +/g, ' ').split(' ');
  if (parts.length === 5) {
    result = parts[4] + '-' + ('0' + ('JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC'.indexOf(parts[1].toUpperCase()) / 3 + 1)).slice(-2) + '-' + ('0' + parts[2]).slice(-2) + ' ' + parts[3];
  }
  return result;
}

// --------------------------
// PS - services
// pass a comma separated string with services to check (mysql, apache, postgresql, ...)
// this function gives an array back, if the services are running.

function services(srv, callback) {

  // fallback - if only callback is given
  if (util.isFunction(srv) && !callback) {
    callback = srv;
    srv = '';
  }

  return new Promise((resolve) => {
    process.nextTick(() => {
      if (srv) {
        srv = srv.trim().toLowerCase().replace(/,+/g, ' ').replace(/  +/g, ' ').replace(/ +/g, '|');
        let srvs = srv.split('|');
        let result = [];
        let dataSrv = [];
        let allSrv = [];

        if (_linux || _freebsd || _openbsd || _netbsd || _darwin) {
          if ((_linux || _freebsd || _openbsd || _netbsd) && srv === '*') {
            srv = '';
            let tmpsrv = execSync('service --status-all 2> /dev/null').toString().split('\n');
            for (const s of tmpsrv) {
              const parts = s.split(']');
              if (parts.length === 2) {
                srv += (srv !== '' ? '|' : '') + parts[1].trim();
                allSrv.push({ name: parts[1].trim(), running: parts[0].indexOf('+') > 0 });
              }
            }
            srvs = srv.split('|');
          }
          let comm = (_darwin) ? 'ps -caxo pcpu,pmem,pid,command' : 'ps -axo pcpu,pmem,pid,command';
          if (srv !== '' && srvs.length > 0) {
            exec(comm + ' | grep -v grep | grep -iE "' + srv + '"', { maxBuffer: 1024 * 20000 }, function (error, stdout) {
              if (!error) {
                let lines = stdout.toString().replace(/ +/g, ' ').replace(/,+/g, '.').split('\n');
                srvs.forEach(function (srv) {
                  let ps;
                  if (_darwin) {
                    ps = lines.filter(function (e) {
                      return (e.toLowerCase().indexOf(srv) !== -1);
                    });

                  } else {
                    ps = lines.filter(function (e) {
                      return (e.toLowerCase().indexOf(' ' + srv + ':') !== -1) || (e.toLowerCase().indexOf('/' + srv) !== -1);
                    });
                  }
                  let singleSrv = allSrv.filter(item => { return item.name === srv; });
                  const pids = [];
                  for (const p of ps) {
                    const pid = p.trim().split(' ')[2];
                    if (pid) {
                      pids.push(parseInt(pid, 10));
                    }
                  }
                  result.push({
                    name: srv,
                    running: (allSrv.length && singleSrv.length ? singleSrv[0].running : ps.length > 0),
                    startmode: '',
                    pids: pids,
                    pcpu: parseFloat((ps.reduce(function (pv, cv) {
                      return pv + parseFloat(cv.trim().split(' ')[0]);
                    }, 0)).toFixed(2)),
                    pmem: parseFloat((ps.reduce(function (pv, cv) {
                      return pv + parseFloat(cv.trim().split(' ')[1]);
                    }, 0)).toFixed(2))
                  });
                });
                if (_linux) {
                  // calc process_cpu - ps is not accurate in linux!
                  let cmd = 'cat /proc/stat | grep "cpu "';
                  for (let i in result) {
                    for (let j in result[i].pids) {
                      cmd += (';cat /proc/' + result[i].pids[j] + '/stat');
                    }
                  }
                  exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
                    let curr_processes = stdout.toString().split('\n');

                    // first line (all - /proc/stat)
                    let all = parseProcStat(curr_processes.shift());

                    // process
                    let list_new = {};
                    let resultProcess = {};
                    for (let i = 0; i < curr_processes.length; i++) {
                      resultProcess = calcProcStatLinux(curr_processes[i], all, _services_cpu);

                      if (resultProcess.pid) {
                        let listPos = -1;
                        for (let i in result) {
                          for (let j in result[i].pids) {
                            if (parseInt(result[i].pids[j]) === parseInt(resultProcess.pid)) {
                              listPos = i;
                            }
                          }
                        }
                        if (listPos >= 0) {
                          result[listPos].pcpu += resultProcess.pcpuu + resultProcess.pcpus;
                        }

                        // save new values
                        list_new[resultProcess.pid] = {
                          pcpuu: resultProcess.pcpuu,
                          pcpus: resultProcess.pcpus,
                          utime: resultProcess.utime,
                          stime: resultProcess.stime,
                          cutime: resultProcess.cutime,
                          cstime: resultProcess.cstime
                        };
                      }
                    }

                    // store old values
                    _services_cpu.all = all;
                    _services_cpu.list = list_new;
                    _services_cpu.ms = Date.now() - _services_cpu.ms;
                    _services_cpu.result = result;
                    if (callback) { callback(result); }
                    resolve(result);
                  });
                } else {
                  if (callback) { callback(result); }
                  resolve(result);
                }
              } else {
                exec('ps -o comm | grep -v grep | egrep "' + srv + '"', { maxBuffer: 1024 * 20000 }, function (error, stdout) {
                  if (!error) {
                    let lines = stdout.toString().replace(/ +/g, ' ').replace(/,+/g, '.').split('\n');
                    srvs.forEach(function (srv) {
                      let ps = lines.filter(function (e) {
                        return e.indexOf(srv) !== -1;
                      });
                      result.push({
                        name: srv,
                        running: ps.length > 0,
                        startmode: '',
                        pcpu: 0,
                        pmem: 0
                      });
                    });
                    if (callback) { callback(result); }
                    resolve(result);
                  } else {
                    srvs.forEach(function (srv) {
                      result.push({
                        name: srv,
                        running: false,
                        startmode: '',
                        pcpu: 0,
                        pmem: 0
                      });
                    });
                    if (callback) { callback(result); }
                    resolve(result);
                  }
                });
              }
            });
          } else {
            if (callback) { callback(result); }
            resolve(result);
          }
        }
        if (_windows) {
          try {
            util.wmic('service get /value').then((stdout, error) => {
              if (!error) {
                let serviceSections = stdout.split(/\n\s*\n/);
                for (let i = 0; i < serviceSections.length; i++) {
                  if (serviceSections[i].trim() !== '') {
                    let lines = serviceSections[i].trim().split('\r\n');
                    let srvName = util.getValue(lines, 'Name', '=', true).toLowerCase();
                    let started = util.getValue(lines, 'Started', '=', true);
                    let startMode = util.getValue(lines, 'StartMode', '=', true);
                    let pid = util.getValue(lines, 'ProcessId', '=', true);
                    if (srv === '*' || srvs.indexOf(srvName) >= 0) {
                      result.push({
                        name: srvName,
                        running: (started === 'TRUE'),
                        startmode: startMode,
                        pids: [ pid],
                        pcpu: 0,
                        pmem: 0
                      });
                      dataSrv.push(srvName);
                    }
                  }
                }
                if (srv !== '*') {
                  let srvsMissing = srvs.filter(function (e) {
                    return dataSrv.indexOf(e) === -1;
                  });
                  srvsMissing.forEach(function (srvName) {
                    result.push({
                      name: srvName,
                      running: false,
                      startmode: '',
                      pids: [],
                      pcpu: 0,
                      pmem: 0
                    });
                  });
                }
                if (callback) { callback(result); }
                resolve(result);
              } else {
                srvs.forEach(function (srvName) {
                  result.push({
                    name: srvName,
                    running: false,
                    startmode: '',
                    pcpu: 0,
                    pmem: 0
                  });
                });
                if (callback) { callback(result); }
                resolve(result);
              }
            });
          } catch (e) {
            if (callback) { callback(result); }
            resolve(result);
          }
        }
      } else {
        if (callback) { callback({}); }
        resolve({});
      }
    });
  });
}

exports.services = services;

function parseProcStat(line) {
  let parts = line.replace(/ +/g, ' ').split(' ');
  let user = (parts.length >= 2 ? parseInt(parts[1]) : 0);
  let nice = (parts.length >= 3 ? parseInt(parts[2]) : 0);
  let system = (parts.length >= 4 ? parseInt(parts[3]) : 0);
  let idle = (parts.length >= 5 ? parseInt(parts[4]) : 0);
  let iowait = (parts.length >= 6 ? parseInt(parts[5]) : 0);
  let irq = (parts.length >= 7 ? parseInt(parts[6]) : 0);
  let softirq = (parts.length >= 8 ? parseInt(parts[7]) : 0);
  let steal = (parts.length >= 9 ? parseInt(parts[8]) : 0);
  let guest = (parts.length >= 10 ? parseInt(parts[9]) : 0);
  let guest_nice = (parts.length >= 11 ? parseInt(parts[10]) : 0);
  return user + nice + system + idle + iowait + irq + softirq + steal + guest + guest_nice;
}

function calcProcStatLinux(line, all, _cpu_old) {
  let statparts = line.replace(/ +/g, ' ').split(')');
  if (statparts.length >= 2) {
    let parts = statparts[1].split(' ');
    if (parts.length >= 16) {
      let pid = parseInt(statparts[0].split(' ')[0]);
      let utime = parseInt(parts[12]);
      let stime = parseInt(parts[13]);
      let cutime = parseInt(parts[14]);
      let cstime = parseInt(parts[15]);

      // calc
      let pcpuu = 0;
      let pcpus = 0;
      if (_cpu_old.all > 0 && _cpu_old.list[pid]) {
        pcpuu = (utime + cutime - _cpu_old.list[pid].utime - _cpu_old.list[pid].cutime) / (all - _cpu_old.all) * 100; // user
        pcpus = (stime + cstime - _cpu_old.list[pid].stime - _cpu_old.list[pid].cstime) / (all - _cpu_old.all) * 100; // system
      } else {
        pcpuu = (utime + cutime) / (all) * 100; // user
        pcpus = (stime + cstime) / (all) * 100; // system
      }
      return {
        pid: pid,
        utime: utime,
        stime: stime,
        cutime: cutime,
        cstime: cstime,
        pcpuu: pcpuu,
        pcpus: pcpus
      };
    } else {
      return {
        pid: 0,
        utime: 0,
        stime: 0,
        cutime: 0,
        cstime: 0,
        pcpuu: 0,
        pcpus: 0
      };
    }
  } else {
    return {
      pid: 0,
      utime: 0,
      stime: 0,
      cutime: 0,
      cstime: 0,
      pcpuu: 0,
      pcpus: 0
    };
  }
}

function calcProcStatWin(procStat, all, _cpu_old) {
  // calc
  let pcpuu = 0;
  let pcpus = 0;
  if (_cpu_old.all > 0 && _cpu_old.list[procStat.pid]) {
    pcpuu = (procStat.utime - _cpu_old.list[procStat.pid].utime) / (all - _cpu_old.all) * 100; // user
    pcpus = (procStat.stime - _cpu_old.list[procStat.pid].stime) / (all - _cpu_old.all) * 100; // system
  } else {
    pcpuu = (procStat.utime) / (all) * 100; // user
    pcpus = (procStat.stime) / (all) * 100; // system
  }
  return {
    pid: procStat.pid,
    utime: procStat.utime,
    stime: procStat.stime,
    pcpuu: pcpuu,
    pcpus: pcpus
  };
}



// --------------------------
// running processes

function processes(callback) {

  let parsedhead = [];

  function getName(command) {
    command = command || '';
    let result = command.split(' ')[0];
    if (result.substr(-1) === ':') {
      result = result.substr(0, result.length - 1);
    }
    if (result.substr(0, 1) !== '[') {
      let parts = result.split('/');
      if (isNaN(parseInt(parts[parts.length - 1]))) {
        result = parts[parts.length - 1];
      } else {
        result = parts[0];
      }
    }
    return result;
  }

  function parseLine(line) {
    let offset = 0;
    let offset2 = 0;

    function checkColumn(i) {
      offset = offset2;
      offset2 = line.substring(parsedhead[i].to + offset, 1000).indexOf(' ');
    }

    checkColumn(0);
    const pid = parseInt(line.substring(parsedhead[0].from + offset, parsedhead[0].to + offset2));
    checkColumn(1);
    const ppid = parseInt(line.substring(parsedhead[1].from + offset, parsedhead[1].to + offset2));
    checkColumn(2);
    const pcpu = parseFloat(line.substring(parsedhead[2].from + offset, parsedhead[2].to + offset2).replace(/,/g, '.'));
    checkColumn(3);
    const pmem = parseFloat(line.substring(parsedhead[3].from + offset, parsedhead[3].to + offset2).replace(/,/g, '.'));
    checkColumn(4);
    const priority = parseInt(line.substring(parsedhead[4].from + offset, parsedhead[4].to + offset2));
    checkColumn(5);
    const vsz = parseInt(line.substring(parsedhead[5].from + offset, parsedhead[5].to + offset2));
    checkColumn(6);
    const rss = parseInt(line.substring(parsedhead[6].from + offset, parsedhead[6].to + offset2));
    checkColumn(7);
    const nice = parseInt(line.substring(parsedhead[7].from + offset, parsedhead[7].to + offset2)) || 0;
    checkColumn(8);
    const started = parseTimeUnix(line.substring(parsedhead[8].from + offset, parsedhead[8].to + offset2).trim());
    checkColumn(9);
    let state = line.substring(parsedhead[9].from + offset, parsedhead[9].to + offset2).trim();
    state = (state[0] === 'R' ? 'running' : (state[0] === 'S' ? 'sleeping' : (state[0] === 'T' ? 'stopped' : (state[0] === 'W' ? 'paging' : (state[0] === 'X' ? 'dead' : (state[0] === 'Z' ? 'zombie' : ((state[0] === 'D' || state[0] === 'U') ? 'blocked' : 'unknown')))))));
    checkColumn(10);
    let tty = line.substring(parsedhead[10].from + offset, parsedhead[10].to + offset2).trim();
    if (tty === '?' || tty === '??') tty = '';
    checkColumn(11);
    const user = line.substring(parsedhead[11].from + offset, parsedhead[11].to + offset2).trim();
    checkColumn(12);
    const fullcommand = line.substring(parsedhead[12].from + offset, parsedhead[12].to + offset2).trim().replace(/\[/g, '').replace(/]/g, '');
    let path = '';
    let command = '';
    let params = '';
    // try to figure out where parameter starts
    let firstParamPos = fullcommand.indexOf(' -');
    let firstParamPathPos = fullcommand.indexOf(' /');
    firstParamPos = (firstParamPos >= 0 ? firstParamPos : 10000);
    firstParamPathPos = (firstParamPathPos >= 0 ? firstParamPathPos : 10000);
    const firstPos = Math.min(firstParamPos, firstParamPathPos);
    let tmpCommand = fullcommand.substr(0, firstPos);
    const tmpParams = fullcommand.substr(firstPos);
    const lastSlashPos = tmpCommand.lastIndexOf('/');
    if (lastSlashPos >= 0) {
      path = tmpCommand.substr(0, lastSlashPos);
      tmpCommand = tmpCommand.substr(lastSlashPos + 1);
    }

    if (firstPos === 10000) {
      const parts = tmpCommand.split(' ');
      command = parts.shift();
      params = (parts.join(' ') + ' ' + tmpParams).trim();
    } else {
      command = tmpCommand.trim();
      params = tmpParams.trim();
    }

    return ({
      pid: pid,
      parentPid: ppid,
      name: _linux ? getName(command) : command,
      pcpu: pcpu,
      pcpuu: 0,
      pcpus: 0,
      pmem: pmem,
      priority: priority,
      mem_vsz: vsz,
      mem_rss: rss,
      nice: nice,
      started: started,
      state: state,
      tty: tty,
      user: user,
      command: command,
      params: params,
      path: path
    });
  }

  function parseProcesses(lines) {
    let result = [];
    if (lines.length > 1) {
      let head = lines[0];
      parsedhead = util.parseHead(head, 8);
      lines.shift();
      lines.forEach(function (line) {
        if (line.trim() !== '') {
          result.push(parseLine(line));
        }
      });
    }
    return result;
  }
  function parseProcesses2(lines) {

    function formatDateTime(time) {
      const month = ('0' + (time.getMonth() + 1).toString()).substr(-2);
      const year = time.getFullYear().toString();
      const day = ('0' + time.getDay().toString()).substr(-2);
      const hours = time.getHours().toString();
      const mins = time.getMinutes().toString();
      const secs = ('0' + time.getSeconds().toString()).substr(-2);

      return (year + '-' + month + '-' + day + ' ' + hours + ':' + mins + ':' + secs);
    }

    let result = [];
    lines.forEach(function (line) {
      if (line.trim() !== '') {
        line = line.trim().replace(/ +/g, ' ').replace(/,+/g, '.');
        const parts = line.split(' ');
        const command = parts.slice(9).join(' ');
        const pmem = parseFloat((1.0 * parseInt(parts[3]) * 1024 / os.totalmem()).toFixed(1));
        const elapsed_parts = parts[5].split(':');
        const started = formatDateTime(new Date(Date.now() - (elapsed_parts.length > 1 ? (elapsed_parts[0] * 60 + elapsed_parts[1]) * 1000 : elapsed_parts[0] * 1000)));

        result.push({
          pid: parseInt(parts[0]),
          parentPid: parseInt(parts[1]),
          name: getName(command),
          pcpu: 0,
          pcpuu: 0,
          pcpus: 0,
          pmem: pmem,
          priority: 0,
          mem_vsz: parseInt(parts[2]),
          mem_rss: parseInt(parts[3]),
          nice: parseInt(parts[4]),
          started: started,
          state: (parts[6] === 'R' ? 'running' : (parts[6] === 'S' ? 'sleeping' : (parts[6] === 'T' ? 'stopped' : (parts[6] === 'W' ? 'paging' : (parts[6] === 'X' ? 'dead' : (parts[6] === 'Z' ? 'zombie' : ((parts[6] === 'D' || parts[6] === 'U') ? 'blocked' : 'unknown'))))))),
          tty: parts[7],
          user: parts[8],
          command: command
        });
      }
    });
    return result;
  }

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        all: 0,
        running: 0,
        blocked: 0,
        sleeping: 0,
        unknown: 0,
        list: []
      };

      let cmd = '';

      if ((_processes_cpu.ms && Date.now() - _processes_cpu.ms >= 500) || _processes_cpu.ms === 0) {
        if (_linux || _freebsd || _openbsd || _netbsd || _darwin || _sunos) {
          if (_linux) cmd = 'export LC_ALL=C; ps -axo pid:11,ppid:11,pcpu:6,pmem:6,pri:5,vsz:11,rss:11,ni:5,lstart:30,state:5,tty:15,user:20,command; unset LC_ALL';
          if (_freebsd || _openbsd || _netbsd) cmd = 'export LC_ALL=C; ps -axo pid,ppid,pcpu,pmem,pri,vsz,rss,ni,lstart,state,tty,user,command; unset LC_ALL';
          if (_darwin) cmd = 'export LC_ALL=C; ps -axo pid,ppid,pcpu,pmem,pri,vsz,rss,nice,lstart,state,tty,user,command -r; unset LC_ALL';
          if (_sunos) cmd = 'ps -Ao pid,ppid,pcpu,pmem,pri,vsz,rss,nice,stime,s,tty,user,comm';
          exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
            if (!error) {
              result.list = parseProcesses(stdout.toString().split('\n'));
              result.all = result.list.length;
              result.running = result.list.filter(function (e) {
                return e.state === 'running';
              }).length;
              result.blocked = result.list.filter(function (e) {
                return e.state === 'blocked';
              }).length;
              result.sleeping = result.list.filter(function (e) {
                return e.state === 'sleeping';
              }).length;

              if (_linux) {
                // calc process_cpu - ps is not accurate in linux!
                cmd = 'cat /proc/stat | grep "cpu "';
                for (let i = 0; i < result.list.length; i++) {
                  cmd += (';cat /proc/' + result.list[i].pid + '/stat');
                }
                exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
                  let curr_processes = stdout.toString().split('\n');

                  // first line (all - /proc/stat)
                  let all = parseProcStat(curr_processes.shift());

                  // process
                  let list_new = {};
                  let resultProcess = {};
                  for (let i = 0; i < curr_processes.length; i++) {
                    resultProcess = calcProcStatLinux(curr_processes[i], all, _processes_cpu);

                    if (resultProcess.pid) {

                      // store pcpu in outer array
                      let listPos = result.list.map(function (e) { return e.pid; }).indexOf(resultProcess.pid);
                      if (listPos >= 0) {
                        result.list[listPos].pcpu = resultProcess.pcpuu + resultProcess.pcpus;
                        result.list[listPos].pcpuu = resultProcess.pcpuu;
                        result.list[listPos].pcpus = resultProcess.pcpus;
                      }

                      // save new values
                      list_new[resultProcess.pid] = {
                        pcpuu: resultProcess.pcpuu,
                        pcpus: resultProcess.pcpus,
                        utime: resultProcess.utime,
                        stime: resultProcess.stime,
                        cutime: resultProcess.cutime,
                        cstime: resultProcess.cstime
                      };
                    }
                  }

                  // store old values
                  _processes_cpu.all = all;
                  _processes_cpu.list = list_new;
                  _processes_cpu.ms = Date.now() - _processes_cpu.ms;
                  _processes_cpu.result = result;
                  if (callback) { callback(result); }
                  resolve(result);
                });
              } else {
                if (callback) { callback(result); }
                resolve(result);
              }
            } else {
              cmd = 'ps -o pid,ppid,vsz,rss,nice,etime,stat,tty,user,comm';
              if (_sunos) {
                cmd = 'ps -o pid,ppid,vsz,rss,nice,etime,s,tty,user,comm';
              }
              exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
                if (!error) {
                  let lines = stdout.toString().split('\n');
                  lines.shift();

                  result.list = parseProcesses2(lines);
                  result.all = result.list.length;
                  result.running = result.list.filter(function (e) {
                    return e.state === 'running';
                  }).length;
                  result.blocked = result.list.filter(function (e) {
                    return e.state === 'blocked';
                  }).length;
                  result.sleeping = result.list.filter(function (e) {
                    return e.state === 'sleeping';
                  }).length;
                  if (callback) { callback(result); }
                  resolve(result);
                } else {
                  if (callback) { callback(result); }
                  resolve(result);
                }
              });
            }
          });
        }
        if (_windows) {
          try {
            util.wmic('process get /value').then((stdout, error) => {
              if (!error) {
                let processSections = stdout.split(/\n\s*\n/);
                let procs = [];
                let procStats = [];
                let list_new = {};
                let allcpuu = 0;
                let allcpus = 0;
                for (let i = 0; i < processSections.length; i++) {
                  if (processSections[i].trim() !== '') {
                    let lines = processSections[i].trim().split('\r\n');
                    let pid = parseInt(util.getValue(lines, 'ProcessId', '=', true), 10);
                    let parentPid = parseInt(util.getValue(lines, 'ParentProcessId', '=', true), 10);
                    let statusValue = util.getValue(lines, 'ExecutionState', '=');
                    let name = util.getValue(lines, 'Caption', '=', true);
                    let commandLine = util.getValue(lines, 'CommandLine', '=', true);
                    let commandPath = util.getValue(lines, 'ExecutablePath', '=', true);
                    let utime = parseInt(util.getValue(lines, 'UserModeTime', '=', true), 10);
                    let stime = parseInt(util.getValue(lines, 'KernelModeTime', '=', true), 10);
                    let mem = parseInt(util.getValue(lines, 'WorkingSetSize', '=', true), 10);
                    allcpuu = allcpuu + utime;
                    allcpus = allcpus + stime;
                    result.all++;
                    if (!statusValue) { result.unknown++; }
                    if (statusValue === '3') { result.running++; }
                    if (statusValue === '4' || statusValue === '5') { result.blocked++; }

                    procStats.push({
                      pid: pid,
                      utime: utime,
                      stime: stime,
                      pcpu: 0,
                      pcpuu: 0,
                      pcpus: 0,
                    });
                    procs.push({
                      pid: pid,
                      parentPid: parentPid,
                      name: name,
                      pcpu: 0,
                      pcpuu: 0,
                      pcpus: 0,
                      pmem: mem / os.totalmem() * 100,
                      priority: parseInt(util.getValue(lines, 'Priority', '=', true), 10),
                      mem_vsz: parseInt(util.getValue(lines, 'PageFileUsage', '=', true), 10),
                      mem_rss: Math.floor(parseInt(util.getValue(lines, 'WorkingSetSize', '=', true), 10) / 1024),
                      nice: 0,
                      started: parseTimeWin(util.getValue(lines, 'CreationDate', '=', true)),
                      state: (!statusValue ? _winStatusValues[0] : _winStatusValues[statusValue]),
                      tty: '',
                      user: '',
                      command: commandLine || name,
                      path: commandPath,
                      params: ''
                    });
                  }
                }
                result.sleeping = result.all - result.running - result.blocked - result.unknown;
                result.list = procs;
                for (let i = 0; i < procStats.length; i++) {
                  let resultProcess = calcProcStatWin(procStats[i], allcpuu + allcpus, _processes_cpu);

                  // store pcpu in outer array
                  let listPos = result.list.map(function (e) { return e.pid; }).indexOf(resultProcess.pid);
                  if (listPos >= 0) {
                    result.list[listPos].pcpu = resultProcess.pcpuu + resultProcess.pcpus;
                    result.list[listPos].pcpuu = resultProcess.pcpuu;
                    result.list[listPos].pcpus = resultProcess.pcpus;
                  }

                  // save new values
                  list_new[resultProcess.pid] = {
                    pcpuu: resultProcess.pcpuu,
                    pcpus: resultProcess.pcpus,
                    utime: resultProcess.utime,
                    stime: resultProcess.stime
                  };
                }
                // store old values
                _processes_cpu.all = allcpuu + allcpus;
                _processes_cpu.list = list_new;
                _processes_cpu.ms = Date.now() - _processes_cpu.ms;
                _processes_cpu.result = result;
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          } catch (e) {
            if (callback) { callback(result); }
            resolve(result);
          }
        }
      } else {
        if (callback) { callback(_processes_cpu.result); }
        resolve(_processes_cpu.result);
      }
    });
  });
}

exports.processes = processes;

// --------------------------
// PS - process load
// get detailed information about a certain process
// (PID, CPU-Usage %, Mem-Usage %)

function processLoad(proc, callback) {

  // fallback - if only callback is given
  if (util.isFunction(proc) && !callback) {
    callback = proc;
    proc = '';
  }

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = {
        'proc': proc,
        'pid': -1,
        'cpu': 0,
        'mem': 0
      };

      if (proc) {
        if (_windows) {
          try {
            util.wmic('process get /value').then((stdout, error) => {
              if (!error) {
                let processSections = stdout.split(/\n\s*\n/);
                let procStats = [];
                let list_new = {};
                let allcpuu = 0;
                let allcpus = 0;
                for (let i = 0; i < processSections.length; i++) {
                  if (processSections[i].trim() !== '') {
                    let lines = processSections[i].trim().split('\r\n');
                    let pid = parseInt(util.getValue(lines, 'ProcessId', '=', true), 10);
                    let name = util.getValue(lines, 'Caption', '=', true);
                    let utime = parseInt(util.getValue(lines, 'UserModeTime', '=', true), 10);
                    let stime = parseInt(util.getValue(lines, 'KernelModeTime', '=', true), 10);
                    let mem = parseInt(util.getValue(lines, 'WorkingSetSize', '=', true), 10);
                    allcpuu = allcpuu + utime;
                    allcpus = allcpus + stime;

                    procStats.push({
                      pid: pid,
                      utime: utime,
                      stime: stime,
                      pcpu: 0,
                      pcpuu: 0,
                      pcpus: 0,
                    });
                    if (name.toLowerCase().indexOf(proc.toLowerCase()) >= 0) {
                      if (result.pid === -1) {
                        result = {
                          proc: name,
                          pid: pid,
                          pids: [pid],
                          cpu: 0,
                          mem: mem / os.totalmem() * 100
                        };
                      } else {
                        result.pids.push(pid);
                        result.mem += mem / os.totalmem() * 100;
                      }
                    }
                  }
                }
                for (let i = 0; i < procStats.length; i++) {
                  let resultProcess = calcProcStatWin(procStats[i], allcpuu + allcpus, _process_cpu);

                  // store pcpu in outer array
                  if (result && result.pids && result.pids.length > 0) {
                    let listPos = result.pids.indexOf(resultProcess.pid);
                    if (listPos >= 0) {
                      result.cpu = resultProcess.pcpuu + resultProcess.pcpus;
                    }
                  }

                  // save new values
                  list_new[resultProcess.pid] = {
                    pcpuu: resultProcess.pcpuu,
                    pcpus: resultProcess.pcpus,
                    utime: resultProcess.utime,
                    stime: resultProcess.stime
                  };
                }
                // store old values
                _process_cpu.all = allcpuu + allcpus;
                _process_cpu.list = list_new;
                _process_cpu.ms = Date.now() - _process_cpu.ms;
                _process_cpu.result = result;
                if (callback) {
                  callback(result);
                }
                resolve(result);
              }
            });
          } catch (e) {
            if (callback) { callback(result); }
            resolve(result);
          }
        }

        if (_darwin || _linux) {
          exec('ps -axo pid,pcpu,pmem,comm | grep -i ' + proc + ' | grep -v grep', { maxBuffer: 1024 * 20000 }, function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\n');

              let pid = 0;
              let pids = [];
              let cpu = 0;
              let mem = 0;

              lines.forEach(function (line) {
                let data = line.trim().replace(/ +/g, ' ').split(' ');
                if (data.length > 3) {
                  pid = (!pid ? parseInt(data[0]) : 0);
                  pids.push(parseInt(data[0], 10));
                  cpu = cpu + parseFloat(data[1].replace(',', '.'));
                  mem = mem + parseFloat(data[2].replace(',', '.'));
                }
              });

              result = {
                'proc': proc,
                'pid': pid,
                'pids': pids,
                'cpu': parseFloat((cpu / lines.length).toFixed(2)),
                'mem': parseFloat((mem / lines.length).toFixed(2))
              };
              if (_linux) {
                // calc process_cpu - ps is not accurate in linux!
                let cmd = 'cat /proc/stat | grep "cpu "';
                for (let i = 0; i < result.pids.length; i++) {
                  cmd += (';cat /proc/' + result.pids[i] + '/stat');
                }

                exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
                  let curr_processes = stdout.toString().split('\n');

                  // first line (all - /proc/stat)
                  let all = parseProcStat(curr_processes.shift());

                  // process
                  let list_new = {};
                  let resultProcess = {};
                  result.cpu = 0;
                  for (let i = 0; i < curr_processes.length; i++) {
                    resultProcess = calcProcStatLinux(curr_processes[i], all, _process_cpu);

                    if (resultProcess.pid) {

                      // store pcpu in outer result
                      result.cpu += resultProcess.pcpuu + resultProcess.pcpus;

                      // save new values
                      list_new[resultProcess.pid] = {
                        pcpuu: resultProcess.pcpuu,
                        pcpus: resultProcess.pcpus,
                        utime: resultProcess.utime,
                        stime: resultProcess.stime,
                        cutime: resultProcess.cutime,
                        cstime: resultProcess.cstime
                      };
                    }
                  }

                  result.cpu = Math.round(result.cpu * 100) / 100;

                  _process_cpu.all = all;
                  _process_cpu.list = list_new;
                  _process_cpu.ms = Date.now() - _process_cpu.ms;
                  _process_cpu.result = result;
                  if (callback) { callback(result); }
                  resolve(result);
                });
              } else {
                if (callback) { callback(result); }
                resolve(result);
              }
            } else {
              if (callback) { callback(result); }
              resolve(result);
            }
          });
        }
      }
    });
  });
}

exports.processLoad = processLoad;


/***/ }),

/***/ "./node_modules/systeminformation/lib/system.js":
/*!******************************************************!*\
  !*** ./node_modules/systeminformation/lib/system.js ***!
  \******************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// system.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 2. System (Hardware, BIOS, Base Board)
// ----------------------------------------------------------------------------------

const exec = __webpack_require__(/*! child_process */ "child_process").exec;
const execSync = __webpack_require__(/*! child_process */ "child_process").execSync;
const fs = __webpack_require__(/*! fs */ "fs");
const util = __webpack_require__(/*! ./util */ "./node_modules/systeminformation/lib/util.js");

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

function system(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        manufacturer: '',
        model: 'Computer',
        version: '',
        serial: '-',
        uuid: '-',
        sku: '-',
      };

      if (_linux || _freebsd || _openbsd || _netbsd) {
        exec('export LC_ALL=C; dmidecode -t system 2>/dev/null; unset LC_ALL', function (error, stdout) {
          // if (!error) {
          let lines = stdout.toString().split('\n');
          result.manufacturer = util.getValue(lines, 'manufacturer');
          result.model = util.getValue(lines, 'product name');
          result.version = util.getValue(lines, 'version');
          result.serial = util.getValue(lines, 'serial number');
          result.uuid = util.getValue(lines, 'uuid');
          result.sku = util.getValue(lines, 'sku number');
          // }
          // Non-Root values
          const cmd = `echo -n "product_name: "; cat /sys/devices/virtual/dmi/id/product_name 2>/dev/null; echo;
            echo -n "product_serial: "; cat /sys/devices/virtual/dmi/id/product_serial 2>/dev/null; echo;
            echo -n "product_uuid: "; cat /sys/devices/virtual/dmi/id/product_uuid 2>/dev/null; echo;
            echo -n "product_version: "; cat /sys/devices/virtual/dmi/id/product_version 2>/dev/null; echo;
            echo -n "sys_vendor: "; cat /sys/devices/virtual/dmi/id/sys_vendor 2>/dev/null; echo;`;
          try {
            lines = execSync(cmd).toString().split('\n');
            result.manufacturer = result.manufacturer === '' ? util.getValue(lines, 'sys_vendor') : result.manufacturer;
            result.model = result.model === '' ? util.getValue(lines, 'product_name') : result.model;
            result.version = result.version === '' ? util.getValue(lines, 'product_version') : result.version;
            result.serial = result.serial === '' ? util.getValue(lines, 'product_serial') : result.serial;
            result.uuid = result.uuid === '' ? util.getValue(lines, 'product_uuid') : result.uuid;
          } catch (e) {
            util.noop();
          }
          if (!result.serial || result.serial.toLowerCase().indexOf('o.e.m.') !== -1) result.serial = '-';
          if (!result.manufacturer || result.manufacturer.toLowerCase().indexOf('o.e.m.') !== -1) result.manufacturer = '';
          if (!result.model || result.model.toLowerCase().indexOf('o.e.m.') !== -1) result.model = 'Computer';
          if (!result.version || result.version.toLowerCase().indexOf('o.e.m.') !== -1) result.version = '';
          if (!result.sku || result.sku.toLowerCase().indexOf('o.e.m.') !== -1) result.sku = '-';
          // detect docker
          if (fs.existsSync('/.dockerenv') || fs.existsSync('/.dockerinit')) {
            result.model = 'Docker Container';
          }
          if (result.manufacturer === '' && result.model === 'Computer' && result.version === '') { // still default values
            exec('dmesg | grep -i virtual | grep -iE "vmware|qemu|kvm|xen"', function (error, stdout) {
              // detect virtual machines
              if (!error) {
                let lines = stdout.toString().split('\n');
                if (lines.length > 0) result.model = 'Virtual machine';
              }

              if (result.manufacturer === '' && result.model === 'Computer' && result.version === '') {
                // Check Raspberry Pi
                fs.readFile('/proc/cpuinfo', function (error, stdout) {
                  if (!error) {
                    let lines = stdout.toString().split('\n');
                    result.model = util.getValue(lines, 'hardware', ':', true).toUpperCase();
                    result.version = util.getValue(lines, 'revision', ':', true).toLowerCase();
                    result.serial = util.getValue(lines, 'serial', ':', true);

                    // reference values: https://elinux.org/RPi_HardwareHistory
                    // https://www.raspberrypi.org/documentation/hardware/raspberrypi/revision-codes/README.md
                    if (result.model === 'BCM2835' || result.model === 'BCM2708' || result.model === 'BCM2709' || result.model === 'BCM2835' || result.model === 'BCM2837') {

                      // Pi 4
                      if (['c03112'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi 4 Model B';
                        result.version = result.version + ' - Rev. 1.2';
                      }
                      if (['a03111', 'b03111', 'c03111'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi 4 Model B';
                        result.version = result.version + ' - Rev. 1.1';
                      }
                      // Pi 3
                      if (['a02082', 'a22082', 'a32082'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi 3 Model B';
                        result.version = result.version + ' - Rev. 1.2';
                      }
                      if (['a020d3'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi 3 Model B+';
                        result.version = result.version + ' - Rev. 1.3';
                      }
                      if (['9020e0'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi 3 Model A+';
                        result.version = result.version + ' - Rev. 1.3';
                      }
                      // Pi 2 Model B
                      if (['a01040'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi 2 Model B';
                        result.version = result.version + ' - Rev. 1.0';
                      }
                      if (['a01041', 'a21041'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi 2 Model B';
                        result.version = result.version + ' - Rev. 1.1';
                      }
                      if (['a22042'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi 2 Model B';
                        result.version = result.version + ' - Rev. 1.2';
                      }

                      // Pi Zero
                      if (['900092'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi Zero';
                        result.version = result.version + ' - Rev 1.2';
                      }
                      if (['900093', '920093'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi Zero';
                        result.version = result.version + ' - Rev 1.3';
                      }
                      if (['9000c1'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi Zero W';
                        result.version = result.version + ' - Rev 1.1';
                      }

                      // A, B, A+ B+
                      if (['0002', '0003'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi Model B';
                        result.version = result.version + ' - Rev 1.0';
                      }
                      if (['0004', '0005', '0006', '000d', '000e', '000f'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi Model B';
                        result.version = result.version + ' - Rev 2.0';
                      }
                      if (['0007', '0008', '0009'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi Model A';
                        result.version = result.version + ' - Rev 2.0';
                      }
                      if (['0010'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi Model B+';
                        result.version = result.version + ' - Rev 1.0';
                      }
                      if (['0012'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi Model A+';
                        result.version = result.version + ' - Rev 1.0';
                      }
                      if (['0013'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi Model B+';
                        result.version = result.version + ' - Rev 1.2';
                      }
                      if (['0015'].indexOf(result.version) >= 0) {
                        result.model = result.model + ' - Pi Model A+';
                        result.version = result.version + ' - Rev 1.1';
                      }
                      if (result.model.indexOf('Pi') !== -1 && result.version) {  // Pi, Pi Zero
                        result.manufacturer = 'Raspberry Pi Foundation';
                      }
                    }
                  }
                  if (callback) { callback(result); }
                  resolve(result);
                });
              } else {
                if (callback) { callback(result); }
                resolve(result);
              }
            });
          } else {
            if (callback) { callback(result); }
            resolve(result);
          }
        });
      }
      if (_darwin) {
        exec('ioreg -c IOPlatformExpertDevice -d 2', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().replace(/[<>"]/g, '').split('\n');
            result.manufacturer = util.getValue(lines, 'manufacturer', '=', true);
            result.model = util.getValue(lines, 'model', '=', true);
            result.version = util.getValue(lines, 'version', '=', true);
            result.serial = util.getValue(lines, 'ioplatformserialnumber', '=', true);
            result.uuid = util.getValue(lines, 'ioplatformuuid', '=', true);
            result.sku = util.getValue(lines, 'board-id', '=', true);
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_windows) {
        try {
          util.wmic('csproduct get /value').then((stdout, error) => {
            if (!error) {
              // let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0)[0].trim().split(/\s\s+/);
              let lines = stdout.split('\r\n');
              result.manufacturer = util.getValue(lines, 'vendor', '=');
              result.model = util.getValue(lines, 'name', '=');
              result.version = util.getValue(lines, 'version', '=');
              result.serial = util.getValue(lines, 'identifyingnumber', '=');
              result.uuid = util.getValue(lines, 'uuid', '=');
              util.wmic('/namespace:\\\\root\\wmi path MS_SystemInformation get /value').then((stdout, error) => {
                if (!error) {
                  let lines = stdout.split('\r\n');
                  result.sku = util.getValue(lines, 'systemsku', '=');
                }
                if (callback) { callback(result); }
                resolve(result);
              });
            } else {
              if (callback) { callback(result); }
              resolve(result);
            }
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.system = system;

function bios(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        vendor: '',
        version: '',
        releaseDate: '',
        revision: '',
      };
      let cmd = '';
      if (_linux || _freebsd || _openbsd || _netbsd) {
        if (process.arch === 'arm') {
          cmd = 'cat /proc/cpuinfo | grep Serial';

        } else {
          cmd = 'export LC_ALL=C; dmidecode --type 0 2>/dev/null; unset LC_ALL';
        }
        exec(cmd, function (error, stdout) {
          let lines = stdout.toString().split('\n');
          result.vendor = util.getValue(lines, 'Vendor');
          result.version = util.getValue(lines, 'Version');
          let datetime = util.getValue(lines, 'Release Date');
          result.releaseDate = util.parseDateTime(datetime).date;
          result.revision = util.getValue(lines, 'BIOS Revision');
          // Non-Root values
          const cmd = `echo -n "bios_date: "; cat /sys/devices/virtual/dmi/id/bios_date 2>/dev/null; echo;
            echo -n "bios_vendor: "; cat /sys/devices/virtual/dmi/id/bios_vendor 2>/dev/null; echo;
            echo -n "bios_version: "; cat /sys/devices/virtual/dmi/id/bios_version 2>/dev/null; echo;`;
          try {
            lines = execSync(cmd).toString().split('\n');
            result.vendor = !result.vendor ? util.getValue(lines, 'bios_vendor') : result.vendor;
            result.version = !result.version ? util.getValue(lines, 'bios_version') : result.version;
            datetime = util.getValue(lines, 'bios_date');
            result.releaseDate = !result.releaseDate ? util.parseDateTime(datetime).date : result.releaseDate;
          } catch (e) {
            util.noop();
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_darwin) {
        result.vendor = 'Apple Inc.';
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_sunos) {
        result.vendor = 'Sun Microsystems';
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_windows) {
        try {
          util.wmic('bios get /value').then((stdout, error) => {
            if (!error) {
              let lines = stdout.toString().split('\r\n');
              const description = util.getValue(lines, 'description', '=');
              if (description.indexOf(' Version ') !== -1) {
                // ... Phoenix ROM BIOS PLUS Version 1.10 A04
                result.vendor = description.split(' Version ')[0].trim();
                result.version = description.split(' Version ')[1].trim();
              } else if (description.indexOf(' Ver: ') !== -1) {
                // ... BIOS Date: 06/27/16 17:50:16 Ver: 1.4.5
                result.vendor = util.getValue(lines, 'manufacturer', '=');
                result.version = description.split(' Ver: ')[1].trim();
              } else {
                result.vendor = util.getValue(lines, 'manufacturer', '=');
                result.version = util.getValue(lines, 'version', '=');
              }
              result.releaseDate = util.getValue(lines, 'releasedate', '=');
              if (result.releaseDate.length >= 10) {
                result.releaseDate = result.releaseDate.substr(0, 4) + '-' + result.releaseDate.substr(4, 2) + '-' + result.releaseDate.substr(6, 2);
              }
              result.revision = util.getValue(lines, 'buildnumber', '=');
            }

            if (callback) { callback(result); }
            resolve(result);
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.bios = bios;

function baseboard(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        manufacturer: '',
        model: '',
        version: '',
        serial: '-',
        assetTag: '-',
      };
      let cmd = '';
      if (_linux || _freebsd || _openbsd || _netbsd) {
        if (process.arch === 'arm') {
          cmd = 'cat /proc/cpuinfo | grep Serial';
          // 'BCM2709', 'BCM2835', 'BCM2708' -->
        } else {
          cmd = 'export LC_ALL=C; dmidecode -t 2 2>/dev/null; unset LC_ALL';
        }
        exec(cmd, function (error, stdout) {
          let lines = stdout.toString().split('\n');
          result.manufacturer = util.getValue(lines, 'Manufacturer');
          result.model = util.getValue(lines, 'Product Name');
          result.version = util.getValue(lines, 'Version');
          result.serial = util.getValue(lines, 'Serial Number');
          result.assetTag = util.getValue(lines, 'Asset Tag');
          // Non-Root values
          const cmd = `echo -n "board_asset_tag: "; cat /sys/devices/virtual/dmi/id/board_asset_tag 2>/dev/null; echo;
            echo -n "board_name: "; cat /sys/devices/virtual/dmi/id/board_name 2>/dev/null; echo;
            echo -n "board_serial: "; cat /sys/devices/virtual/dmi/id/board_serial 2>/dev/null; echo;
            echo -n "board_vendor: "; cat /sys/devices/virtual/dmi/id/board_vendor 2>/dev/null; echo;
            echo -n "board_version: "; cat /sys/devices/virtual/dmi/id/board_version 2>/dev/null; echo;`;
          try {
            lines = execSync(cmd).toString().split('\n');
            result.manufacturer = !result.manufacturer ? util.getValue(lines, 'board_vendor') : result.manufacturer;
            result.model = !result.model ? util.getValue(lines, 'board_name') : result.model;
            result.version = !result.version ? util.getValue(lines, 'board_version') : result.version;
            result.serial = !result.serial ? util.getValue(lines, 'board_serial') : result.serial;
            result.assetTag = !result.assetTag ? util.getValue(lines, 'board_asset_tag') : result.assetTag;
          } catch (e) {
            util.noop();
          }
          if (result.serial.toLowerCase().indexOf('o.e.m.') !== -1) result.serial = '-';
          if (result.assetTag.toLowerCase().indexOf('o.e.m.') !== -1) result.assetTag = '-';

          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_darwin) {
        exec('ioreg -c IOPlatformExpertDevice -d 2', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().replace(/[<>"]/g, '').split('\n');
            result.manufacturer = util.getValue(lines, 'manufacturer', '=', true);
            result.model = util.getValue(lines, 'model', '=', true);
            result.version = util.getValue(lines, 'version', '=', true);
            result.serial = util.getValue(lines, 'ioplatformserialnumber', '=', true);
            result.assetTag = util.getValue(lines, 'board-id', '=', true);
          }

          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_windows) {
        try {
          util.wmic('baseboard get /value').then((stdout, error) => {
            if (!error) {
              let lines = stdout.toString().split('\r\n');

              result.manufacturer = util.getValue(lines, 'manufacturer', '=');
              result.model = util.getValue(lines, 'model', '=');
              if (!result.model) {
                result.model = util.getValue(lines, 'product', '=');
              }
              result.version = util.getValue(lines, 'version', '=');
              result.serial = util.getValue(lines, 'serialnumber', '=');
              result.assetTag = util.getValue(lines, 'partnumber', '=');
              if (!result.assetTag) {
                result.assetTag = util.getValue(lines, 'sku', '=');
              }
            }

            if (callback) { callback(result); }
            resolve(result);
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.baseboard = baseboard;

function chassis(callback) {
  const chassisTypes = ['Other',
    'Unknown',
    'Desktop',
    'Low Profile Desktop',
    'Pizza Box',
    'Mini Tower',
    'Tower',
    'Portable',
    'Laptop',
    'Notebook',
    'Hand Held',
    'Docking Station',
    'All in One',
    'Sub Notebook',
    'Space-Saving',
    'Lunch Box',
    'Main System Chassis',
    'Expansion Chassis',
    'SubChassis',
    'Bus Expansion Chassis',
    'Peripheral Chassis',
    'Storage Chassis',
    'Rack Mount Chassis',
    'Sealed-Case PC',
    'Multi-System Chassis',
    'Compact PCI',
    'Advanced TCA',
    'Blade',
    'Blade Enclosure',
    'Tablet',
    'Concertible',
    'Detachable',
    'IoT Gateway ',
    'Embedded PC',
    'Mini PC',
    'Stick PC',
  ];

  return new Promise((resolve) => {
    process.nextTick(() => {

      let result = {
        manufacturer: '',
        model: '',
        type: '',
        version: '',
        serial: '-',
        assetTag: '-',
        sku: '',
      };
      if (_linux || _freebsd || _openbsd || _netbsd) {
        const cmd = `echo -n "chassis_asset_tag: "; cat /sys/devices/virtual/dmi/id/chassis_asset_tag 2>/dev/null; echo;
            echo -n "chassis_serial: "; cat /sys/devices/virtual/dmi/id/chassis_serial 2>/dev/null; echo;
            echo -n "chassis_type: "; cat /sys/devices/virtual/dmi/id/chassis_type 2>/dev/null; echo;
            echo -n "chassis_vendor: "; cat /sys/devices/virtual/dmi/id/chassis_vendor 2>/dev/null; echo;
            echo -n "chassis_version: "; cat /sys/devices/virtual/dmi/id/chassis_version 2>/dev/null; echo;`;
        exec(cmd, function (error, stdout) {
          let lines = stdout.toString().split('\n');
          result.manufacturer = util.getValue(lines, 'chassis_vendor');
          const ctype = parseInt(util.getValue(lines, 'chassis_type').replace(/\D/g, ''));
          result.type = (ctype && !isNaN(ctype) && ctype < chassisTypes.length) ? chassisTypes[ctype - 1] : '';
          result.version = util.getValue(lines, 'chassis_version');
          result.serial = util.getValue(lines, 'chassis_serial');
          result.assetTag = util.getValue(lines, 'chassis_asset_tag');
          if (result.serial.toLowerCase().indexOf('o.e.m.') !== -1) result.serial = '-';
          if (result.assetTag.toLowerCase().indexOf('o.e.m.') !== -1) result.assetTag = '-';

          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_darwin) {
        exec('ioreg -c IOPlatformExpertDevice -d 2', function (error, stdout) {
          if (!error) {
            let lines = stdout.toString().replace(/[<>"]/g, '').split('\n');
            result.manufacturer = util.getValue(lines, 'manufacturer', '=', true);
            result.model = util.getValue(lines, 'model', '=', true);
            result.version = util.getValue(lines, 'version', '=', true);
            result.serial = util.getValue(lines, 'ioplatformserialnumber', '=', true);
            result.assetTag = util.getValue(lines, 'board-id', '=', true);
          }

          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        if (callback) { callback(result); }
        resolve(result);
      }
      if (_windows) {
        try {
          util.wmic('path Win32_SystemEnclosure get /value').then((stdout, error) => {
            if (!error) {
              let lines = stdout.toString().split('\r\n');

              result.manufacturer = util.getValue(lines, 'manufacturer', '=');
              result.model = util.getValue(lines, 'model', '=');
              const ctype = parseInt(util.getValue(lines, 'ChassisTypes', '=').replace(/\D/g, ''));
              result.type = (ctype && !isNaN(ctype) && ctype < chassisTypes.length) ? chassisTypes[ctype - 1] : '';
              result.version = util.getValue(lines, 'version', '=');
              result.serial = util.getValue(lines, 'serialnumber', '=');
              result.assetTag = util.getValue(lines, 'partnumber', '=');
              result.sku = util.getValue(lines, 'sku', '=');
            }

            if (callback) { callback(result); }
            resolve(result);
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}

exports.chassis = chassis;



/***/ }),

/***/ "./node_modules/systeminformation/lib/users.js":
/*!*****************************************************!*\
  !*** ./node_modules/systeminformation/lib/users.js ***!
  \*****************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// users.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 11. Users/Sessions
// ----------------------------------------------------------------------------------

const exec = __webpack_require__(/*! child_process */ "child_process").exec;
const util = __webpack_require__(/*! ./util */ "./node_modules/systeminformation/lib/util.js");

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
const _sunos = (_platform === 'sunos');

let _winDateFormat = {
  dateFormat: '',
  dateSeperator: '',
  timeFormat: '',
  timeSeperator: '',
  amDesignator: '',
  pmDesignator: ''
};

// --------------------------
// array of users online = sessions

function getWinCulture() {
  return new Promise((resolve) => {
    process.nextTick(() => {
      if (!_winDateFormat.dateFormat) {
        util.powerShell('(get-culture).DateTimeFormat')
          .then(data => {
            let lines = data.toString().split('\r\n');
            _winDateFormat.dateFormat = util.getValue(lines, 'ShortDatePattern', ':');
            _winDateFormat.dateSeperator = util.getValue(lines, 'DateSeparator', ':');
            _winDateFormat.timeFormat = util.getValue(lines, 'ShortTimePattern', ':');
            _winDateFormat.timeSeperator = util.getValue(lines, 'TimeSeparator', ':');
            _winDateFormat.amDesignator = util.getValue(lines, 'AMDesignator', ':');
            _winDateFormat.pmDesignator = util.getValue(lines, 'PMDesignator', ':');

            resolve(_winDateFormat);
          })
          .catch(() => {
            resolve(_winDateFormat);
          });
      } else {
        resolve(_winDateFormat);
      }
    });
  });
}

function parseUsersLinux(lines, phase) {
  let result = [];
  let result_who = [];
  let result_w = {};
  let w_first = true;
  let w_header = [];
  let w_pos = [];
  let who_line = {};

  let is_whopart = true;
  lines.forEach(function (line) {
    if (line === '---') {
      is_whopart = false;
    } else {
      let l = line.replace(/ +/g, ' ').split(' ');

      // who part
      if (is_whopart) {
        result_who.push({
          user: l[0],
          tty: l[1],
          date: l[2],
          time: l[3],
          ip: (l && l.length > 4) ? l[4].replace(/\(/g, '').replace(/\)/g, '') : ''
        });
      } else {
        // w part
        if (w_first) {    // header
          w_header = l;
          w_header.forEach(function (item) {
            w_pos.push(line.indexOf(item));
          });
          w_first = false;
        } else {
          // split by w_pos
          result_w.user = line.substring(w_pos[0], w_pos[1] - 1).trim();
          result_w.tty = line.substring(w_pos[1], w_pos[2] - 1).trim();
          result_w.ip = line.substring(w_pos[2], w_pos[3] - 1).replace(/\(/g, '').replace(/\)/g, '').trim();
          result_w.command = line.substring(w_pos[7], 1000).trim();
          // find corresponding 'who' line
          who_line = result_who.filter(function (obj) {
            return (obj.user.substring(0, 8).trim() === result_w.user && obj.tty === result_w.tty);
          });
          if (who_line.length === 1) {
            result.push({
              user: who_line[0].user,
              tty: who_line[0].tty,
              date: who_line[0].date,
              time: who_line[0].time,
              ip: who_line[0].ip,
              command: result_w.command
            });
          }
        }
      }
    }
  });
  if (result.length === 0 && phase === 2) {
    return result_who;
  } else {
    return result;
  }
}

function parseUsersDarwin(lines) {
  let result = [];
  let result_who = [];
  let result_w = {};
  let who_line = {};

  let is_whopart = true;
  lines.forEach(function (line) {
    if (line === '---') {
      is_whopart = false;
    } else {
      let l = line.replace(/ +/g, ' ').split(' ');

      // who part
      if (is_whopart) {
        result_who.push({
          user: l[0],
          tty: l[1],
          date: ('' + new Date().getFullYear()) + '-' + ('0' + ('JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC'.indexOf(l[2].toUpperCase()) / 3 + 1)).slice(-2) + '-' + ('0' + l[3]).slice(-2),
          time: l[4],
        });
      } else {
        // w part
        // split by w_pos
        result_w.user = l[0];
        result_w.tty = l[1];
        result_w.ip = (l[2] !== '-') ? l[2] : '';
        result_w.command = l.slice(5, 1000).join(' ');
        // find corresponding 'who' line
        who_line = result_who.filter(function (obj) {
          return (obj.user === result_w.user && (obj.tty.substring(3, 1000) === result_w.tty || obj.tty === result_w.tty));
        });
        if (who_line.length === 1) {
          result.push({
            user: who_line[0].user,
            tty: who_line[0].tty,
            date: who_line[0].date,
            time: who_line[0].time,
            ip: result_w.ip,
            command: result_w.command
          });
        }
      }
    }
  });
  return result;
}

function parseUsersWin(lines, culture) {

  let result = [];
  const header = lines[0];
  const headerDelimiter = [];
  if (header) {
    const start = (header[0] === ' ') ? 1 : 0;
    headerDelimiter.push(start - 1);
    let nextSpace = 0;
    for (let i = start + 1; i < header.length; i++) {
      if (header[i] === ' ' && ((header[i - 1] === ' ') || (header[i - 1] === '.'))) {
        nextSpace = i;
      } else {
        if (nextSpace) {
          headerDelimiter.push(nextSpace);
          nextSpace = 0;
        }
      }
    }
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const user = lines[i].substring(headerDelimiter[0] + 1, headerDelimiter[1]).trim() || '';
        const tty = lines[i].substring(headerDelimiter[1] + 1, headerDelimiter[2] - 2).trim() || '';
        const dateTime = util.parseDateTime(lines[i].substring(headerDelimiter[5] + 1, 2000).trim(), culture) || '';
        result.push({
          user: user,
          tty: tty,
          date: dateTime.date,
          time: dateTime.time,
          ip: '',
          command: ''
        });
      }
    }
  }
  return result;
}

function users(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];

      // linux
      if (_linux) {
        exec('who --ips; echo "---"; w | tail -n +2', function (error, stdout) {
          if (!error) {
            // lines / split
            let lines = stdout.toString().split('\n');
            result = parseUsersLinux(lines, 1);
            if (result.length === 0) {
              exec('who; echo "---"; w | tail -n +2', function (error, stdout) {
                if (!error) {
                  // lines / split
                  lines = stdout.toString().split('\n');
                  result = parseUsersLinux(lines, 2);
                }
                if (callback) { callback(result); }
                resolve(result);
              });
            } else {
              if (callback) { callback(result); }
              resolve(result);
            }
          } else {
            if (callback) { callback(result); }
            resolve(result);
          }
        });
      }
      if (_freebsd || _openbsd || _netbsd) {
        exec('who; echo "---"; w -ih', function (error, stdout) {
          if (!error) {
            // lines / split
            let lines = stdout.toString().split('\n');
            result = parseUsersDarwin(lines);
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        exec('who; echo "---"; w -h', function (error, stdout) {
          if (!error) {
            // lines / split
            let lines = stdout.toString().split('\n');
            result = parseUsersDarwin(lines);
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }

      if (_darwin) {
        exec('who; echo "---"; w -ih', function (error, stdout) {
          if (!error) {
            // lines / split
            let lines = stdout.toString().split('\n');
            result = parseUsersDarwin(lines);
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_windows) {
        try {
          exec('query user', util.execOptsWin, function (error, stdout) {
            if (stdout) {
              // lines / split
              let lines = stdout.toString().split('\r\n');
              getWinCulture()
                .then(culture => {
                  result = parseUsersWin(lines, culture);
                  if (callback) { callback(result); }
                  resolve(result);
                });
            } else {
              if (callback) { callback(result); }
              resolve(result);
            }
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }

    });
  });
}

exports.users = users;


/***/ }),

/***/ "./node_modules/systeminformation/lib/util.js":
/*!****************************************************!*\
  !*** ./node_modules/systeminformation/lib/util.js ***!
  \****************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// utils.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 0. helper functions
// ----------------------------------------------------------------------------------

const os = __webpack_require__(/*! os */ "os");
const fs = __webpack_require__(/*! fs */ "fs");
const spawn = __webpack_require__(/*! child_process */ "child_process").spawn;
const exec = __webpack_require__(/*! child_process */ "child_process").exec;
const execSync = __webpack_require__(/*! child_process */ "child_process").execSync;
const util = __webpack_require__(/*! util */ "util");

let _platform = process.platform;
const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');
const _freebsd = (_platform === 'freebsd');
const _openbsd = (_platform === 'openbsd');
const _netbsd = (_platform === 'netbsd');
// const _sunos = (_platform === 'sunos');

let _cores = 0;
let wmicPath = '';
let codepage = '';

const execOptsWin = {
  windowsHide: true,
  maxBuffer: 1024 * 20000,
  encoding: 'UTF-8',
  env: util._extend({}, Object({"NODE_ENV":"production"}), { LANG: 'en_US.UTF-8' })
};

function toInt(value) {
  let result = parseInt(value, 10);
  if (isNaN(result)) {
    result = 0;
  }
  return result;
}

function isFunction(functionToCheck) {
  let getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function unique(obj) {
  let uniques = [];
  let stringify = {};
  for (let i = 0; i < obj.length; i++) {
    let keys = Object.keys(obj[i]);
    keys.sort(function (a, b) { return a - b; });
    let str = '';
    for (let j = 0; j < keys.length; j++) {
      str += JSON.stringify(keys[j]);
      str += JSON.stringify(obj[i][keys[j]]);
    }
    if (!{}.hasOwnProperty.call(stringify, str)) {
      uniques.push(obj[i]);
      stringify[str] = true;
    }
  }
  return uniques;
}

function sortByKey(array, keys) {
  return array.sort(function (a, b) {
    let x = '';
    let y = '';
    keys.forEach(function (key) {
      x = x + a[key]; y = y + b[key];
    });
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

function cores() {
  if (_cores === 0) {
    _cores = os.cpus().length;
  }
  return _cores;
}

function getValue(lines, property, separator, trimmed) {
  separator = separator || ':';
  property = property.toLowerCase();
  trimmed = trimmed || false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].toLowerCase().replace(/\t/g, '');
    if (trimmed) {
      line = line.trim();
    }
    if (line.startsWith(property)) {
      const parts = lines[i].split(separator);
      if (parts.length >= 2) {
        parts.shift();
        return parts.join(separator).trim();
      } else {
        return '';
      }
    }
  }
  return '';
}

function decodeEscapeSequence(str, base) {
  base = base || 16;
  return str.replace(/\\x([0-9A-Fa-f]{2})/g, function () {
    return String.fromCharCode(parseInt(arguments[1], base));
  });
}

function detectSplit(str) {
  let seperator = '';
  let part = 0;
  str.split('').forEach(element => {
    if (element >= '0' && element <= '9') {
      if (part === 1) { part++; }
    } else {
      if (part === 0) { part++; }
      if (part === 1) {
        seperator += element;
      }
    }
  });
  return seperator;
}

function parseTime(t, pmDesignator) {
  pmDesignator = pmDesignator || '';
  t = t.toUpperCase();
  let hour = 0;
  let min = 0;
  let splitter = detectSplit(t);
  let parts = t.split(splitter);
  if (parts.length >= 2) {
    if (parts[2]) {
      parts[1] += parts[2];
    }
    let isPM = (parts[1] && (parts[1].toLowerCase().indexOf('pm') > -1) || (parts[1].toLowerCase().indexOf('p.m.') > -1) || (parts[1].toLowerCase().indexOf('p. m.') > -1) || (parts[1].toLowerCase().indexOf('n') > -1) || (parts[1].toLowerCase().indexOf('ch') > -1) || (parts[1].toLowerCase().indexOf('ös') > -1) || (pmDesignator && parts[1].toLowerCase().indexOf(pmDesignator) > -1));
    hour = parseInt(parts[0], 10);
    min = parseInt(parts[1], 10);
    hour = isPM && hour < 12 ? hour + 12 : hour;
    return ('0' + hour).substr(-2) + ':' + ('0' + min).substr(-2);
  }
}

function parseDateTime(dt, culture) {
  const result = {
    date: '',
    time: ''
  };
  culture = culture || {};
  let dateFormat = (culture.dateFormat || '').toLowerCase();
  let timeFormat = (culture.timeFormat || '');
  let pmDesignator = (culture.pmDesignator || '');

  const parts = dt.split(' ');
  if (parts[0]) {
    if (parts[0].indexOf('/') >= 0) {
      // Dateformat: mm/dd/yyyy or dd/mm/yyyy or dd/mm/yy or yyyy/mm/dd
      const dtparts = parts[0].split('/');
      if (dtparts.length === 3) {
        if (dtparts[0].length === 4) {
          // Dateformat: yyyy/mm/dd
          result.date = dtparts[0] + '-' + ('0' + dtparts[1]).substr(-2) + '-' + ('0' + dtparts[2]).substr(-2);
        } else if (dtparts[2].length === 2) {
          if ((dateFormat.indexOf('/d/') > -1 || dateFormat.indexOf('/dd/') > -1)) {
            // Dateformat: mm/dd/yy
            result.date = '20' + dtparts[2] + '-' + ('0' + dtparts[1]).substr(-2) + '-' + ('0' + dtparts[0]).substr(-2);
          } else {
            // Dateformat: dd/mm/yy
            result.date = '20' + dtparts[2] + '-' + ('0' + dtparts[1]).substr(-2) + '-' + ('0' + dtparts[0]).substr(-2);
          }
        } else {
          // Dateformat: mm/dd/yyyy or dd/mm/yyyy
          const isEN = ((dt.toLowerCase().indexOf('pm') > -1) || (dt.toLowerCase().indexOf('p.m.') > -1) || (dt.toLowerCase().indexOf('p. m.') > -1) || (dt.toLowerCase().indexOf('am') > -1) || (dt.toLowerCase().indexOf('a.m.') > -1) || (dt.toLowerCase().indexOf('a. m.') > -1));
          if ((isEN || dateFormat.indexOf('/d/') > -1 || dateFormat.indexOf('/dd/') > -1) && dateFormat.indexOf('dd/') !== 0) {
            // Dateformat: mm/dd/yyyy
            result.date = dtparts[2] + '-' + ('0' + dtparts[0]).substr(-2) + '-' + ('0' + dtparts[1]).substr(-2);
          } else {
            // Dateformat: dd/mm/yyyy
            result.date = dtparts[2] + '-' + ('0' + dtparts[1]).substr(-2) + '-' + ('0' + dtparts[0]).substr(-2);
          }
        }
      }
    }
    if (parts[0].indexOf('.') >= 0) {
      const dtparts = parts[0].split('.');
      if (dtparts.length === 3) {
        if (dateFormat.indexOf('.d.') > -1 || dateFormat.indexOf('.dd.') > -1) {
          // Dateformat: mm.dd.yyyy
          result.date = dtparts[2] + '-' + ('0' + dtparts[0]).substr(-2) + '-' + ('0' + dtparts[1]).substr(-2);
        } else {
          // Dateformat: dd.mm.yyyy
          result.date = dtparts[2] + '-' + ('0' + dtparts[1]).substr(-2) + '-' + ('0' + dtparts[0]).substr(-2);
        }
      }
    }
    if (parts[0].indexOf('-') >= 0) {
      // Dateformat: yyyy-mm-dd
      const dtparts = parts[0].split('-');
      if (dtparts.length === 3) {
        result.date = dtparts[0] + '-' + ('0' + dtparts[1]).substr(-2) + '-' + ('0' + dtparts[2]).substr(-2);
      }
    }
  }
  if (parts[1]) {
    parts.shift();
    let time = parts.join(' ');
    result.time = parseTime(time, pmDesignator);
  }
  return result;
}

function parseHead(head, rights) {
  let space = (rights > 0);
  let count = 1;
  let from = 0;
  let to = 0;
  let result = [];
  for (let i = 0; i < head.length; i++) {
    if (count <= rights) {
      // if (head[i] === ' ' && !space) {
      if (/\s/.test(head[i]) && !space) {
        to = i - 1;
        result.push({
          from: from,
          to: to + 1,
          cap: head.substring(from, to + 1)
        });
        from = to + 2;
        count++;
      }
      space = head[i] === ' ';
    } else {
      if (!/\s/.test(head[i]) && space) {
        to = i - 1;
        if (from < to) {
          result.push({
            from: from,
            to: to,
            cap: head.substring(from, to)
          });
        }
        from = to + 1;
        count++;
      }
      space = head[i] === ' ';
    }
  }
  to = 1000;
  result.push({
    from: from,
    to: to,
    cap: head.substring(from, to)
  });
  let len = result.length;
  for (var i = 0; i < len; i++) {
    if (result[i].cap.replace(/\s/g, '').length === 0) {
      if (i + 1 < len) {
        result[i].to = result[i + 1].to;
        result[i].cap = result[i].cap + result[i + 1].cap;
        result.splice(i + 1, 1);
        len = len - 1;
      }
    }
  }
  return result;
}

function findObjectByKey(array, key, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][key] === value) {
      return i;
    }
  }
  return -1;
}

function getWmic() {
  if (os.type() === 'Windows_NT' && !wmicPath) {
    wmicPath = Object({"NODE_ENV":"production"}).WINDIR + '\\system32\\wbem\\wmic.exe';
    if (!fs.existsSync(wmicPath)) {
      try {
        const wmicPathArray = execSync('WHERE WMIC').toString().split('\r\n');
        if (wmicPathArray && wmicPathArray.length) {
          wmicPath = wmicPathArray[0];
        } else {
          wmicPath = 'wmic';
        }
      } catch (e) {
        wmicPath = 'wmic';
      }
    }
  }
  return wmicPath;
}

function wmic(command, options) {
  options = options || execOptsWin;
  return new Promise((resolve) => {
    process.nextTick(() => {
      try {
        exec(getWmic() + ' ' + command, options, function (error, stdout) {
          resolve(stdout, error);
        }).stdin.end();
      } catch (e) {
        resolve('', e);
      }
    });
  });
}

function getVboxmanage() {
  return _windows ? Object({"NODE_ENV":"production"}).VBOX_INSTALL_PATH || Object({"NODE_ENV":"production"}).VBOX_MSI_INSTALL_PATH + '\\VBoxManage.exe' + '" ' : 'vboxmanage';
}

function powerShell(cmd) {

  let result = '';

  return new Promise((resolve) => {
    process.nextTick(() => {
      try {
        const child = spawn('powershell.exe', ['-NoLogo', '-InputFormat', 'Text', '-NoExit', '-ExecutionPolicy', 'Unrestricted', '-Command', '-'], {
          stdio: 'pipe'
        });

        if (child && !child.pid) {
          child.on('error', function () {
            resolve(result);
          });
        }
        if (child && child.pid) {
          child.stdout.on('data', function (data) {
            result = result + data.toString('utf8');
          });
          child.stderr.on('data', function () {
            child.kill();
            resolve(result);
          });
          child.on('close', function () {
            child.kill();
            resolve(result);
          });
          child.on('error', function () {
            child.kill();
            resolve(result);
          });
          try {
            child.stdin.write(cmd + os.EOL);
            child.stdin.write('exit' + os.EOL);
            child.stdin.end();
          } catch (e) {
            child.kill();
            resolve(result);
          }
        } else {
          resolve(result);
        }
      } catch (e) {
        resolve(result);
      }
    });
  });
}

function getCodepage() {
  if (_windows) {
    if (!codepage) {
      try {
        const stdout = execSync('chcp');
        const lines = stdout.toString().split('\r\n');
        const parts = lines[0].split(':');
        codepage = parts.length > 1 ? parts[1].replace('.', '') : '';
      } catch (err) {
        codepage = '437';
      }
    }
    return codepage;
  }
  if (_linux || _darwin || _freebsd || _openbsd || _netbsd) {
    if (!codepage) {
      try {
        const stdout = execSync('echo $LANG');
        const lines = stdout.toString().split('\r\n');
        const parts = lines[0].split('.');
        codepage = parts.length > 1 ? parts[1].trim() : '';
        if (!codepage) {
          codepage = 'UTF-8';
        }
      } catch (err) {
        codepage = 'UTF-8';
      }
    }
    return codepage;
  }
}

function isRaspberry() {
  const PI_MODEL_NO = [
    'BCM2708',
    'BCM2709',
    'BCM2710',
    'BCM2835',
    'BCM2837B0'
  ];
  let cpuinfo = [];
  try {
    cpuinfo = fs.readFileSync('/proc/cpuinfo', { encoding: 'utf8' }).split('\n');
  } catch (e) {
    return false;
  }
  const hardware = getValue(cpuinfo, 'hardware');
  return (hardware && PI_MODEL_NO.indexOf(hardware) > -1);
}

function isRaspbian() {
  let osrelease = [];
  try {
    osrelease = fs.readFileSync('/etc/os-release', { encoding: 'utf8' }).split('\n');
  } catch (e) {
    return false;
  }
  const id = getValue(osrelease, 'id');
  return (id && id.indexOf('raspbian') > -1);
}

function execWin(cmd, opts, callback) {
  if (!callback) {
    callback = opts;
    opts = execOptsWin;
  }
  let newCmd = 'chcp 65001 > nul && cmd /C ' + cmd + ' && chcp ' + codepage + ' > nul';
  exec(newCmd, opts, function (error, stdout) {
    callback(error, stdout);
  });
}

function darwinXcodeExists() {
  const cmdLineToolsExists = fs.existsSync('/Library/Developer/CommandLineTools/usr/bin/');
  const xcodeAppExists = fs.existsSync('/Applications/Xcode.app/Contents/Developer/Tools');
  const xcodeExists = fs.existsSync('/Library/Developer/Xcode/');
  return (cmdLineToolsExists || xcodeExists || xcodeAppExists);
}

function nanoSeconds() {
  const time = process.hrtime();
  if (!Array.isArray(time) || time.length !== 2) {
    return 0;
  }
  return +time[0] * 1e9 + +time[1];
}

function countUniqueLines(lines, startingWith) {
  startingWith = startingWith || '';
  const uniqueLines = [];
  lines.forEach(line => {
    if (line.startsWith(startingWith)) {
      if (uniqueLines.indexOf(line) === -1) {
        uniqueLines.push(line);
      }
    }
  });
  return uniqueLines.length;
}

function countLines(lines, startingWith) {
  startingWith = startingWith || '';
  const uniqueLines = [];
  lines.forEach(line => {
    if (line.startsWith(startingWith)) {
      uniqueLines.push(line);
    }
  });
  return uniqueLines.length;
}

function noop() { }

exports.toInt = toInt;
exports.execOptsWin = execOptsWin;
exports.getCodepage = getCodepage;
exports.execWin = execWin;
exports.isFunction = isFunction;
exports.unique = unique;
exports.sortByKey = sortByKey;
exports.cores = cores;
exports.getValue = getValue;
exports.decodeEscapeSequence = decodeEscapeSequence;
exports.parseDateTime = parseDateTime;
exports.parseHead = parseHead;
exports.findObjectByKey = findObjectByKey;
exports.getWmic = getWmic;
exports.wmic = wmic;
exports.darwinXcodeExists = darwinXcodeExists;
exports.getVboxmanage = getVboxmanage;
exports.powerShell = powerShell;
exports.nanoSeconds = nanoSeconds;
exports.countUniqueLines = countUniqueLines;
exports.countLines = countLines;
exports.noop = noop;
exports.isRaspberry = isRaspberry;
exports.isRaspbian = isRaspbian;


/***/ }),

/***/ "./node_modules/systeminformation/lib/virtualbox.js":
/*!**********************************************************!*\
  !*** ./node_modules/systeminformation/lib/virtualbox.js ***!
  \**********************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// virtualbox.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 14. Docker
// ----------------------------------------------------------------------------------

const os = __webpack_require__(/*! os */ "os");
const exec = __webpack_require__(/*! child_process */ "child_process").exec;
const util = __webpack_require__(/*! ./util */ "./node_modules/systeminformation/lib/util.js");

function vboxInfo(callback) {

  // fallback - if only callback is given
  let result = [];
  return new Promise((resolve) => {
    process.nextTick(() => {
      try {
        exec(util.getVboxmanage() + ' list vms --long', function (error, stdout) {
          let parts = (os.EOL + stdout.toString()).split(os.EOL + 'Name:');
          parts.shift();
          parts.forEach(part => {
            const lines = ('Name:' + part).split(os.EOL);
            const state = util.getValue(lines, 'State');
            const running = state.startsWith('running');
            const runningSinceString = running ? state.replace('running (since ', '').replace(')', '').trim() : '';
            let runningSince = 0;
            try {
              if (running) {
                const sinceDateObj = new Date(runningSinceString);
                const offset = sinceDateObj.getTimezoneOffset();
                runningSince = Math.round((Date.now() - Date.parse(sinceDateObj)) / 1000) + offset * 60;
              }
            } catch (e) {
              util.noop();
            }
            const stoppedSinceString = !running ? state.replace('powered off (since', '').replace(')', '').trim() : '';
            let stoppedSince = 0;
            try {
              if (!running) {
                const sinceDateObj = new Date(stoppedSinceString);
                const offset = sinceDateObj.getTimezoneOffset();
                stoppedSince = Math.round((Date.now() - Date.parse(sinceDateObj)) / 1000) + offset * 60;
              }
            } catch (e) {
              util.noop();
            }
            result.push({
              id: util.getValue(lines, 'UUID'),
              name: util.getValue(lines, 'Name'),
              running,
              started: runningSinceString,
              runningSince,
              stopped: stoppedSinceString,
              stoppedSince,
              guestOS: util.getValue(lines, 'Guest OS'),
              hardwareUUID: util.getValue(lines, 'Hardware UUID'),
              memory: parseInt(util.getValue(lines, 'Memory size', '     '), 10),
              vram: parseInt(util.getValue(lines, 'VRAM size'), 10),
              cpus: parseInt(util.getValue(lines, 'Number of CPUs'), 10),
              cpuExepCap: util.getValue(lines, 'CPU exec cap'),
              cpuProfile: util.getValue(lines, 'CPUProfile'),
              chipset: util.getValue(lines, 'Chipset'),
              firmware: util.getValue(lines, 'Firmware'),
              pageFusion: util.getValue(lines, 'Page Fusion') === 'enabled',
              configFile: util.getValue(lines, 'Config file'),
              snapshotFolder: util.getValue(lines, 'Snapshot folder'),
              logFolder: util.getValue(lines, 'Log folder'),
              HPET: util.getValue(lines, 'HPET') === 'enabled',
              PAE: util.getValue(lines, 'PAE') === 'enabled',
              longMode: util.getValue(lines, 'Long Mode') === 'enabled',
              tripleFaultReset: util.getValue(lines, 'Triple Fault Reset') === 'enabled',
              APIC: util.getValue(lines, 'APIC') === 'enabled',
              X2APIC: util.getValue(lines, 'X2APIC') === 'enabled',
              ACPI: util.getValue(lines, 'ACPI') === 'enabled',
              IOAPIC: util.getValue(lines, 'IOAPIC') === 'enabled',
              biosAPICmode: util.getValue(lines, 'BIOS APIC mode'),
              bootMenuMode: util.getValue(lines, 'Boot menu mode'),
              bootDevice1: util.getValue(lines, 'Boot Device 1'),
              bootDevice2: util.getValue(lines, 'Boot Device 2'),
              bootDevice3: util.getValue(lines, 'Boot Device 3'),
              bootDevice4: util.getValue(lines, 'Boot Device 4'),
              timeOffset: util.getValue(lines, 'Time offset'),
              RTC: util.getValue(lines, 'RTC'),
            });
          });

          if (callback) { callback(result); }
          resolve(result);
        });
      } catch (e) {
        if (callback) { callback(result); }
        resolve(result);
      }
    });
  });
}

exports.vboxInfo = vboxInfo;


/***/ }),

/***/ "./node_modules/systeminformation/lib/wifi.js":
/*!****************************************************!*\
  !*** ./node_modules/systeminformation/lib/wifi.js ***!
  \****************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// @ts-check
// ==================================================================================
// wifi.js
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2020
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================
// 9. wifi
// ----------------------------------------------------------------------------------

const os = __webpack_require__(/*! os */ "os");
const exec = __webpack_require__(/*! child_process */ "child_process").exec;
const util = __webpack_require__(/*! ./util */ "./node_modules/systeminformation/lib/util.js");

let _platform = process.platform;

const _linux = (_platform === 'linux');
const _darwin = (_platform === 'darwin');
const _windows = (_platform === 'win32');

function wifiDBFromQuality(quality) {
  return (parseFloat(quality) / 2 - 100);
}

function wifiQualityFromDB(db) {
  const result = 2 * (parseFloat(db) + 100);
  return result <= 100 ? result : 100;
}

function wifiFrequencyFromChannel(channel) {
  const frequencies = {
    1: 2412,
    2: 2417,
    3: 2422,
    4: 2427,
    5: 2432,
    6: 2437,
    7: 2442,
    8: 2447,
    9: 2452,
    10: 2457,
    11: 2462,
    12: 2467,
    13: 2472,
    14: 2484,
    32: 5160,
    34: 5170,
    36: 5180,
    38: 5190,
    40: 5200,
    42: 5210,
    44: 5220,
    46: 5230,
    48: 5240,
    50: 5250,
    52: 5260,
    54: 5270,
    56: 5280,
    58: 5290,
    60: 5300,
    62: 5310,
    64: 5320,
    68: 5340,
    96: 5480,
    100: 5500,
    102: 5510,
    104: 5520,
    106: 5530,
    108: 5540,
    110: 5550,
    112: 5560,
    114: 5570,
    116: 5580,
    118: 5590,
    120: 5600,
    122: 5610,
    124: 5620,
    126: 5630,
    128: 5640,
    132: 5660,
    134: 5670,
    136: 5680,
    138: 5690,
    140: 5700,
    142: 5710,
    144: 5720,
    149: 5745,
    151: 5755,
    153: 5765,
    155: 5775,
    157: 5785,
    159: 5795,
    161: 5805,
    165: 5825,
    169: 5845,
    173: 5865,
    183: 4915,
    184: 4920,
    185: 4925,
    187: 4935,
    188: 4940,
    189: 4945,
    192: 4960,
    196: 4980
  };
  return {}.hasOwnProperty.call(frequencies, channel) ? frequencies[channel] : -1;
}

function wifiNetworks(callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {
      let result = [];
      if (_linux) {
        let cmd = 'nmcli --terse --fields active,ssid,bssid,mode,chan,freq,signal,security,wpa-flags,rsn-flags device wifi list 2>/dev/null';
        exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {

          const parts = stdout.toString().split('ACTIVE:');
          parts.shift();
          parts.forEach(part => {
            part = 'ACTIVE:' + part;
            const lines = part.split(os.EOL);
            const channel = util.getValue(lines, 'CHAN');
            const frequency = util.getValue(lines, 'FREQ').toLowerCase().replace('mhz', '').trim();
            const security = util.getValue(lines, 'SECURITY').replace('(', '').replace(')', '');
            const wpaFlags = util.getValue(lines, 'WPA-FLAGS').replace('(', '').replace(')', '');
            const rsnFlags = util.getValue(lines, 'RSN-FLAGS').replace('(', '').replace(')', '');
            result.push({
              ssid: util.getValue(lines, 'SSID'),
              bssid: util.getValue(lines, 'BSSID'),
              mode: util.getValue(lines, 'MODE'),
              channel: channel ? parseInt(channel, 10) : -1,
              frequency: frequency ? parseInt(frequency, 10) : -1,
              signalLevel: wifiDBFromQuality(util.getValue(lines, 'SIGNAL')),
              quality: parseFloat(util.getValue(lines, 'SIGNAL')),
              security: security && security !== 'none' ? security.split(' ') : [],
              wpaFlags: wpaFlags && wpaFlags !== 'none' ? wpaFlags.split(' ') : [],
              rsnFlags: rsnFlags && rsnFlags !== 'none' ? rsnFlags.split(' ') : []
            });
          });

          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      } else if (_darwin) {
        let cmd = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s';
        exec(cmd, { maxBuffer: 1024 * 20000 }, function (error, stdout) {
          const lines = stdout.toString().split(os.EOL);
          if (lines && lines.length > 1) {
            const parsedhead = util.parseHead(lines[0], 1);
            if (parsedhead.length >= 7) {
              lines.shift();
              lines.forEach(line => {
                if (line.trim()) {
                  const channelStr = line.substring(parsedhead[3].from, parsedhead[3].to).trim();
                  const channel = channelStr ? parseInt(channelStr, 10) : -1;
                  const signalLevel = line.substring(parsedhead[2].from, parsedhead[2].to).trim();
                  const securityAll = line.substring(parsedhead[6].from, 1000).trim().split(' ');
                  let security = [];
                  let wpaFlags = [];
                  securityAll.forEach(securitySingle => {
                    if (securitySingle.indexOf('(') > 0) {
                      const parts = securitySingle.split('(');
                      security.push(parts[0]);
                      wpaFlags = wpaFlags.concat(parts[1].replace(')', '').split(','));
                    }
                  });
                  wpaFlags = Array.from(new Set(wpaFlags));
                  result.push({
                    ssid: line.substring(parsedhead[0].from, parsedhead[0].to).trim(),
                    bssid: line.substring(parsedhead[1].from, parsedhead[1].to).trim(),
                    mode: '',
                    channel,
                    frequency: wifiFrequencyFromChannel(channel),
                    signalLevel: signalLevel ? parseInt(signalLevel, 10) : -1,
                    quality: wifiQualityFromDB(signalLevel),
                    security,
                    wpaFlags,
                    rsnFlags: []
                  });
                }
              });
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      } else if (_windows) {
        let cmd = 'chcp 65001 && netsh wlan show networks mode=Bssid';
        exec(cmd, util.execOptsWin, function (error, stdout) {

          const parts = stdout.toString('utf8').split(os.EOL + os.EOL + 'SSID ');
          parts.shift();

          parts.forEach(part => {
            const lines = part.split(os.EOL);
            if (lines && lines.length >= 8 && lines[0].indexOf(':') >= 0) {
              let bssid = lines[4].split(':');
              bssid.shift();
              bssid = bssid.join(':').trim();
              const channel = lines[7].split(':').pop().trim();
              const quality = lines[5].split(':').pop().trim();
              result.push({
                ssid: lines[0].split(':').pop().trim(),
                bssid,
                mode: '',
                channel: channel ? parseInt(channel, 10) : -1,
                frequency: wifiFrequencyFromChannel(channel),
                signalLevel: wifiDBFromQuality(quality),
                quality: quality ? parseInt(quality, 10) : -1,
                security: [lines[2].split(':').pop().trim()],
                wpaFlags: [lines[3].split(':').pop().trim()],
                rsnFlags: []
              });
            }
          });

          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      } else {
        if (callback) {
          callback(result);
        }
        resolve(result);
      }
    });
  });
}

exports.wifiNetworks = wifiNetworks;


/***/ }),

/***/ "./node_modules/systeminformation/package.json":
/*!*****************************************************!*\
  !*** ./node_modules/systeminformation/package.json ***!
  \*****************************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = {"_from":"systeminformation@4.23.5","_id":"systeminformation@4.23.5","_inBundle":false,"_integrity":"sha512-Zxd1wxN8KigQsDhZupVNAyHnkl+ombejuLpNhJ+LNezMxTLn7nBx9HNAIWUJnhAnSS0ZElQLQ1muqgnwbhgOHg==","_location":"/systeminformation","_phantomChildren":{},"_requested":{"type":"version","registry":true,"raw":"systeminformation@4.23.5","name":"systeminformation","escapedName":"systeminformation","rawSpec":"4.23.5","saveSpec":null,"fetchSpec":"4.23.5"},"_requiredBy":["/"],"_resolved":"https://registry.npmmirror.com/systeminformation/-/systeminformation-4.23.5.tgz","_shasum":"29223266108442bf1ef906df7bf7efb2ae44f219","_spec":"systeminformation@4.23.5","_where":"I:\\哇呼\\pc","author":{"name":"Sebastian Hildebrandt","email":"hildebrandt@plus-innovations.com","url":"https://plus-innovations.com"},"bin":{"systeminformation":"lib/cli.js"},"bugs":{"url":"https://github.com/sebhildebrandt/systeminformation/issues"},"bundleDependencies":false,"deprecated":false,"description":"Simple system and OS information library","devDependencies":{"@types/chai":"^4.1.7","@types/mocha":"^5.2.5","@types/node":"^10.12.18","chai":"^4.2.0","coveralls":"^3.0.2","mocha":"^5.2.0","nyc":"^13.1.0","rimraf":"^2.6.2","source-map-support":"^0.5.9","ts-node":"^7.0.1","typescript":"^3.2.2"},"engines":{"node":">=4.0.0"},"files":["lib/"],"funding":{"type":"Buy me a coffee","url":"https://www.buymeacoffee.com/systeminfo"},"homepage":"https://github.com/sebhildebrandt/systeminformation","keywords":["system information","sysinfo","monitor","monitoring","os","linux","osx","windows","freebsd","openbsd","netbsd","cpu","cpuload","physical cores","logical cores","processor","cores","threads","socket type","memory","file system","fsstats","diskio","block devices","netstats","network","network interfaces","network connections","network stats","iface","processes","users","internet","battery","docker","docker stats","docker processes","graphics","graphic card","graphic controller","gpu","display","smart","disk layout","wifi","wifinetworks","virtual box","virtualbox","vm"],"license":"MIT","main":"./lib/index.js","name":"systeminformation","nyc":{"extension":[".js"],"include":["lib/**"],"exclude":["**/*.d.ts"],"reporter":["html","text"],"all":true},"os":["darwin","linux","win32","freebsd","openbsd","netbsd","sunos"],"repository":{"type":"git","url":"git+https://github.com/sebhildebrandt/systeminformation.git"},"scripts":{"clean":"rimraf dist","compile":"tsc","coverage":"nyc report --reporter=text-lcov","test":"nyc mocha --require ts-node/register --require source-map-support/register  ./test/**/*.test.ts","test-bare":"npm run compile && mocha ./test/**/*.test.js","watch":"tsc -w"},"types":"./lib/index.d.ts","version":"4.23.5"}

/***/ }),

/***/ "./node_modules/tslib/tslib.es6.js":
/*!*****************************************!*\
  !*** ./node_modules/tslib/tslib.es6.js ***!
  \*****************************************/
/*! exports provided: __extends, __assign, __rest, __decorate, __param, __metadata, __awaiter, __generator, __createBinding, __exportStar, __values, __read, __spread, __spreadArrays, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject, __importStar, __importDefault, __classPrivateFieldGet, __classPrivateFieldSet */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["__extends"] = __extends;
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__assign", function() { return __assign; });
/* harmony export (immutable) */ __webpack_exports__["__rest"] = __rest;
/* harmony export (immutable) */ __webpack_exports__["__decorate"] = __decorate;
/* harmony export (immutable) */ __webpack_exports__["__param"] = __param;
/* harmony export (immutable) */ __webpack_exports__["__metadata"] = __metadata;
/* harmony export (immutable) */ __webpack_exports__["__awaiter"] = __awaiter;
/* harmony export (immutable) */ __webpack_exports__["__generator"] = __generator;
/* harmony export (immutable) */ __webpack_exports__["__createBinding"] = __createBinding;
/* harmony export (immutable) */ __webpack_exports__["__exportStar"] = __exportStar;
/* harmony export (immutable) */ __webpack_exports__["__values"] = __values;
/* harmony export (immutable) */ __webpack_exports__["__read"] = __read;
/* harmony export (immutable) */ __webpack_exports__["__spread"] = __spread;
/* harmony export (immutable) */ __webpack_exports__["__spreadArrays"] = __spreadArrays;
/* harmony export (immutable) */ __webpack_exports__["__await"] = __await;
/* harmony export (immutable) */ __webpack_exports__["__asyncGenerator"] = __asyncGenerator;
/* harmony export (immutable) */ __webpack_exports__["__asyncDelegator"] = __asyncDelegator;
/* harmony export (immutable) */ __webpack_exports__["__asyncValues"] = __asyncValues;
/* harmony export (immutable) */ __webpack_exports__["__makeTemplateObject"] = __makeTemplateObject;
/* harmony export (immutable) */ __webpack_exports__["__importStar"] = __importStar;
/* harmony export (immutable) */ __webpack_exports__["__importDefault"] = __importDefault;
/* harmony export (immutable) */ __webpack_exports__["__classPrivateFieldGet"] = __classPrivateFieldGet;
/* harmony export (immutable) */ __webpack_exports__["__classPrivateFieldSet"] = __classPrivateFieldSet;
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __createBinding(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}

function __exportStar(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result.default = mod;
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
}

function __classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
}


/***/ }),

/***/ "./src/main/finger.ts":
/*!****************************!*\
  !*** ./src/main/finger.ts ***!
  \****************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
var md5 = __webpack_require__(/*! md5 */ "./node_modules/md5/md5.js");
var _a = __webpack_require__(/*! os */ "os"), EOL = _a.EOL, endianness = _a.endianness;
var createHash = __webpack_require__(/*! crypto */ "crypto").createHash;
var _b = __webpack_require__(/*! systeminformation */ "./node_modules/systeminformation/lib/index.js"), system = _b.system, bios = _b.bios, baseboard = _b.baseboard, cpu = _b.cpu, mem = _b.mem, osInfo = _b.osInfo, blockDevices = _b.blockDevices;
function generateFingerprint() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _a, manufacturer, model, serial, uuid, _b, vendor, biosVersion, releaseDate, _c, boardManufacturer, boardModel, boardSerial, _d, cpuManufacturer, brand, speedmax, cores, physicalCores, socket, memTotal, _e, platform, arch, devices, hdds, fingerprintSegments, fingerprintString, fingerprintHash;
        return tslib_1.__generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, system()];
                case 1:
                    _a = _f.sent(), manufacturer = _a.manufacturer, model = _a.model, serial = _a.serial, uuid = _a.uuid;
                    return [4 /*yield*/, bios()];
                case 2:
                    _b = _f.sent(), vendor = _b.vendor, biosVersion = _b.version, releaseDate = _b.releaseDate;
                    return [4 /*yield*/, baseboard()];
                case 3:
                    _c = _f.sent(), boardManufacturer = _c.manufacturer, boardModel = _c.model, boardSerial = _c.serial;
                    return [4 /*yield*/, cpu()];
                case 4:
                    _d = _f.sent(), cpuManufacturer = _d.manufacturer, brand = _d.brand, speedmax = _d.speedmax, cores = _d.cores, physicalCores = _d.physicalCores, socket = _d.socket;
                    return [4 /*yield*/, mem()];
                case 5:
                    memTotal = (_f.sent()).total;
                    return [4 /*yield*/, osInfo()];
                case 6:
                    _e = _f.sent(), platform = _e.platform, arch = _e.arch;
                    return [4 /*yield*/, blockDevices()];
                case 7:
                    devices = _f.sent();
                    hdds = devices
                        .filter(function (_a) {
                        var type = _a.type, removable = _a.removable;
                        return type === 'disk' && !removable;
                    })
                        .map(function (_a) {
                        var model = _a.model, serial = _a.serial;
                        return model + serial;
                    });
                    fingerprintSegments = tslib_1.__spread([
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
                        arch
                    ], hdds);
                    fingerprintString = fingerprintSegments.join('');
                    fingerprintHash = createHash('sha512').update(fingerprintString);
                    return [2 /*return*/, md5(fingerprintHash.digest().toString('base64'))];
            }
        });
    });
}
exports.fingerprint = function () {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var finger;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, generateFingerprint()];
                case 1:
                    finger = _a.sent();
                    return [2 /*return*/, finger];
            }
        });
    });
};


/***/ }),

/***/ "./src/main/renderer.ts":
/*!******************************!*\
  !*** ./src/main/renderer.ts ***!
  \******************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var fingerprint = __webpack_require__(/*! ./finger */ "./src/main/finger.ts").fingerprint;
global['electron'] = __webpack_require__(/*! electron */ "electron");
global['finger'] = fingerprint();


/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("crypto");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("electron");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("net");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ })

/******/ });