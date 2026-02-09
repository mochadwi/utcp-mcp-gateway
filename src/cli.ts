#!/usr/bin/env node
/**
 * CLI 入口
 */

// Force all console.log to stderr to prevent polluting stdout (which breaks JSON-RPC)
global.console.log = console.error;

import { loadConfig, validateConfig } from './config.js';
import { GatewayServer } from './server.js';

async function main() {
  // 0. 检查帮助参数 (在加载配置前)
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Usage: utcp-mcp-gateway [options]

Options:
  -h, --help      Display this help message

Configuration (via Environment Variables):

  1. HTTP MCP (Remote):
     MCP_1_NAME=context7
     MCP_1_URL=https://mcp.context7.com/mcp
     MCP_1_AUTH_TYPE=bearer
     MCP_1_AUTH_TOKEN=sk-xxx

  2. stdio MCP (Local):
     MCP_2_NAME=filesystem
     MCP_2_COMMAND=npx
     MCP_2_ARGS=-y,@anthropic/mcp-server-filesystem,/path/to/dir
     MCP_2_TRANSPORT=stdio

  3. Custom Header Auth:
     MCP_3_NAME=custom-api
     MCP_3_URL=https://api.example.com
     MCP_3_AUTH_TYPE=custom
     MCP_3_AUTH_KEY=x-ref-api-key
     MCP_3_AUTH_TOKEN=ref-123456

For full documentation, see README.md
`);
    process.exit(0);
  }

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
