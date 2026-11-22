const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const vm = require('node:vm');
const source = readFileSync('website-redesign/home-metrics.js', 'utf8');
const DAY = 86400000;

function run({stored = {}, now = 1800000000000, chains = {chains:[{id:1, chainType:'EVM', mainnet:true},{id:1, chainType:'EVM', mainnet:true},{id:2, chainType:'EVM', mainnet:false}]}, uptime = {included:[{type:'status_page_resource',attributes:{public_name:'api.delora.build/health',availability:1,status_history:Array(90).fill({})}}]}} = {}) {
 const values = new Map(Object.entries(stored));
 const calls = [];
 const label = {textContent:''};
 const article = {querySelector: s => s === '.performance-detail p' ? label : null};
 const element = id => ({id,textContent:'',attrs:{},closest:()=>article,setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]}});
 const els = {'home-chain-count':element('home-chain-count'),'home-uptime':element('home-uptime'),'pricing-network-count':element('pricing-network-count')};
 class MockDate extends Date { static now() { return now; } }
 const context = {document:{getElementById:id=>els[id] || null,addEventListener(){},hidden:false},window:{addEventListener(){}},localStorage:{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)},fetch:async url=>{calls.push(url);const value=url.includes('/v1/chains')?chains:uptime;if(value instanceof Error)throw value;return {ok:true,json:async()=>value}},Date:MockDate,AbortController,setTimeout,clearTimeout,setInterval(){},console};
 vm.runInNewContext(source, context);
 return {els,label,calls,values};
}
const done = () => new Promise(resolve => setImmediate(resolve));

test('loads each live source, deduplicates chains and labels the monitor', async () => {
 const x=run();await done();assert.equal(x.els['home-chain-count'].textContent,'1');assert.equal(x.els['pricing-network-count'].textContent,'1');assert.equal(x.els['home-uptime'].textContent,'100%');assert.equal(x.label.textContent,'API health uptime · 90 days');assert.equal(x.calls.length,2);
});
test('reuses a fresh daily cache without requests', async () => {
 const now=1800000000000, key='delora-site-live-metrics-v1';
 const item={lastAttempt:now-1000,data:{value:5,updatedAt:now-1000}};
 const x=run({now,stored:{[key]:JSON.stringify({chains:item})}});await done();assert.equal(x.els['home-chain-count'].textContent,'5');assert.equal(x.calls.filter(u=>u.includes('/v1/chains')).length,0);
});
test('does not show expired cached values if a source fails', async () => {
 const now=1800000000000,key='delora-site-live-metrics-v1';
 const x=run({now,stored:{[key]:JSON.stringify({chains:{lastAttempt:now-DAY-1,data:{value:30,updatedAt:now-DAY-1}}})},chains:new Error('offline')});await done();assert.equal(x.els['home-chain-count'].textContent,'—');assert.equal(x.els['pricing-network-count'].textContent,'Supported');assert.equal(x.els['home-uptime'].textContent,'100%');
});
test('rejects malformed data and never rounds less than 100% to 100%', async () => {
 const x=run({chains:{chains:[{id:1,chainType:'EVM'}]},uptime:{included:[{type:'status_page_resource',attributes:{public_name:'api.delora.build/health',availability:0.99999999,status_history:[{}]}}]}});await done();assert.equal(x.els['home-chain-count'].textContent,'—');assert.equal(x.els['home-uptime'].textContent,'99.999%');
});
