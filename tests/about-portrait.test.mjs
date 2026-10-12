import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {profile} from '../src/data/profile.js';
import {homeMarkup} from '../src/pages/home.js';
test('about uses real portrait and native employment content without placeholder',()=>{
 const html=homeMarkup();
 assert(existsSync(new URL('../public'+profile.portrait,import.meta.url)));
 assert(html.includes(profile.portrait));
 assert(!html.includes('PORTRAIT COMING SOON'));
 assert(html.includes('个人简介'));
 assert(html.includes('核心能力'));
 assert(html.includes('北京澜生无限文化传媒有限公司'));
});
