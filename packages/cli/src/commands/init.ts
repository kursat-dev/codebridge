import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

interface InitOptions {
    force?: boolean;
}

const DEFAULT_CONFIG = {
    $schema: 'https://corebridge.dev/schema/config.json',
    sourceDir: './src',
    outputDir: './packages',
    domains: ['user', 'project'],
    adapters: ['web', 'mobile'],
    contracts: {
        format: 'openapi',
        version: '3.1.0',
    },
    analysis: {
        include: ['**/*.ts'],
        exclude: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**', '**/dist/**'],
    },
};

export async function initCommand(options: InitOptions): Promise<void> {
    const spinner = ora('Initializing CoreBridge...').start();

    const configPath = path.join(process.cwd(), 'corebridge.config.json');

    try {
        // Check if config already exists
        if (await fs.pathExists(configPath)) {
            if (!options.force) {
                spinner.fail(chalk.red('corebridge.config.json already exists. Use --force to overwrite.'));
                process.exit(1);
            }
        }

        // Write config file
        await fs.writeJson(configPath, DEFAULT_CONFIG, { spaces: 2 });

        spinner.succeed(chalk.green('CoreBridge initialized successfully!'));

        console.log('');
        console.log(chalk.cyan('Created:'));
        console.log(`  ${chalk.dim('•')} corebridge.config.json`);
        console.log('');
        console.log(chalk.cyan('Next steps:'));
        console.log(`  ${chalk.dim('1.')} Edit corebridge.config.json to match your project structure`);
        console.log(`  ${chalk.dim('2.')} Run ${chalk.bold('corebridge analyze')} to scan your project`);
        console.log(`  ${chalk.dim('3.')} Run ${chalk.bold('corebridge generate')} to create packages`);
        console.log('');
    } catch (error) {
        spinner.fail(chalk.red('Failed to initialize CoreBridge'));
        console.error(error);
        process.exit(1);
    }
}
