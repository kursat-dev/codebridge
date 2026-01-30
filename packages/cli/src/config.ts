import fs from 'fs-extra';
import path from 'path';

export interface CoreBridgeConfig {
    $schema?: string;
    sourceDir: string;
    outputDir: string;
    domains: string[];
    adapters: string[];
    contracts: {
        format: 'openapi' | 'graphql';
        version: string;
    };
    analysis: {
        include: string[];
        exclude: string[];
    };
}

const DEFAULT_CONFIG: CoreBridgeConfig = {
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

export async function loadConfig(configPath?: string): Promise<CoreBridgeConfig> {
    const filePath = path.resolve(process.cwd(), configPath || 'corebridge.config.json');

    if (await fs.pathExists(filePath)) {
        const userConfig = await fs.readJson(filePath);
        return {
            ...DEFAULT_CONFIG,
            ...userConfig,
            contracts: { ...DEFAULT_CONFIG.contracts, ...userConfig.contracts },
            analysis: { ...DEFAULT_CONFIG.analysis, ...userConfig.analysis },
        };
    }

    // Return default config if no file found
    return DEFAULT_CONFIG;
}
