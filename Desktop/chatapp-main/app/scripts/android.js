#!/usr/bin/env node
const args = process.argv.slice(2);
console.log('tripmate-demo: running android script');
if (args.length) console.log('args:', args.join(' '));
// simulate build/start
console.log('android: OK');
process.exit(0);
