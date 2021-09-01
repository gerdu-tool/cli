#!/usr/bin/env node --enable-source-maps
/* eslint-disable no-console */
// @flow
import program from '@app/app';

program(process.argv).catch((err: Error) => console.log('Errror:', err));
