#!/usr/bin/env node
const args = process.argv.slice(2);
console.log('tripmate-demo: running ios script');
if (args.length) console.log('args:', args.join(' '));
// Try to parse simulator flag if passed as --simulator='Name'
const simArg = args.find(a => a.startsWith('--simulator'));
if (simArg) console.log('simulator:', simArg.split('=')[1] || '(unknown)');
console.log('ios: OK');
process.exit(0);
