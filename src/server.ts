/**
 * MCP stdio 服务器
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { CodeModeUtcpClient } from '@utcp/code-mode';
import { McpCallTemplateSerializer } from '@utcp/mcp';
import type { Config, McpConfig } from './config.js';
import { LlmFilter } from './llm-filter.js';

export class GatewayServer {
  private server: Server;
  private utcpClient: CodeModeUtcpClient | null = null;
  private llmFilter: LlmFilter;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.llmFilter = new LlmFilter(config.llm, config.filter);

    this.server = new Server(
      { name: 'utcp-gateway', version: '0.1.0' },
      { capabilities: { tools: {} } }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // 列出工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_tools',
            description: '搜索可用的工具（渐进式发现）',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: '搜索查询' },
                limit: { type: 'number', description: '返回数量限制', default: 10 },
              },
              required: ['query'],
            },
          },
          {
            name: 'list_tools',
            description: '列出所有已注册的工具',
            inputSchema: { type: 'object', properties: {} },
          },
          {
            name: 'call_tool',
            description: '调用工具并返回过滤后的结果',
            inputSchema: {
              type: 'object',
              properties: {
                tool_name: { type: 'string', description: '工具名称' },
                arguments: { type: 'object', description: '工具参数' },
                context: { type: 'string', description: '上下文说明' },
              },
              required: ['tool_name'],
            },
          },
          {
            name: 'call_tool_chain',
            description: '执行 TypeScript 代码链',
            inputSchema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: 'TypeScript 代码' },
                timeout: { type: 'number', description: '超时时间(ms)', default: 30000 },
              },
              required: ['code'],
            },
          },
        ],
      };
    });

    // 调用工具
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_tools':
            return await this.searchTools(args?.query as string, args?.limit as number);

          case 'list_tools':
            return await this.listTools();

          case 'call_tool':
            return await this.callTool(
              args?.tool_name as string,
              args?.arguments as Record<string, unknown>,
              args?.context as string
            );

          case 'call_tool_chain':
            return await this.callToolChain(
              args?.code as string,
              args?.timeout as number
            );

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error: ${error}` }],
          isError: true,
        };
      }
    });
  }

  private async getUtcpClient(): Promise<CodeModeUtcpClient> {
    if (!this.utcpClient) {
      this.utcpClient = await CodeModeUtcpClient.create();
      
      // 注册配置的 MCP 服务
      for (const mcp of this.config.mcps) {
        await this.registerMcp(mcp);
      }
    }
    return this.utcpClient;
  }

  private async registerMcp(mcp: McpConfig): Promise<void> {
    const client = await this.getUtcpClient();
    
    const mcpServerConfig = mcp.transport === 'http'
      ? {
          transport: 'http' as const,
          url: mcp.url,
          ...(mcp.authToken && { headers: { Authorization: `Bearer ${mcp.authToken}` } }),
        }
      : {
          transport: 'stdio' as const,
          command: mcp.command!,
          args: mcp.args || [],
        };

    const serializer = new McpCallTemplateSerializer();
    const template = serializer.validateDict({
      name: mcp.name,
      call_template_type: 'mcp',
      config: {
        mcpServers: {
          [mcp.name]: mcpServerConfig,
        },
      },
    });

    await client.registerManual(template);
    console.error(`[Gateway] Registered MCP: ${mcp.name}`);
  }

  private async searchTools(query: string, limit = 10) {
    const client = await this.getUtcpClient();
    const tools = await client.searchTools(query, limit);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(tools.map(t => ({
          name: t.name,
          description: t.description,
        })), null, 2),
      }],
    };
  }

  private async listTools() {
    const client = await this.getUtcpClient();
    const tools = await client.getTools();
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(tools.map(t => t.name), null, 2),
      }],
    };
  }

  private async callTool(
    toolName: string,
    args: Record<string, unknown> = {},
    context?: string
  ) {
    const client = await this.getUtcpClient();
    const result = await client.callTool(toolName, args);
    
    // 转换为字符串
    const content = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    
    // LLM 过滤
    const filtered = await this.llmFilter.filter(content, context || `调用工具 ${toolName}`);
    
    return {
      content: [{ type: 'text', text: filtered }],
    };
  }

  private async callToolChain(code: string, timeout = 30000) {
    const client = await this.getUtcpClient();
    const result = await client.callToolChain(code, timeout);
    
    const content = JSON.stringify(result, null, 2);
    const filtered = await this.llmFilter.filter(content, '代码执行结果');
    
    return {
      content: [{ type: 'text', text: filtered }],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[Gateway] UTCP Gateway started');
  }
}
