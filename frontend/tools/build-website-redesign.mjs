import { cp, mkdir, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'website-redesign');
const target = resolve(root, 'dist/frontend/browser');
await mkdir(target, { recursive: true });
if ((await readdir(target)).length) throw new Error('Refusing to overwrite a non-empty build directory');
await cp(source, target, { recursive: true });
console.log('Website redesign copied to dist/frontend/browser');
