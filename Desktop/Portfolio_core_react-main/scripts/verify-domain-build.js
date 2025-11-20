import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const cnamePath = join(process.cwd(), 'dist', 'CNAME');

if (!existsSync(cnamePath)) {
  console.warn('⚠️  dist/CNAME missing. Creating it with shubhtiwari.xyz');
  writeFileSync(cnamePath, 'shubhtiwari.xyz\n', 'utf8');
}

const content = readFileSync(cnamePath, 'utf8').trim();
if (content === 'shubhtiwari.xyz') {
  console.log('✅ CNAME present and correct for shubhtiwari.xyz');
  process.exit(0);
} else {
  console.error(`❌ Unexpected CNAME content: "${content}"`);
  process.exit(1);
}
