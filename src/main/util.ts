/** @format */

import * as path from 'path';
import { app } from 'electron';

export const env = process.env.NODE_ENV || '';
export const dev = !!env.match('development');
export const getAppPath = (...p:any) => path.resolve(app.getAppPath(), ...p);
export const getDistPath = (...p:any) => getAppPath('dist', ...p);
export const getSourcePath = (...p:any) => getDistPath('main', ...p);

export const getExtPluginsPath = (...p:any) => getAppPath(dev ? 'src/ext-plugins' : '..', ...p);



