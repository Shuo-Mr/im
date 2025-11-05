const { fingerprint } = require('./finger');
global['electron'] = require('electron');
global['finger'] = fingerprint();