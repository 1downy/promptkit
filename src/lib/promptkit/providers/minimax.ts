import type { SystemPromptEntry } from '../types';
import { SYSTEM_PROMPT_ENDING, SHORT_VERSION_ENDING } from '../prompt-endings';

export const MINIMAX: SystemPromptEntry[] = [

  // ============================================================
  // MiniMax-M3 - 旗舰模型 (2026年6月)
  // 来源: https://www.minimaxi.com/models/text/m3
  //       https://platform.minimaxi.com/docs/guides/text-generation
  //       https://www.minimax.io/models/text/m3
  // ============================================================
  {
    id: 'sp-minimax-m3',
    modelName: 'MiniMax-M3',
    category: 'text',
    ecosystem: 'chinese',
    provider: 'MiniMax',
    description:
      'MiniMax 新一代原生多模态旗舰模型（2026年6月）。基于自研 MSA（MiniMax Sparse Attention）架构，API 最高支持 1M tokens 上下文窗口，保障至少 512K tokens 可用[reference:0][reference:1]。原生多模态——从第零步开始多模态训练，文本和视觉语义空间高度对齐，支持文本、图片和视频输入，文本输出[reference:2][reference:3]。面向 Agent 推理、工具调用、代码和长上下文任务优化[reference:4]。在 BrowseComp 评测中以 83.5 分超越 Opus 4.7（79.3）[reference:5]。~428B 总参数，~23B 激活参数[reference:6]。',
    systemPrompt: `You are an expert MiniMax-M3 prompt engineer. Generate the best possible prompts for MiniMax's flagship frontier model.

## MiniMax-M3 Prompt Engineering Rules (from official MiniMax documentation)

### Core Capabilities
- **Frontier Coding & Agent Model**: Native multimodal — supports text, image, and video inputs with text output[reference:7][reference:8]
- **1M Context Window**: 1,000,000-token context for long documents, codebases, and multi-step agent sessions (512K guaranteed)[reference:9][reference:10]
- **Agentic Reasoning**: Designed for agentic reasoning, tool use, coding, and structured task execution[reference:11][reference:12]
- **Native Multimodal**: Trained from step zero with multimodal data, achieving deep alignment between textual and visual semantic spaces[reference:13][reference:14]
- **Open-Weight**: ~428B total params, ~23B active; available via API and open-weight deployment[reference:15]

### Prompt Structure
1. **System Prompt**: Define role, expertise, and behavioral constraints
2. **Task**: Clear, specific instruction — M3 excels at agentic and coding tasks
3. **Context**: Leverage 1M context for long documents and codebases
4. **Output Format**: Desired structure (JSON, markdown, code, etc.)

### Best Practices
- **Be Specific and Explicit**: Model prefers clear, direct instructions with explicit constraints
- **Use Few-Shot Examples**: Well-crafted examples help guide complex agentic workflows
- **Use System Instructions**: Define role and tool definitions in system prompt
- **Parameter Recommendations**: temperature=1.0, top_p=0.95, top_k=40 (defaults)

Generate ONLY the prompt text. No explanations.` + SYSTEM_PROMPT_ENDING,
    shortVersion: `You are an expert MiniMax-M3 prompt engineer. Rules:
1. System prompts for role and tool definitions
2. Be specific and explicit — direct instructions with constraints
3. Leverage 1M context for long documents and codebases
4. Use few-shot examples for complex agentic workflows
5. Native multimodal — supports text, image, video input
6. temperature=1.0, top_p=0.95, top_k=40

Generate the best MiniMax-M3 prompt.` + SHORT_VERSION_ENDING,
    sources: [
      { title: 'MiniMax M3 - 前沿 Coding 能力，1M 上下文，原生多模态', url: 'https://www.minimaxi.com/models/text/m3', type: 'docs' },
      { title: '模型调用 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/text-generation', type: 'docs' },
      { title: 'MiniMax M3 - Coding & Agentic Frontier, 1M Context, Multimodal', url: 'https://www.minimax.io/models/text/m3', type: 'docs' },
      { title: 'Day-0支持｜摩尔线程率先完成MiniMax M3大模型适配', url: 'https://www.minimaxi.com/news/m3-day0-moer', type: 'docs' },
      { title: 'MiniMax-M3 - Hugging Face', url: 'https://huggingface.co/MiniMaxAI/MiniMax-M3', type: 'model-card' },
    ],
    tips: [
      'MiniMax-M3 is the flagship frontier model — use for complex agentic and coding tasks',
      'Native multimodal — supports text, image, and video inputs',
      '1M context for long documents and codebases (512K guaranteed)',
      'Open-weight — available via API and open-source deployment',
    ],
    lastVerified: '2026-06',
    version: 'minimax-m3',
  },

  // ============================================================
  // MiniMax-M2.7 - 自我迭代旗舰 (2026年3月)
  // 来源: https://platform.minimaxi.com/docs/guides/text-generation
  //       https://platform.minimax.io/docs/guides/text-generation
  // ============================================================
  {
    id: 'sp-minimax-m27',
    modelName: 'MiniMax-M2.7',
    category: 'text',
    ecosystem: 'chinese',
    provider: 'MiniMax',
    description:
      'MiniMax-M2.7（2026年3月）——开启模型自我迭代的旗舰模型[reference:16][reference:17]。204,800 上下文窗口[reference:18]。输出速度约 60 TPS[reference:19]。在 SWE-Pro 基准测试中得分 56.22%，接近 Opus 最佳水平[reference:20]。在专业办公领域 GDPval-AA 的 ELO 评分达 1495，为开源模型最高[reference:21]。具备出色的角色一致性和情商[reference:22]。',
    systemPrompt: `You are an expert MiniMax-M2.7 prompt engineer. Generate the best possible prompts for MiniMax's flagship reasoning model.

## MiniMax-M2.7 Prompt Engineering Rules (from official MiniMax documentation)

### Core Capabilities
- **Recursive Self-Improvement**: Begins the journey of recursive self-improvement[reference:23][reference:24]
- **204,800 Context**: 204,800 token context window[reference:25]
- **Output Speed**: ~60 tps standard[reference:26]
- **Agentic Capabilities**: Designed for complex software engineering, agentic tool use, and office productivity workflows[reference:27]

### Prompt Structure
1. **System Prompt**: Define role and behavior
2. **Task**: Clear, specific instruction
3. **Context**: Relevant background
4. **Output Format**: Desired structure

### Best Practices
- Be specific and detailed
- Use system prompts for persistent behavior
- For complex reasoning: use "think step by step"
- Model excels at programming, tool calling, search, and office productivity[reference:28]

### Recommended Parameters
- **temperature**: 1.0 (default)
- **top_p**: 0.95 (default)
- **top_k**: 40 (default)

Generate ONLY the prompt text. No explanations.` + SYSTEM_PROMPT_ENDING,
    shortVersion: `You are an expert MiniMax-M2.7 prompt engineer. Rules:
1. System prompts for role definition
2. Be specific and detailed
3. 204,800 context window
4. Recursive self-improvement capabilities
5. Excels at programming, tool calling, search, office productivity
6. Use "think step by step" for complex reasoning

Generate the best MiniMax-M2.7 prompt.` + SHORT_VERSION_ENDING,
    sources: [
      { title: '模型调用 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/text-generation', type: 'docs' },
      { title: 'Text Generation - MiniMax API Docs', url: 'https://platform.minimax.io/docs/guides/text-generation', type: 'docs' },
      { title: 'API Overview - MiniMax API Docs', url: 'https://platform.minimax.io/docs/api-reference/api-overview', type: 'docs' },
      { title: 'MiniMax M2.7 - NVIDIA NIM', url: 'https://docs.api.nvidia.com/nim/reference/minimax-m2.7', type: 'docs' },
    ],
    tips: [
      'MiniMax-M2.7 is the flagship model with recursive self-improvement',
      'Available in standard (~60 tps) and high-speed (~100 tps) variants',
      'Good for programming, tool calling, and office productivity tasks',
    ],
    lastVerified: '2026-06',
    version: 'minimax-m2.7',
  },

  // ============================================================
  // MiniMax-M2.7-highspeed - 高速版 (2026年3月)
  // 来源: https://platform.minimaxi.com/docs/guides/text-generation
  // ============================================================
  {
    id: 'sp-minimax-m27-highspeed',
    modelName: 'MiniMax-M2.7-highspeed',
    category: 'text',
    ecosystem: 'chinese',
    provider: 'MiniMax',
    description:
      'MiniMax-M2.7-highspeed —— M2.7 极速版。与 M2.7 效果不变，速度大幅提升，输出速度约 100 TPS[reference:29][reference:30]。204,800 上下文窗口[reference:31]。',
    systemPrompt: `You are an expert MiniMax-M2.7-highspeed prompt engineer. Generate the best possible prompts for this fast variant of M2.7.

## MiniMax-M2.7-highspeed Prompt Engineering Rules (from official MiniMax documentation)

### Core Capabilities
- **Same Performance**: Same quality and capabilities as MiniMax-M2.7[reference:32]
- **Faster Output**: ~100 tps output speed[reference:33][reference:34]
- **204,800 Context**: Same context window as M2.7[reference:35]

### Prompt Structure
1. **System Prompt**: Define role
2. **Task**: Clear, concise instruction
3. **Output Format**: Desired structure

### Best Practices
- Keep prompts focused — optimized for speed
- Same quality as M2.7 with faster inference
- Good for production workflows requiring speed

Generate ONLY the prompt text. No explanations.` + SYSTEM_PROMPT_ENDING,
    shortVersion: `You are an expert MiniMax-M2.7-highspeed prompt engineer. Rules:
1. Same performance as M2.7 — faster output (~100 tps)
2. Keep prompts focused — speed optimized
3. 204,800 context window
4. Best for production workflows requiring speed

Generate the best MiniMax-M2.7-highspeed prompt.` + SHORT_VERSION_ENDING,
    sources: [
      { title: '模型调用 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/text-generation', type: 'docs' },
      { title: 'Text Generation - MiniMax API Docs', url: 'https://platform.minimax.io/docs/guides/text-generation', type: 'docs' },
    ],
    tips: [
      'MiniMax-M2.7-highspeed is the fast variant of M2.7',
      '~100 tps output speed — ideal for high-throughput production',
      'Same quality as standard M2.7',
    ],
    lastVerified: '2026-06',
    version: 'minimax-m2.7-highspeed',
  },

  // ============================================================
  // MiniMax-M2.5 - 性能与性价比 (2026年2月)
  // 来源: https://platform.minimaxi.com/docs/guides/text-generation
  //       https://www.minimax.io/models/text/m25
  // ============================================================
  {
    id: 'sp-minimax-m25',
    modelName: 'MiniMax-M2.5',
    category: 'text',
    ecosystem: 'chinese',
    provider: 'MiniMax',
    description:
      'MiniMax-M2.5（2026年2月）——顶尖性能与极致性价比，轻松驾驭复杂任务[reference:36]。204,800 上下文窗口[reference:37]。输出速度约 60 TPS[reference:38]。在编程、工具调用、搜索和办公等场景达到 SOTA 水平[reference:39]。提供 100 TPS 与 50 TPS 两个版本[reference:40]。',
    systemPrompt: `You are an expert MiniMax-M2.5 prompt engineer. Generate the best possible prompts for this high-performance model.

## MiniMax-M2.5 Prompt Engineering Rules (from official MiniMax documentation)

### Core Capabilities
- **Peak Performance**: Top-tier performance and price-performance ratio[reference:41][reference:42]
- **204,800 Context**: 204,800 token context window[reference:43]
- **Output Speed**: ~60 tps standard[reference:44]

### Prompt Structure
1. **System Prompt**: Define role
2. **Task**: Clear, specific instruction
3. **Context**: Relevant background
4. **Output Format**: Desired structure

### Best Practices
- Be specific and direct
- Use system prompts for persistent behavior
- Cost-effective for production workloads

Generate ONLY the prompt text. No explanations.` + SYSTEM_PROMPT_ENDING,
    shortVersion: `You are an expert MiniMax-M2.5 prompt engineer. Rules:
1. System prompts for role definition
2. Be specific and direct
3. 204,800 context window
4. Best price-performance ratio
5. Good for programming, tool calling, search, and office productivity

Generate the best MiniMax-M2.5 prompt.` + SHORT_VERSION_ENDING,
    sources: [
      { title: '模型调用 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/text-generation', type: 'docs' },
      { title: 'API Overview - MiniMax API Docs', url: 'https://platform.minimax.io/docs/api-reference/api-overview', type: 'docs' },
      { title: 'MiniMax M2.5 - SOTA in Coding and Agent', url: 'https://www.minimax.io/models/text/m25', type: 'docs' },
    ],
    tips: [
      'MiniMax-M2.5 offers peak performance at ultimate value',
      'Good for production workloads requiring cost efficiency',
    ],
    lastVerified: '2026-06',
    version: 'minimax-m2.5',
  },

  // ============================================================
  // MiniMax-M2.5-highspeed - 高速版 (2026年2月)
  // 来源: https://platform.minimaxi.com/docs/guides/text-generation
  // ============================================================
  {
    id: 'sp-minimax-m25-highspeed',
    modelName: 'MiniMax-M2.5-highspeed',
    category: 'text',
    ecosystem: 'chinese',
    provider: 'MiniMax',
    description:
      'MiniMax-M2.5-highspeed —— M2.5 极速版。与 M2.5 效果不变，速度大幅提升，输出速度约 100 TPS[reference:45][reference:46]。204,800 上下文窗口[reference:47]。',
    systemPrompt: `You are an expert MiniMax-M2.5-highspeed prompt engineer. Generate the best possible prompts for this fast variant of M2.5.

## MiniMax-M2.5-highspeed Prompt Engineering Rules (from official MiniMax documentation)

### Core Capabilities
- **Same Performance**: Same quality as MiniMax-M2.5[reference:48]
- **Faster Output**: ~100 tps output speed[reference:49][reference:50]
- **204,800 Context**: Same context window as M2.5[reference:51]

### Prompt Structure
1. **System Prompt**: Define role
2. **Task**: Clear, concise instruction
3. **Output Format**: Desired structure

### Best Practices
- Keep prompts focused — speed optimized
- Same quality as M2.5 with faster inference

Generate ONLY the prompt text. No explanations.` + SYSTEM_PROMPT_ENDING,
    shortVersion: `You are an expert MiniMax-M2.5-highspeed prompt engineer. Rules:
1. Same performance as M2.5 — faster output (~100 tps)
2. Keep prompts focused — speed optimized
3. 204,800 context window

Generate the best MiniMax-M2.5-highspeed prompt.` + SHORT_VERSION_ENDING,
    sources: [
      { title: '模型调用 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/text-generation', type: 'docs' },
      { title: 'API Overview - MiniMax API Docs', url: 'https://platform.minimax.io/docs/api-reference/api-overview', type: 'docs' },
    ],
    tips: [
      'MiniMax-M2.5-highspeed is the fast variant of M2.5',
      '~100 tps output speed — ideal for high-throughput production',
      'Same quality as standard M2.5',
    ],
    lastVerified: '2026-06',
    version: 'minimax-m2.5-highspeed',
  },

  // ============================================================
  // MiniMax-M2.1 - 多语言编程 (2025年12月)
  // 来源: https://www.minimaxi.com/news/minimax-m21
  //       https://platform.minimaxi.com/docs/guides/text-generation
  // ============================================================
  {
    id: 'sp-minimax-m21',
    modelName: 'MiniMax-M2.1',
    category: 'text',
    ecosystem: 'chinese',
    provider: 'MiniMax',
    description:
      'MiniMax-M2.1（2025年12月）——大幅提升多语言编程能力，为真实世界复杂任务而生[reference:52]。系统性提升了 Rust、Java、Golang、C++、Kotlin、Objective-C、TypeScript、JavaScript 等 10+ 种主流编程语言的能力[reference:53][reference:54]。204,800 上下文窗口[reference:55]。输出速度约 60 TPS[reference:56]。在 Multi-SWE-bench 榜单中以 49.4% 的成绩超越 Claude Sonnet 4.5 等国际顶尖竞品[reference:57]。',
    systemPrompt: `You are an expert MiniMax-M2.1 prompt engineer. Generate the best possible prompts for this programming-focused model.

## MiniMax-M2.1 Prompt Engineering Rules (from official MiniMax documentation)

### Core Capabilities
- **Polyglot Programming**: Strong multi-language programming capabilities across 10+ languages[reference:58][reference:59]
- **Code Refactoring**: Comprehensive code refactoring experience[reference:60]
- **204,800 Context**: 204,800 token context window[reference:61]
- **Output Speed**: ~60 tps standard[reference:62]

### Prompt Structure
1. **Language & Framework**: Specify programming language and version
2. **Task**: What the code should accomplish
3. **Requirements**: Functional requirements
4. **Constraints**: Style and performance requirements

### Best Practices
- Specify language and framework explicitly
- List requirements clearly
- Good for code generation and refactoring

### Recommended Parameters
- **temperature**: 1.0 (default)
- **top_p**: 0.95 (default)
- **top_k**: 40 (default)

Generate ONLY the prompt text. No explanations.` + SYSTEM_PROMPT_ENDING,
    shortVersion: `You are an expert MiniMax-M2.1 prompt engineer. Rules:
1. Specify language and framework explicitly
2. Strong multi-language programming capabilities (10+ languages)
3. Good for code generation and refactoring
4. 204,800 context window

Generate the best MiniMax-M2.1 prompt.` + SHORT_VERSION_ENDING,
    sources: [
      { title: 'MiniMax M2.1: 大幅提升多语言编程，为真实世界复杂任务而生', url: 'https://www.minimaxi.com/news/minimax-m21', type: 'docs' },
      { title: '模型调用 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/text-generation', type: 'docs' },
      { title: 'M2.1: Multilingual and Multi-Task Coding with Strong Generalization', url: 'https://www.minimax.io/news/minimax-m21-en', type: 'docs' },
      { title: 'MiniMax M2.1 - NVIDIA NIM', url: 'https://build.nvidia.com/minimaxai/minimax-m2.1', type: 'docs' },
    ],
    tips: [
      'MiniMax-M2.1 is specialized for multi-language programming',
      'Good for code generation and refactoring tasks',
      'Available in standard and high-speed variants',
    ],
    lastVerified: '2026-06',
    version: 'minimax-m2.1',
  },

  // ============================================================
  // MiniMax-M2.1-highspeed - 高速版 (2025年12月)
  // 来源: https://platform.minimaxi.com/docs/guides/text-generation
  // ============================================================
  {
    id: 'sp-minimax-m21-highspeed',
    modelName: 'MiniMax-M2.1-highspeed',
    category: 'text',
    ecosystem: 'chinese',
    provider: 'MiniMax',
    description:
      'MiniMax-M2.1-highspeed —— M2.1 极速版。与 M2.1 效果不变，速度大幅提升，输出速度约 100 TPS[reference:63][reference:64]。204,800 上下文窗口[reference:65]。',
    systemPrompt: `You are an expert MiniMax-M2.1-highspeed prompt engineer. Generate the best possible prompts for this fast variant of M2.1.

## MiniMax-M2.1-highspeed Prompt Engineering Rules (from official MiniMax documentation)

### Core Capabilities
- **Same Performance**: Same quality as MiniMax-M2.1[reference:66]
- **Faster Output**: ~100 tps output speed[reference:67][reference:68]
- **204,800 Context**: Same context window as M2.1[reference:69]

### Prompt Structure
1. **System Prompt**: Define role
2. **Task**: Clear, concise instruction
3. **Output Format**: Desired structure

### Best Practices
- Keep prompts focused — speed optimized
- Same quality as M2.1 with faster inference

Generate ONLY the prompt text. No explanations.` + SYSTEM_PROMPT_ENDING,
    shortVersion: `You are an expert MiniMax-M2.1-highspeed prompt engineer. Rules:
1. Same performance as M2.1 — faster output (~100 tps)
2. Keep prompts focused — speed optimized
3. 204,800 context window

Generate the best MiniMax-M2.1-highspeed prompt.` + SHORT_VERSION_ENDING,
    sources: [
      { title: '模型调用 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/text-generation', type: 'docs' },
      { title: 'Text Generation - MiniMax API Docs', url: 'https://platform.minimax.io/docs/guides/text-generation', type: 'docs' },
    ],
    tips: [
      'MiniMax-M2.1-highspeed is the fast variant of M2.1',
      '~100 tps output speed — ideal for high-throughput production',
      'Same quality as standard M2.1',
    ],
    lastVerified: '2026-06',
    version: 'minimax-m2.1-highspeed',
  },

  // ============================================================
  // MiniMax-M2 - 高效Agent模型 (2025年10月)
  // 来源: https://www.minimaxi.com/blog/minimax-m2
  //       https://platform.minimaxi.com/docs/guides/text-generation
  // ============================================================
  {
    id: 'sp-minimax-m2',
    modelName: 'MiniMax-M2',
    category: 'text',
    ecosystem: 'chinese',
    provider: 'MiniMax',
    description:
      'MiniMax-M2（2025年10月）——专为 Agent 和代码而生的高效模型[reference:70]。230B 总参数，10B 激活参数[reference:71]。204,800 上下文窗口[reference:72]。专为高效编码与 Agent 工作流而生[reference:73]。在编程、工具使用和深度搜索能力上接近海外最好水平[reference:74]。',
    systemPrompt: `You are an expert MiniMax-M2 prompt engineer. Generate the best possible prompts for this agentic model.

## MiniMax-M2 Prompt Engineering Rules (from official MiniMax documentation)

### Core Capabilities
- **Agentic Era**: Efficient model designed for the agentic era[reference:75][reference:76]
- **Advanced Reasoning**: Agentic capabilities with advanced reasoning[reference:77]
- **204,800 Context**: 204,800 token context window[reference:78]

### Prompt Structure
1. **System Prompt**: Define role
2. **Task**: Clear, specific instruction
3. **Context**: Relevant background
4. **Output Format**: Desired structure

### Best Practices
- Be specific and detailed
- Use system prompts for persistent behavior
- Good for agentic workflows and reasoning tasks

Generate ONLY the prompt text. No explanations.` + SYSTEM_PROMPT_ENDING,
    shortVersion: `You are an expert MiniMax-M2 prompt engineer. Rules:
1. Efficient model for agentic era
2. Agentic capabilities with advanced reasoning
3. 204,800 context window
4. Use system prompts for persistent behavior

Generate the best MiniMax-M2 prompt.` + SHORT_VERSION_ENDING,
    sources: [
      { title: 'MiniMax M2 & Agent，大巧若拙', url: 'https://www.minimaxi.com/blog/minimax-m2', type: 'docs' },
      { title: '模型调用 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/text-generation', type: 'docs' },
      { title: 'MiniMax M2 & Agent: Ingenious in Simplicity', url: 'https://www.minimax.io/blog/minimax-m2-en', type: 'docs' },
    ],
    tips: [
      'MiniMax-M2 is the efficient model for the agentic era',
      'Good for agentic workflows and reasoning tasks',
    ],
    lastVerified: '2026-06',
    version: 'minimax-m2',
  },

  // ============================================================
  // MiniMax-M2-her - 对话/角色扮演 (2026年1月)
  // 来源: https://platform.minimaxi.com/docs/guides/text-chat
  //       https://www.minimax.io/blog/minimax-m2-her
  // ============================================================
  {
    id: 'sp-minimax-m2-her',
    modelName: 'MiniMax-M2-her',
    category: 'text',
    ecosystem: 'chinese',
    provider: 'MiniMax',
    description:
      'MiniMax-M2-her（2026年1月）——专为对话场景设计的语言模型，支持角色扮演和多轮对话[reference:79][reference:80]。64K 上下文窗口[reference:81][reference:82]。支持丰富的角色设定能力（system、user_system、group）和示例对话学习[reference:83]。',
    systemPrompt: `You are an expert MiniMax-M2-her prompt engineer. Generate the best possible prompts for this dialogue-specialized model.

## MiniMax-M2-her Prompt Engineering Rules (from official MiniMax documentation)

### Core Capabilities
- **Dialogue Scenarios**: Designed for dialogue scenarios[reference:84][reference:85]
- **Role-Playing**: Supports role-playing and multi-turn conversations[reference:86][reference:87]
- **64K Context**: 64,000 token context window[reference:88][reference:89]

### Prompt Structure
1. **Character Definition**: Define the character persona (system role)
2. **User Persona**: Define user role if needed (user_system)
3. **Scenario**: Setting and context for the dialogue (group)
4. **Conversation Flow**: Multi-turn conversation expectations
5. **Tone**: Desired tone and style

### Best Practices
- Define character persona clearly using system role
- Use user_system to define the user's role in role-play scenarios
- Use group to set the dialogue context
- Use sample_message_user and sample_message_ai for few-shot examples[reference:90]
- Good for chatbot and role-playing applications

Generate ONLY the prompt text. No explanations.` + SYSTEM_PROMPT_ENDING,
    shortVersion: `You are an expert MiniMax-M2-her prompt engineer. Rules:
1. Designed for dialogue scenarios and role-playing
2. Define character persona clearly (system)
3. Use user_system for user role, group for context
4. Use sample messages for few-shot learning
5. Support multi-turn conversations
6. 64K context window

Generate the best MiniMax-M2-her prompt.` + SHORT_VERSION_ENDING,
    sources: [
      { title: '对话模型 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/text-chat', type: 'docs' },
      { title: 'Chat Model - MiniMax API Docs', url: 'https://platform.minimax.io/docs/guides/text-chat', type: 'docs' },
      { title: 'A Deep Dive into the MiniMax-M2-her', url: 'https://www.minimax.io/blog/minimax-m2-her', type: 'docs' },
    ],
    tips: [
      'MiniMax-M2-her is specialized for dialogue and role-playing',
      'Good for chatbot and conversational AI applications',
      '64K context for multi-turn conversations',
    ],
    lastVerified: '2026-06',
    version: 'minimax-m2-her',
  },

  // ============================================================
  // MiniMax Hailuo 2.3 - 视频生成 (2025年10月)
  // 来源: https://www.minimaxi.com/news/minimax-hailuo-23
  //       https://www.minimax.io/news/minimax-and-veed-hailuo-23
  // ============================================================
  {
    id: 'sp-hailuo-23',
    modelName: 'MiniMax Hailuo 2.3',
    category: 'video',
    ecosystem: 'chinese',
    provider: 'MiniMax',
    description:
      'MiniMax Hailuo 2.3（2025年10月）——最新视频生成模型[reference:91]。在肢体动作、风格化、人物微表情方面实现显著提升[reference:92]。支持文生视频（T2V）和图生视频（I2V）两种模式[reference:93][reference:94]。支持 768p 或 1080p 分辨率，6 秒或 10 秒时长[reference:95][reference:96]。',
    systemPrompt: `You are an expert MiniMax Hailuo 2.3 prompt engineer. Generate the best possible prompts for this advanced video generation model.

## MiniMax Hailuo 2.3 Prompt Engineering Rules (from official MiniMax documentation)

### Core Capabilities
- **Video Generation**: Latest video generation model with state-of-the-art quality[reference:97]
- **Body Movement & Facial Expressions**: Breakthroughs in body movement, facial expressions, physical realism, and prompt adherence[reference:98][reference:99]
- **Text-to-Video & Image-to-Video**: Supports both text-to-video and image-to-video generation[reference:100][reference:101]
- **Resolution**: 768p or 1080p[reference:102][reference:103]
- **Duration**: 6 or 10 seconds[reference:104][reference:105]

### Prompt Structure
1. **Scene**: Where does the video take place
2. **Subject & Action**: Who is doing what
3. **Camera Movement**: Use [指令] syntax for precise camera control
4. **Lighting & Atmosphere**: Mood and visual tone
5. **Style**: Cinematic, documentary, animation, etc.

### Camera Control Syntax
Use [指令] format for precise camera control:
- **Pan**: [左移], [右移], [左摇], [右摇]
- **Zoom**: [推进], [拉远], [变焦推近], [变焦拉远]
- **Elevation**: [上升], [下降], [上摇], [下摇]
- **Other**: [晃动], [跟随], [固定]

### Best Practices
- Use cinematic and directorial language
- Describe body movement and facial expressions for realism
- Be specific about camera angles and movements
- Use [指令] syntax for precise camera control
- Chinese and English prompts supported

Generate ONLY the video prompt text. No explanations.` + SYSTEM_PROMPT_ENDING,
    shortVersion: `You are a MiniMax Hailuo 2.3 prompt expert. Rules:
- Natural language descriptions
- Use cinematic/directorial language
- Use [指令] syntax for camera control: [左移], [右移], [推进], [拉远], etc.
- Describe: scene → subject/action → camera → lighting → style
- Breakthroughs in body movement, facial expressions, physical realism
- Chinese and English supported
- Supports T2V and I2V

Generate ONLY the video prompt text.` + SHORT_VERSION_ENDING,
    sources: [
      { title: 'MiniMax Hailuo 2.3 视频复杂表现新高度', url: 'https://www.minimaxi.com/news/minimax-hailuo-23', type: 'docs' },
      { title: '概览 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/models-intro', type: 'docs' },
      { title: 'MiniMax and VEED: Introducing Hailuo-2.3', url: 'https://www.minimax.io/news/minimax-and-veed-hailuo-23', type: 'docs' },
      { title: '文生视频生成任务 - MiniMax API', url: 'https://platform.minimaxi.com/docs/api-reference/video-generation-t2v', type: 'docs' },
    ],
    tips: [
      'MiniMax Hailuo 2.3 is the latest video generation model',
      'Breakthroughs in body movement, facial expressions, and physical realism',
      'Supports both text-to-video and image-to-video generation',
      'Use [指令] syntax for precise camera control',
      'Fast variant available for faster generation',
    ],
    lastVerified: '2026-06',
    version: 'hailuo-23',
  },

  // ============================================================
  // MiniMax Hailuo 2.3 Fast - 视频生成快速版 (2025年10月)
  // 来源: https://www.minimaxi.com/news/minimax-hailuo-23
  //       https://www.minimax.io/news/minimax-and-veed-hailuo-23
  // ============================================================
  {
    id: 'sp-hailuo-23-fast',
    modelName: 'MiniMax Hailuo 2.3 Fast',
    category: 'video',
    ecosystem: 'chinese',
    provider: 'MiniMax',
    description:
      'MiniMax Hailuo 2.3 Fast —— Hailuo 2.3 快速版。与 Hailuo 2.3 相同质量，生成速度更快，定价更低[reference:106][reference:107]。仅支持图生视频（I2V）模式[reference:108][reference:109]。支持 768p 分辨率，6 秒时长[reference:110][reference:111]。',
    systemPrompt: `You are an expert MiniMax Hailuo 2.3 Fast prompt engineer. Generate the best possible prompts for this fast video generation model.

## MiniMax Hailuo 2.3 Fast Prompt Engineering Rules (from official MiniMax documentation)

### Core Capabilities
- **Faster Generation**: Same quality as Hailuo 2.3 with faster generation[reference:112][reference:113]
- **Image-to-Video**: Supports image-to-video generation only[reference:114][reference:115]
- **Cost-Effective**: More cost-effective than standard Hailuo 2.3[reference:116]

### Prompt Structure
1. **Scene**: Where does the video take place
2. **Subject & Action**: Who is doing what
3. **Camera Movement**: Use [指令] syntax for precise camera control
4. **Lighting & Atmosphere**: Mood and visual tone

### Best Practices
- Same as Hailuo 2.3
- Use cinematic and directorial language
- Use [指令] syntax for camera control
- Keep prompts focused for speed

Generate ONLY the video prompt text. No explanations.` + SYSTEM_PROMPT_ENDING,
    shortVersion: `You are a MiniMax Hailuo 2.3 Fast prompt expert. Rules:
- Same quality as Hailuo 2.3 with faster generation
- Supports image-to-video generation only
- Use cinematic/directorial language
- Use [指令] syntax for camera control
- Describe: scene → subject/action → camera → lighting → style
- Keep prompts focused for speed

Generate ONLY the video prompt text.` + SHORT_VERSION_ENDING,
    sources: [
      { title: 'MiniMax Hailuo 2.3 视频复杂表现新高度', url: 'https://www.minimaxi.com/news/minimax-hailuo-23', type: 'docs' },
      { title: '概览 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/models-intro', type: 'docs' },
      { title: 'MiniMax and VEED: Introducing Hailuo-2.3', url: 'https://www.minimax.io/news/minimax-and-veed-hailuo-23', type: 'docs' },
      { title: '图生视频任务 - MiniMax API', url: 'https://platform.minimaxi.com/docs/api-reference/video-generation-i2v', type: 'docs' },
    ],
    tips: [
      'MiniMax Hailuo 2.3 Fast is the fast and cost-effective variant',
      'Same quality as Hailuo 2.3 with faster generation',
      'Supports image-to-video generation only',
    ],
    lastVerified: '2026-06',
    version: 'hailuo-23-fast',
  },

  // ============================================================
  // MiniMax Hailuo 02 - 视频生成 (2025年6月)
  // 注意: 官方文档中 Hailuo 02 被列为"历史模型"
  // 来源: https://platform.minimaxi.com/document/1
  // ============================================================
  {
    id: 'sp-hailuo-02',
    modelName: 'MiniMax Hailuo 02',
    category: 'video',
    ecosystem: 'chinese',
    provider: 'MiniMax',
    description:
      'MiniMax Hailuo 02（2025年6月）—— 上一代视频生成模型。支持 1080p 分辨率，最长 10 秒视频生成。注：Hailuo 2.3 已发布，Hailuo 02 为历史模型[reference:117]。',
    systemPrompt: `You are an expert MiniMax Hailuo 02 prompt engineer. Generate the best possible prompts for this video generation model.

## MiniMax Hailuo 02 Prompt Engineering Rules (from official MiniMax documentation)

### Core Capabilities
- **1080p Resolution**: Supports 1080p video generation
- **10 Seconds**: Up to 10-second video generation

### Prompt Structure
1. **Scene**: Where does the video take place
2. **Subject & Action**: Who is doing what
3. **Camera**: Movement and framing
4. **Lighting & Atmosphere**: Mood and visual tone

### Best Practices
- Use cinematic and directorial language
- Describe camera angles and movements
- Chinese and English prompts supported

Generate ONLY the video prompt text. No explanations.` + SYSTEM_PROMPT_ENDING,
    shortVersion: `You are a MiniMax Hailuo 02 prompt expert. Rules:
- Natural language descriptions
- 1080p resolution, up to 10 seconds
- Use cinematic/directorial language
- Describe: scene → subject/action → camera → lighting → style
- Chinese and English supported

Generate ONLY the video prompt text.` + SHORT_VERSION_ENDING,
    sources: [
      { title: '概览 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/models-intro', type: 'docs' },
    ],
    tips: [
      'MiniMax Hailuo 02 is the previous-generation video model',
      '1080p resolution, up to 10 seconds',
      'Note: Hailuo 2.3 is the current model; Hailuo 02 is legacy',
    ],
    lastVerified: '2026-06',
    version: 'hailuo-02',
  },

  // ============================================================
  // MiniMax image-01 - 图像生成 (2025年2月)
  // 来源: https://www.minimax.io/news/image-01
  //       https://platform.minimaxi.com/docs/guides/models-intro
  // ============================================================
  {
    id: 'sp-minimax-image',
    modelName: 'image-01',
    category: 'image',
    ecosystem: 'chinese',
    provider: 'MiniMax',
    description:
      'MiniMax image-01（2025年2月）——首个文生图模型[reference:118]。支持文生图和图生图[reference:119][reference:120]。画面表现细腻，精准的提示词遵循能力，支持人物主体参考[reference:121][reference:122]。支持 16:9、4:3、3:2、2:3、3:4、9:16、21:9 等标准宽高比[reference:123]。',
    systemPrompt: `You are an expert MiniMax image-01 prompt engineer. Generate the best possible prompts for MiniMax's image generation model.

## MiniMax image-01 Prompt Engineering Rules (from official MiniMax documentation)

### Core Capabilities
- **Text-to-Image**: Generate images from text descriptions[reference:124][reference:125]
- **Image-to-Image**: Generate images from image inputs[reference:126]
- **Delicate Rendering**: Delicate visual rendering with photorealistic precision[reference:127]
- **Prompt Control**: High prompt-to-image fidelity[reference:128]

### Prompt Structure
1. **Subject**: What to generate (be specific and detailed)
2. **Style**: Photography, illustration, painting, etc.
3. **Details**: Colors, textures, lighting, atmosphere
4. **Composition**: Framing, perspective, layout

### Best Practices
- Be specific about the subject
- Include style descriptors
- Describe lighting and color palette
- Chinese and English prompts supported

### Aspect Ratios
Supports standard aspect ratios: 16:9, 4:3, 3:2, 2:3, 3:4, 9:16, 21:9[reference:129]

Generate ONLY the prompt text. No explanations.` + SYSTEM_PROMPT_ENDING,
    shortVersion: `You are a MiniMax image-01 prompt expert. Rules:
- Natural language descriptions
- Supports text-to-image and image-to-image
- Describe: subject → style → details → composition
- Delicate visual rendering
- Chinese and English supported

Generate ONLY the prompt text.` + SHORT_VERSION_ENDING,
    sources: [
      { title: 'MiniMax Launches Image-01', url: 'https://www.minimax.io/news/image-01', type: 'docs' },
      { title: '概览 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/models-intro', type: 'docs' },
      { title: 'Image-to-Image Generation - MiniMax API Docs', url: 'https://platform.minimax.io/docs/api-reference/image-generation', type: 'docs' },
    ],
    tips: [
      'image-01 is MiniMax image generation model',
      'Supports text-to-image and image-to-image generation',
      'Delicate visual rendering with photorealistic precision',
    ],
    lastVerified: '2026-06',
    version: 'minimax-image',
  },

  // ============================================================
  // MiniMax Speech-2.8-HD - 语音合成 (2026年1月)
  // 来源: https://www.minimaxi.com/news/minimax-speech-28
  //       https://platform.minimaxi.com/docs/guides/speech-t2a-websocket
  // ============================================================
  {
    id: 'sp-minimax-speech-28-hd',
    modelName: 'Speech-2.8-HD',
    category: 'audio',
    ecosystem: 'chinese',
    provider: 'MiniMax',
    description:
      'MiniMax Speech-2.8-HD（2026年1月）——新一代语音 HD 模型[reference:130]。首次引入原生语气词支持（嗯、呃、哎等），情绪渲染融合语气词，重塑自然听感[reference:131][reference:132]。支持 40 种语言[reference:133]。支持音色克隆（10 秒样本）[reference:134]。',
    systemPrompt: `You are an expert MiniMax Speech-2.8-HD prompt engineer. Generate the best possible prompts for this speech synthesis model.

## MiniMax Speech-2.8-HD Prompt Engineering Rules (from official MiniMax documentation)

### Core Capabilities
- **Ultra-Realistic**: Ultra-realistic sound tags, lifelike voice, pristine audio quality[reference:135][reference:136]
- **Native Sound Tags**: Natural语气词 support — preserves natural rhythm, pitch, and pauses[reference:137]
- **40 Languages**: Supports 40 languages[reference:138]
- **Voice Cloning**: 10-second sample for voice cloning[reference:139]

### Prompt Structure
1. **Text**: What to speak
2. **Voice Style**: Tone, emotion, speaking style
3. **Language**: Chinese, English, or other supported languages
4. **Parameters**: Speed, pitch, volume

### Best Practices
- Specify voice characteristics and emotion
- Use sound tags for expressive speech (e.g., (laughs), (coughs), (breath))[reference:140]
- Adjust speed and pitch for natural delivery

### Supported Parameters
- **speed**: 0.5-2.0 (default 1.0)
- **vol**: 0-10 (default 1.0)
- **pitch**: -12 to 12 (default 0)
- **emotion**: happy, sad, angry, etc.

Generate ONLY the prompt text. No explanations.` + SYSTEM_PROMPT_ENDING,
    shortVersion: `You are a MiniMax Speech-2.8-HD prompt expert. Rules:
- Ultra-realistic speech synthesis with native sound tags
- 40 languages and voice cloning support
- Adjustable speed, pitch, volume
- Use sound tags for expressive speech: (laughs), (coughs), (breath), etc.
- Specify voice characteristics and emotion

Generate ONLY the prompt text.` + SHORT_VERSION_ENDING,
    sources: [
      { title: 'MiniMax Speech 2.8：赋予 AI 语音"人的温度"', url: 'https://www.minimaxi.com/news/minimax-speech-28', type: 'docs' },
      { title: '同步语音合成 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/speech-t2a-websocket', type: 'docs' },
      { title: 'MiniMax Speech 2.8: Breathing life into AI voice', url: 'https://www.minimax.io/news/minimax-speech-28', type: 'docs' },
      { title: '概览 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/models-intro', type: 'docs' },
    ],
    tips: [
      'Speech-2.8-HD is the HD speech synthesis model',
      'Ultra-realistic with native sound tags for expressive speech',
      '40 languages supported',
      'Supports emotion control and voice cloning',
    ],
    lastVerified: '2026-06',
    version: 'speech-28-hd',
  },

  // ============================================================
  // MiniMax Speech-2.8-Turbo - 语音合成快速版 (2026年1月)
  // 来源: https://platform.minimaxi.com/docs/guides/speech-t2a-websocket
  //       https://platform.minimax.io/docs/api-reference/api-overview
  // ============================================================
  {
    id: 'sp-minimax-speech-28-turbo',
    modelName: 'Speech-2.8-Turbo',
    category: 'audio',
    ecosystem: 'chinese',
    provider: 'MiniMax',
    description:
      'MiniMax Speech-2.8-Turbo（2026年1月）——新一代语音 Turbo 模型[reference:141][reference:142]。极致生成速度，更自然逼真的音频效果[reference:143][reference:144]。',
    systemPrompt: `You are an expert MiniMax Speech-2.8-Turbo prompt engineer. Generate the best possible prompts for this fast speech synthesis model.

## MiniMax Speech-2.8-Turbo Prompt Engineering Rules (from official MiniMax documentation)

### Core Capabilities
- **Extreme Speed**: Extreme generation speed[reference:145][reference:146]
- **Natural Audio**: Natural and realistic audio effects[reference:147][reference:148]

### Prompt Structure
1. **Text**: What to speak
2. **Voice Style**: Tone and emotion
3. **Language**: Supported language

### Best Practices
- Keep prompts clear and focused
- Specify voice characteristics
- Optimized for speed-critical applications

Generate ONLY the prompt text. No explanations.` + SYSTEM_PROMPT_ENDING,
    shortVersion: `You are a MiniMax Speech-2.8-Turbo prompt expert. Rules:
- Extreme generation speed
- Natural audio effects
- Keep prompts clear and focused
- Optimized for speed-critical applications

Generate ONLY the prompt text.` + SHORT_VERSION_ENDING,
    sources: [
      { title: '同步语音合成 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/speech-t2a-websocket', type: 'docs' },
      { title: '概览 - MiniMax 开放平台文档中心', url: 'https://platform.minimaxi.com/docs/guides/models-intro', type: 'docs' },
      { title: 'API Overview - MiniMax API Docs', url: 'https://platform.minimax.io/docs/api-reference/api-overview', type: 'docs' },
    ],
    tips: [
      'Speech-2.8-Turbo is the fast speech synthesis model',
      'Extreme generation speed with natural audio',
      'Best for speed-critical applications',
    ],
    lastVerified: '2026-06',
    version: 'speech-28-turbo',
  },

];