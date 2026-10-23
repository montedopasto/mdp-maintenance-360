import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseAccount,tenantId,config,loginRequest} from '../src/auth.js';
test('identity from a different tenant cannot be displayed as a valid session',()=>{assert.equal(chooseAccount({account:{tenantId:'other'}},{tenantId}),null);});
test('redirect identity takes priority; empty account caches do not imply a login',()=>{const account={tenantId,name:'Pessoa'};assert.equal(chooseAccount({account},null),account);assert.equal(chooseAccount(null,null),null);});
test('Office login requests identity only, with the registered return URL and a session cache',()=>{assert.deepEqual(loginRequest.scopes,['openid','profile']);assert.equal(config.auth.redirectUri,'https://montedopasto.github.io/mdp-maintenance-360/');assert.equal(config.cache.cacheLocation,'sessionStorage');});
