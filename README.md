# utcp-mcp-gateway

<p align="center">
  <strong>🚀 Save 90%+ Token Cost with Smart MCP Proxy</strong>
</p>

<p align="center">
  <a href="#english">English</a> | <a href="#中文">中文</a>
</p>

---

<a name="english"></a>

## What is this?

**The Problem:** MCP tools often return huge responses (10,000+ chars), wasting your LLM tokens.

**The Solution:** `utcp-mcp-gateway` acts as a smart proxy that:
1. Connects to ANY MCP server (HTTP or stdio)
2. Filters responses with LLM summarization
3. Returns only what matters (saving 90%+ tokens!)

```
Your AI  →  utcp-mcp-gateway  →  Any MCP Server
              ↓
         LLM Filter (97% smaller responses!)
```

## Quick Start

**Zero config files!** Just add to Claude Desktop:

```json
{
  "mcpServers": {
    "gateway": {
      "command": "npx",
      "args": ["-y", "utcp-mcp-gateway"],
      "env": {
        "MCP_URL": "https://mcp.context7.com/mcp",
        "MCP_NAME": "context7",
        "LLM_API_KEY": "sk-xxx"
      }
    }
  }
}
```

That's it! Your AI now has access to Context7 with smart filtering.

## Why Code Mode?

> *"LLMs excel at writing code but struggle with tool calls."*  
> — Apple, Cloudflare, Anthropic

**Traditional Tool Calling:**
```
User → LLM → Tool 1 → LLM → Tool 2 → LLM → Tool 3 → Result
       (5 round trips, massive token waste)
```

**Code Mode:**
```
User → LLM writes code → Execute all tools at once → Result
       (1 round trip, 60%+ token savings)
```

### Benchmark Results

| Metric | Traditional | Code Mode | Savings |
|--------|-------------|-----------|---------|
| API Calls | 15+ calls | 1 call | **93%** |
| Token Cost | $26/day | $0.87/day | **$9,536/year** |
| Latency | 5+ round trips | 1 round trip | **80%** |

*Source: [Independent Python Benchmark](https://github.com/imran31415/codemode_python_benchmark)*

## Features

| Feature | Description |
|---------|-------------|
| 🔌 **Universal MCP** | Connect any HTTP or stdio MCP server |
| 🧠 **LLM Filtering** | Intelligent summarization (97% response reduction!) |
| 🔍 **Progressive Discovery** | `search_tools` - find tools without loading all 500 definitions |
| ⚡ **Code Mode** | Execute TypeScript tool chains in one call |
| 🔒 **Secure Sandbox** | Code runs in isolated environment |
| 📦 **Zero Config** | Environment variables only, no config files |

## Token Savings Benchmarks

| MCP Service | Original | Filtered | Savings |
|-------------|----------|----------|---------|
| Context7 (docs) | 10,625 chars | 326 chars | **97%** |
| DeepWiki (wiki) | 3,318 chars | 400 chars | **88%** |

## Configuration

### Single MCP

```bash
MCP_URL=https://mcp.context7.com/mcp
MCP_NAME=context7
```

### Multiple MCPs

```bash
MCP_URLS=https://mcp.context7.com/mcp,https://mcp.deepwiki.com/mcp
MCP_NAMES=context7,deepwiki
```

### LLM Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_API_KEY` | - | OpenAI/OpenRouter API key |
| `LLM_BASE_URL` | OpenAI | Custom endpoint (OpenAI-compatible) |
| `LLM_MODEL` | gpt-4o-mini | Model for summarization |
| `ENABLE_LLM_FILTER` | true | Enable/disable filtering |
| `MAX_RESPONSE_CHARS` | 2000 | Max response length |

## Exposed Tools

| Tool | Description |
|------|-------------|
| `search_tools` | Find tools by keyword (progressive discovery) |
| `list_tools` | List all available tools |
| `call_tool` | Call any tool with smart filtering |
| `call_tool_chain` | Execute TypeScript code chains |

---

<a name="中文"></a>

## 这是什么？

**问题：** MCP 工具经常返回巨大的响应（10,000+ 字符），浪费你的 LLM Token。

**解决方案：** `utcp-mcp-gateway` 作为智能代理：
1. 连接任意 MCP 服务器（HTTP 或 stdio）
2. 用 LLM 智能过滤响应
3. 只返回重要信息（节省 90%+ Token！）

```
你的 AI  →  utcp-mcp-gateway  →  任意 MCP 服务
                ↓
           LLM 过滤（响应缩小 97%！）
```

## 快速开始

**零配置文件！** 直接添加到 Claude Desktop：

```json
{
  "mcpServers": {
    "gateway": {
      "command": "npx",
      "args": ["-y", "utcp-mcp-gateway"],
      "env": {
        "MCP_URL": "https://mcp.context7.com/mcp",
        "MCP_NAME": "context7",
        "LLM_API_KEY": "sk-xxx"
      }
    }
  }
}
```

就这样！你的 AI 现在可以使用带智能过滤的 Context7 了。

## 为什么用 Code Mode？

> *"LLM 擅长写代码，但不擅长调用工具。"*  
> — Apple, Cloudflare, Anthropic

**传统工具调用：**
```
用户 → LLM → 工具1 → LLM → 工具2 → LLM → 工具3 → 结果
       (5 次往返，大量 Token 浪费)
```

**Code Mode：**
```
用户 → LLM 写代码 → 一次执行所有工具 → 结果
       (1 次往返，节省 60%+ Token)
```

### 性能对比

| 指标 | 传统方式 | Code Mode | 节省 |
|------|----------|-----------|------|
| API 调用次数 | 15+ 次 | 1 次 | **93%** |
| Token 成本 | $26/天 | $0.87/天 | **$9,536/年** |
| 延迟 | 5+ 次往返 | 1 次往返 | **80%** |

*数据来源: [独立 Python 基准测试](https://github.com/imran31415/codemode_python_benchmark)*

## 核心功能

| 功能 | 说明 |
|------|------|
| 🔌 **通用 MCP** | 连接任意 HTTP 或 stdio MCP |
| 🧠 **LLM 过滤** | 智能摘要（响应缩小 97%！）|
| 🔍 **渐进式发现** | `search_tools` - 按需搜索，无需加载全部 500 个工具 |
| ⚡ **Code Mode** | 一次调用执行 TypeScript 代码链 |
| 🔒 **安全沙箱** | 代码在隔离环境运行 |
| 📦 **零配置** | 只需环境变量，无需配置文件 |

## Token 节省实测

| MCP 服务 | 原始响应 | 过滤后 | 节省 |
|----------|----------|--------|------|
| Context7 | 10,625 字符 | 326 字符 | **97%** |
| DeepWiki | 3,318 字符 | 400 字符 | **88%** |

## 配置说明

### 单个 MCP

```bash
MCP_URL=https://mcp.context7.com/mcp
MCP_NAME=context7
```

### 多个 MCP

```bash
MCP_URLS=https://mcp.context7.com/mcp,https://mcp.deepwiki.com/mcp
MCP_NAMES=context7,deepwiki
```

### LLM 配置

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `LLM_API_KEY` | - | OpenAI/OpenRouter API 密钥 |
| `LLM_BASE_URL` | OpenAI | 自定义端点（兼容 OpenAI 格式）|
| `LLM_MODEL` | gpt-4o-mini | 摘要用的模型 |
| `ENABLE_LLM_FILTER` | true | 开启/关闭过滤 |
| `MAX_RESPONSE_CHARS` | 2000 | 最大响应长度 |

---

## Credits / 致谢

This project is built on top of amazing open-source work:

- **[UTCP (Universal Tool Calling Protocol)](https://github.com/anthropics/utcp)** - The protocol that makes this possible
- **[@utcp/code-mode](https://www.npmjs.com/package/@utcp/code-mode)** - Code execution capabilities
- **[@utcp/sdk](https://www.npmjs.com/package/@utcp/sdk)** - UTCP SDK
- **[@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)** - MCP SDK by Anthropic

## License

MIT © 2025 reinn
