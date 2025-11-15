// AI 解卦 Prompt 配置文件 - 示例版本
// 复制此文件为 prompts.config.ts 并自定义你的 prompt

export function generateDivinationPrompt(
  question: string,
  palaceList: string[],
  selfPalace: { title: string; wuxing: string },
  currentDate: string,
  currentShichen: string,
  language: 'zh' | 'en' = 'zh'
): string {
  if (language === 'en') {
    return `You are a diviner specializing in Xiao Liuren.

【Question】: ${question}

【Palace Results】:
${palaceList.join('\n')}

【Self Palace】: ${selfPalace.title} Palace (${selfPalace.wuxing})

Please provide divination analysis.

Note: This is a sample prompt. For full version, please contact the author or visit https://mysterious.lexaverse.dev`;
  }

  return `你是一位精通小六壬的卜卦师。

【问题】：${question}

【排盘结果】：
${palaceList.join('\n')}

【自身宫位】：${selfPalace.title}宫（${selfPalace.wuxing}）

请给出解卦分析。

注意：此为示例 Prompt，完整版本请联系作者或访问 https://mysterious.lexaverse.dev`;
}

/**
 * 获取当前日期和时辰信息
 */
export function getCurrentDateTimeInfo(language: 'zh' | 'en' = 'zh'): { date: string; shichen: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = now.getHours();

  // 时辰对应表
  const shichenMapZh: Record<number, string> = {
    23: '子时', 0: '子时',
    1: '丑时', 2: '丑时',
    3: '寅时', 4: '寅时',
    5: '卯时', 6: '卯时',
    7: '辰时', 8: '辰时',
    9: '巳时', 10: '巳时',
    11: '午时', 12: '午时',
    13: '未时', 14: '未时',
    15: '申时', 16: '申时',
    17: '酉时', 18: '酉时',
    19: '戌时', 20: '戌时',
    21: '亥时', 22: '亥时',
  };

  const shichenMapEn: Record<number, string> = {
    23: 'Zi Hour', 0: 'Zi Hour',
    1: 'Chou Hour', 2: 'Chou Hour',
    3: 'Yin Hour', 4: 'Yin Hour',
    5: 'Mao Hour', 6: 'Mao Hour',
    7: 'Chen Hour', 8: 'Chen Hour',
    9: 'Si Hour', 10: 'Si Hour',
    11: 'Wu Hour', 12: 'Wu Hour',
    13: 'Wei Hour', 14: 'Wei Hour',
    15: 'Shen Hour', 16: 'Shen Hour',
    17: 'You Hour', 18: 'You Hour',
    19: 'Xu Hour', 20: 'Xu Hour',
    21: 'Hai Hour', 22: 'Hai Hour',
  };

  const shichenMap = language === 'en' ? shichenMapEn : shichenMapZh;
  const dateFormat = language === 'en' 
    ? `${month}/${day}/${year}`
    : `${year}年${month}月${day}日`;

  return {
    date: dateFormat,
    shichen: shichenMap[hour] || (language === 'en' ? 'Unknown Hour' : '未知时辰'),
  };
}

