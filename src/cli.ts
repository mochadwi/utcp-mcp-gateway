#!/usr/bin/env node
/**
 * CLI 入口
 */

import { loadConfig, validateConfig } from './config.js';
import { GatewayServer } from './server.js';

async function main() {
  try {
    // 加载并验证配置
    const config = loadConfig();
    validateConfig(config);

    // 启动服务器
    const server = new GatewayServer(config);
    await server.run();
  } catch (error) {
    console.error('[Gateway] Error:', error);
    process.exit(1);
  }
}

main();
