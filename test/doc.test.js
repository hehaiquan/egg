'use strict';

const path = require('path');
const findlinks = require('findlinks');
const assert = require('assert');
const runscript = require('runscript');
const utils = require('./utils');
const puppeteer = require('puppeteer');

describe('test/doc.test.js', () => {
  /**
   * This unit test is ONLY working for the latest nodejs version (v18.0.0)
   * or higher version, bcoz on windows, it takes quite a lot of time
   * to generate the whole doc. We only need some of the test cases to check
   * whether the links inside the doc gets fine or not.
   */
  it('should have no broken urls', async () => {

    const mainNodejsVersion = parseInt(process.versions.node.split('.')[0]);

    if (process.platform !== 'win32' && mainNodejsVersion >= 18) {
      const cwd = path.dirname(__dirname);
      const dumi = path.join(cwd, 'node_modules', '.bin', 'dumi');
      await runscript(`cross-env NODE_OPTIONS=--openssl-legacy-provider APP_ROOT=./site ${dumi} build`,
        {
          cwd,
        });
      const app = utils.cluster({
        baseDir: 'apps/docapp',
      });
      app.coverage(false);
      await app.ready();
      const result = await findlinks({ src: app.url, logger: console, puppeteer });
      if (result.fail !== 0) console.log(result);
      assert(result.fail === 0);
      app.close();
    } else {
      console.log('Skip Doc test for this version of nodejs or this platform.');
    }
  }).timeout(10 * 60 * 1000);
});
