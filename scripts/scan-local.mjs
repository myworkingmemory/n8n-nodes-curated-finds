import { analyzePackage, SOURCE_FILE_PATTERNS } from '@n8n/scan-community-package/scanner/scanner.mjs';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const evidence = resolve(root, '.validation');
mkdirSync(evidence, { recursive: true });
const source = await analyzePackage(root, SOURCE_FILE_PATTERNS);
const [archive] = JSON.parse(execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', evidence], { encoding: 'utf8' }));
const unpacked = resolve(evidence, 'package');
rmSync(unpacked, { recursive: true, force: true });
mkdirSync(unpacked);
execFileSync('tar', ['-xzf', resolve(evidence, archive.filename), '-C', unpacked, '--strip-components=1']);
const artifact = await analyzePackage(unpacked, ['package.json', 'dist/**/*.js', 'dist/**/*.json']);
const result = { source, artifact, package: archive.filename, scope: 'Official scanner static analysis of local source and packed artifact. Registry provenance and public-source checks require publication and were not performed.' };
writeFileSync(resolve(evidence, 'scan-local.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (!source.passed || !artifact.passed) process.exitCode = 1;
