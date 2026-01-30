#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { analyzeCommand } from './commands/analyze.js';
import { generateCommand } from './commands/generate.js';
import { version } from './version.js';

const program = new Command();

program
    .name('corebridge')
    .description('Extract platform-agnostic business logic. Generate contracts. Scaffold adapters.')
    .version(version);

// Init command
program
    .command('init')
    .description('Initialize CoreBridge in your project')
    .option('-f, --force', 'Overwrite existing configuration')
    .action(initCommand);

// Analyze command
program
    .command('analyze')
    .description('Analyze your project to identify extractable business logic')
    .option('-c, --config <path>', 'Path to corebridge.config.json', 'corebridge.config.json')
    .option('-v, --verbose', 'Show detailed analysis output')
    .action(analyzeCommand);

// Generate command
program
    .command('generate')
    .description('Generate core, contracts, and adapter packages')
    .option('-c, --config <path>', 'Path to corebridge.config.json', 'corebridge.config.json')
    .option('--core-only', 'Generate only the core package')
    .option('--contracts-only', 'Generate only the contracts package')
    .option('--adapters-only', 'Generate only adapter packages')
    .action(generateCommand);

program.parse();
