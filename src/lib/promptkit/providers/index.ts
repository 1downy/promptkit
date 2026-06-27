
import type { SystemPromptEntry } from '../types';

import { OPENAI } from './openai';
import { ALIBABA } from './alibaba';
import { GOOGLE } from './google';
import { ANTHROPIC } from './anthropic';
import { BLACK_FOREST_LABS } from './black-forest-labs';
import { MINIMAX } from './minimax';
import { KUAISHOU } from './kuaishou';
import { DEEPSEEK } from './deepseek';
import { MISTRAL_AI } from './mistral-ai';
import { XAI } from './xai';
import { ZHIPU_AI } from './zhipu-ai';
import { BYTEDANCE } from './bytedance';
import { TENCENT } from './tencent';
import { STABILITY_AI } from './stability-ai';
import { RECRAFT } from './recraft';
import { RUNWAY } from './runway';
import { COHERE } from './cohere';
import { META } from './meta';
import { MOONSHOT_AI } from './moonshot-ai';
import { XIAOMI } from './xiaomi';

import { IDEOGRAM } from './ideogram';
import { SOURCEFUL } from './sourceful';
import { MICROSOFT } from './microsoft';
import { COMMUNITY } from './community';
import { PIKA } from './pika';
import { LUMA_AI } from './luma-ai';
import { RESEARCH } from './research';
import { TENCENTARC } from './tencentarc';
import { STEPFUN } from './stepfun';
import { INCEPTION_LABS } from './inception-labs';
import { NVIDIA } from './nvidia';
import { ADOBE } from './adobe';
import { REVE_AI } from './reve-ai';
import { BAIDU } from './baidu';
import { STABILITY_AI_RUNWAY } from './stability-ai-runway';
import { PIXART_ALPHA } from './pixart-alpha';
import { CAGLIOSTROLAB } from './cagliostrolab';
import { TONGYI_MAI_ALIBABA } from './tongyi-mai-alibaba';
import { GOOGLE_DEEPMIND } from './google-deepmind';
import { VIDU } from './shengshu-ai';
import { LIGHTRICKS } from './lightricks';
import { GENMO } from './genmo';
import { OPENGVLAB } from './opengvlab';
import { HVISION_NKU } from './hvision-nku';
import { TRIPO } from './tripo';
import { MESHY } from './meshy';
import { YI } from './01-ai';

export const ALL_PROVIDER_ENTRIES: SystemPromptEntry[] = [
  ...OPENAI,
  ...ALIBABA,
  ...GOOGLE,
  ...ANTHROPIC,
  ...BLACK_FOREST_LABS,
  ...MINIMAX,
  ...KUAISHOU,
  ...DEEPSEEK,
  ...MISTRAL_AI,
  ...XAI,
  ...ZHIPU_AI,
  ...BYTEDANCE,
  ...TENCENT,
  ...STABILITY_AI,
  ...RECRAFT,
  ...RUNWAY,
  ...COHERE,
  ...META,
  ...MOONSHOT_AI,
  ...XIAOMI,

  ...IDEOGRAM,
  ...SOURCEFUL,
  ...MICROSOFT,
  ...COMMUNITY,
  ...PIKA,
  ...LUMA_AI,
  ...RESEARCH,
  ...TENCENTARC,
  ...STEPFUN,
  ...INCEPTION_LABS,
  ...NVIDIA,
  ...ADOBE,
  ...REVE_AI,
  ...BAIDU,
  ...STABILITY_AI_RUNWAY,
  ...PIXART_ALPHA,
  ...CAGLIOSTROLAB,
  ...TONGYI_MAI_ALIBABA,
  ...GOOGLE_DEEPMIND,
  ...VIDU,
  ...LIGHTRICKS,
  ...GENMO,
  ...OPENGVLAB,
  ...HVISION_NKU,
  ...TRIPO,
  ...MESHY,
  ...YI,
];
