import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { glob } from 'glob';
import { loadConfig, CoreBridgeConfig } from '../config.js';

interface AnalyzeOptions {
    config?: string;
    verbose?: boolean;
}

interface AnalysisResult {
    totalFiles: number;
    analyzedFiles: number;
    candidates: {
        services: string[];
        models: string[];
        validators: string[];
        utilities: string[];
    };
    warnings: string[];
}

/**
 * Simple pattern-based analysis
 * In a real implementation, this would use TypeScript AST parsing
 */
async function analyzeFile(filePath: string): Promise<{
    type: 'service' | 'model' | 'validator' | 'utility' | 'unknown';
    name: string;
}> {
    const content = await fs.readFile(filePath, 'utf-8');
    const basename = path.basename(filePath, path.extname(filePath));

    // Pattern-based detection (simplified)
    if (
        basename.endsWith('Service') ||
        basename.endsWith('UseCase') ||
        content.includes('async function') && content.includes('Repository')
    ) {
        return { type: 'service', name: basename };
    }

    if (
        basename.endsWith('Model') ||
        basename.endsWith('Entity') ||
        content.includes('interface ') && content.includes('id:')
    ) {
        return { type: 'model', name: basename };
    }

    if (
        basename.endsWith('Validator') ||
        basename.endsWith('Schema') ||
        content.includes('z.object') ||
        content.includes('Joi.object')
    ) {
        return { type: 'validator', name: basename };
    }

    if (
        basename.endsWith('Utils') ||
        basename.endsWith('Helper') ||
        basename.endsWith('Util')
    ) {
        return { type: 'utility', name: basename };
    }

    return { type: 'unknown', name: basename };
}

export async function analyzeCommand(options: AnalyzeOptions): Promise<void> {
    const spinner = ora('Loading configuration...').start();

    try {
        const config = await loadConfig(options.config);
        spinner.text = 'Scanning project files...';

        // Find all TypeScript files
        const files = await glob(config.analysis.include, {
            cwd: process.cwd(),
            ignore: config.analysis.exclude,
            absolute: true,
        });

        spinner.text = `Analyzing ${files.length} files...`;

        const result: AnalysisResult = {
            totalFiles: files.length,
            analyzedFiles: 0,
            candidates: {
                services: [],
                models: [],
                validators: [],
                utilities: [],
            },
            warnings: [],
        };

        for (const file of files) {
            try {
                const analysis = await analyzeFile(file);
                result.analyzedFiles++;

                const relativePath = path.relative(process.cwd(), file);

                switch (analysis.type) {
                    case 'service':
                        result.candidates.services.push(relativePath);
                        break;
                    case 'model':
                        result.candidates.models.push(relativePath);
                        break;
                    case 'validator':
                        result.candidates.validators.push(relativePath);
                        break;
                    case 'utility':
                        result.candidates.utilities.push(relativePath);
                        break;
                }
            } catch (error) {
                result.warnings.push(`Could not analyze: ${file}`);
            }
        }

        spinner.succeed(chalk.green('Analysis complete!'));

        // Print results
        console.log('');
        console.log(chalk.cyan('Analysis Summary:'));
        console.log(`  ${chalk.dim('•')} Total files: ${result.totalFiles}`);
        console.log(`  ${chalk.dim('•')} Analyzed: ${result.analyzedFiles}`);
        console.log('');

        console.log(chalk.cyan('Extraction Candidates:'));
        console.log(`  ${chalk.yellow('Services/Use Cases:')} ${result.candidates.services.length}`);
        if (options.verbose) {
            result.candidates.services.forEach(f => console.log(`    ${chalk.dim('-')} ${f}`));
        }

        console.log(`  ${chalk.yellow('Domain Models:')} ${result.candidates.models.length}`);
        if (options.verbose) {
            result.candidates.models.forEach(f => console.log(`    ${chalk.dim('-')} ${f}`));
        }

        console.log(`  ${chalk.yellow('Validators:')} ${result.candidates.validators.length}`);
        if (options.verbose) {
            result.candidates.validators.forEach(f => console.log(`    ${chalk.dim('-')} ${f}`));
        }

        console.log(`  ${chalk.yellow('Utilities:')} ${result.candidates.utilities.length}`);
        if (options.verbose) {
            result.candidates.utilities.forEach(f => console.log(`    ${chalk.dim('-')} ${f}`));
        }

        console.log('');

        if (result.warnings.length > 0) {
            console.log(chalk.yellow('Warnings:'));
            result.warnings.forEach(w => console.log(`  ${chalk.dim('!')} ${w}`));
            console.log('');
        }

        console.log(chalk.cyan('Next step:'));
        console.log(`  Run ${chalk.bold('corebridge generate')} to create packages`);
        console.log('');
    } catch (error) {
        spinner.fail(chalk.red('Analysis failed'));
        console.error(error);
        process.exit(1);
    }
}
