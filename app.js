import {REAL_APP_URL} from './config.js';
// GitHub Pages is the entrance to the same private application; no parallel demo.
const link=document.querySelector('#open-app');
link.href=REAL_APP_URL;
window.location.replace(REAL_APP_URL);
