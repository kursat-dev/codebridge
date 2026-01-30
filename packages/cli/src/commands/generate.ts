import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig, CoreBridgeConfig } from '../config.js';
import { generateCore } from '../generators/core.js';
import { generateContracts } from '../generators/contracts.js';
import { generateAdapters } from '../generators/adapters.js';

interface GenerateOptions {
    config?: string;
    coreOnly?: boolean;
    contractsOnly?: boolean;
    adaptersOnly?: boolean;
}

export async function generateCommand(options: GenerateOptions): Promise<void> {
    const spinner = ora('Loading configuration...').start();

    try {
        const config = await loadConfig(options.config);
        const outputDir = path.resolve(process.cwd(), config.outputDir);

        // Ensure output directory exists
        await fs.ensureDir(outputDir);

        const generateAll = !options.coreOnly && !options.contractsOnly && !options.adaptersOnly;

        // Generate core package
        if (generateAll || options.coreOnly) {
            spinner.text = 'Generating core package...';
            await generateCore(config, outputDir);
            spinner.succeed(chalk.green('Core package generated'));
            spinner.start();
        }

        // Generate contracts package
        if (generateAll || options.contractsOnly) {
            spinner.text = 'Generating contracts package...';
            await generateContracts(config, outputDir);
            spinner.succeed(chalk.green('Contracts package generated'));
            spinner.start();
        }

        // Generate adapter packages
        if (generateAll || options.adaptersOnly) {
            for (const adapter of config.adapters) {
                spinner.text = `Generating ${adapter} adapter...`;
                await generateAdapters(config, outputDir, adapter);
                spinner.succeed(chalk.green(`${adapter} adapter generated`));
                spinner.start();
            }
        }

        spinner.stop();

        console.log('');
        console.log(chalk.green('✓ Generation complete!'));
        console.log('');
        console.log(chalk.cyan('Generated packages:'));

        if (generateAll || options.coreOnly) {
            console.log(`  ${chalk.dim('•')} ${config.outputDir}/core`);
        }
        if (generateAll || options.contractsOnly) {
            console.log(`  ${chalk.dim('•')} ${config.outputDir}/contracts`);
        }
        if (generateAll || options.adaptersOnly) {
            for (const adapter of config.adapters) {
                console.log(`  ${chalk.dim('•')} ${config.outputDir}/adapter-${adapter}`);
            }
        }

        console.log('');
        console.log(chalk.cyan('Next steps:'));
        console.log(`  ${chalk.dim('1.')} Review generated code in ${config.outputDir}/`);
        console.log(`  ${chalk.dim('2.')} Implement repository interfaces in infrastructure/`);
        console.log(`  ${chalk.dim('3.')} Wire up adapters to your HTTP server`);
        console.log('');
    } catch (error) {
        spinner.fail(chalk.red('Generation failed'));
        console.error(error);
        process.exit(1);
    }
}
