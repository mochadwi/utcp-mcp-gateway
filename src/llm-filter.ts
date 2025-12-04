/**
 * LLM 智能过滤模块
 */

import OpenAI from 'openai';
import type { LlmConfig, FilterConfig } from './config.js';

export class LlmFilter {
  private client: OpenAI | null = null;
  private config: LlmConfig;
  private filterConfig: FilterConfig;

  constructor(config: LlmConfig, filterConfig: FilterConfig) {
    this.config = config;
    this.filterConfig = filterConfig;

    if (config.apiKey) {
      this.client = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
      });
    }
  }

  /**
   * 过滤响应
   * @param content 原始内容
   * @param purpose 用户的请求目的（用于指导摘要方向）
   */
  async filter(content: string, purpose?: string): Promise<string> {
    // 如果未启用过滤或没有 API Key，使用截断
    if (!this.filterConfig.enabled || !this.client) {
      return this.truncate(content);
    }

    // 如果强制过滤，跳过长度检查，直接使用 LLM 摘要
    if (this.filterConfig.forceLlmFilter) {
      return this.summarize(content, purpose);
    }

    // 如果内容较短，直接返回
    if (content.length <= this.filterConfig.maxResponseChars) {
      return content;
    }

    // 如果内容低于摘要阈值，使用截断
    if (content.length < this.filterConfig.summarizeThreshold) {
      return this.truncate(content);
    }

    // 使用 LLM 智能摘要
    return this.summarize(content, purpose);
  }

  /**
   * 使用 LLM 智能摘要
   */
  private async summarize(content: string, purpose?: string): Promise<string> {
    if (!this.client) {
      return this.truncate(content);
    }

    // 预截断到 LLM 可处理的范围（120k tokens ≈ 200k 字符，留余量给 system prompt）
    const maxLlmInput = 200000;
    const truncatedContent = content.length > maxLlmInput
      ? content.slice(0, maxLlmInput) + '\n\n[内容已截断用于摘要，原始长度: ' + content.length + ' 字符]'
      : content;

    try {
      const systemPrompt = purpose
        ? `你是一个智能信息提取助手。用户正在进行以下任务：

【用户目的】${purpose}

请根据用户的目的，从下面的内容中提取最相关的信息。

要求：
1. 只保留与用户目的直接相关的信息
2. 输出不超过 ${this.filterConfig.maxResponseChars} 字符
3. 如果原始是 JSON，保持关键字段结构（id, name, libraryId 等）
4. 直接输出结果，不要解释`
        : `你是一个专业的信息提取助手。请将以下内容精简为不超过 ${this.filterConfig.maxResponseChars} 字符的摘要。

要求：
1. 保留最关键的信息
2. 如果原始内容是 JSON，请输出精简后的 JSON 结构
3. 保持关键字段名称不变（如 id, name, libraryId 等）
4. 只输出摘要内容，不要解释`;

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: truncatedContent },
        ],
        max_tokens: Math.ceil(this.filterConfig.maxResponseChars / 2),
        temperature: 0.3,
      });

      const summary = response.choices[0]?.message?.content || '';
      return summary || this.truncate(content);
    } catch (error) {
      console.error('[LLM Filter] 摘要失败，使用截断:', error);
      return this.truncate(content);
    }
  }

  /**
   * 截断内容
   */
  private truncate(content: string): string {
    if (content.length <= this.filterConfig.maxResponseChars) {
      return content;
    }
    return content.slice(0, this.filterConfig.maxResponseChars) + '\n\n[截断，原始长度: ' + content.length + ' 字符]';
  }
}
