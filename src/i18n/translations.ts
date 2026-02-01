// 国际化配置文件
export type Language = 'zh' | 'en';

export interface Translations {
  // 导航和标题
  nav: {
    title: string;
    subtitle: string;
  };
  
  // 输入表单
  form: {
    x1Label: string;
    x1Placeholder: string;
    x2Label: string;
    x2Placeholder: string;
    calculateButton: string;
    emptyResult: string;
    errorX1Range: string;
  };
  
  // 时辰选项
  hours: Array<{ value: number; label: string }>;
  
  // 宫位和元素（保持中文，英文显示拼音或翻译）
  palaces: {
    大安: string;
    留连: string;
    速喜: string;
    赤口: string;
    小吉: string;
    空亡: string;
  };
  
  elements: {
    木: string;
    火: string;
    土: string;
    金: string;
    水: string;
    天空: string;
  };
  
  // 神煞
  animals: {
    玄武: string;
    勾陈: string;
    青龙: string;
    朱雀: string;
    腾蛇: string;
    白虎: string;
  };
  
  // 六亲关系
  relations: {
    父母: string;
    兄弟: string;
    妻财: string;
    官鬼: string;
    子孙: string;
    自身: string;
  };
  
  // AI解卦
  ai: {
    title: string;
    dividerText: string;
    questionLabel: string;
    questionPlaceholder: string;
    hourlyHint: string;
    startButton: string;
    loadingButton: string;
    loadingText: string;
    loadingSubtext: string;
    resultTitle: string;
    alertNoQuestion: string;
    alertNoResult: string;
    errorPrefix: string;
    errorSuffix: string;
  };
}

export const translations: Record<Language, Translations> = {
  zh: {
    nav: {
      title: '小六壬排盘',
      subtitle: '输入 X1（1-30）和对应时辰，快速查看六宫落点、五行与神煞提示。',
    },
    form: {
      x1Label: 'X1',
      x1Placeholder: '1-30',
      x2Label: '时辰 (X2)',
      x2Placeholder: '选择对应时辰',
      calculateButton: '开始排盘',
      emptyResult: '输入完成后点击「开始排盘」查看六宫结果',
      errorX1Range: 'X1 需要在 1-30 之间',
    },
    hours: [
      { value: 1, label: '1 (子) 23:00-1:00' },
      { value: 2, label: '2 (丑) 1:00-3:00' },
      { value: 3, label: '3 (寅) 3:00-5:00' },
      { value: 4, label: '4 (卯) 5:00-7:00' },
      { value: 5, label: '5 (辰) 7:00-9:00' },
      { value: 6, label: '6 (巳) 9:00-11:00' },
      { value: 7, label: '7 (午) 11:00-13:00' },
      { value: 8, label: '8 (未) 13:00-15:00' },
      { value: 9, label: '9 (申) 15:00-17:00' },
      { value: 10, label: '10 (酉) 17:00-19:00' },
      { value: 11, label: '11 (戌) 19:00-21:00' },
      { value: 12, label: '12 (亥) 21:00-23:00' },
    ],
  palaces: {
    大安: '大安',
    留连: '留连',
    速喜: '速喜',
    赤口: '赤口',
    小吉: '小吉',
    空亡: '空亡',
  },
  elements: {
    木: '木',
    火: '火',
    土: '土',
    金: '金',
    水: '水',
    天空: '天空',
  },
  animals: {
    玄武: '玄武',
    勾陈: '勾陈',
    青龙: '青龙',
    朱雀: '朱雀',
    腾蛇: '腾蛇',
    白虎: '白虎',
  },
  relations: {
    父母: '父母',
    兄弟: '兄弟',
    妻财: '妻财',
    官鬼: '官鬼',
    子孙: '子孙',
    自身: '自身',
  },
    ai: {
      title: '🔮 AI智能解卦',
      dividerText: '继续向下，开启AI智能解卦',
      questionLabel: '您想问什么问题？',
      questionPlaceholder: '请集中精神，一事一问。例如："今日财运如何？"、"我和TA的感情走向？"、"这份工作能成吗？"\n\n小六壬善断"当下"和"短期"吉凶，请把问题问得越具体越好。',
      hourlyHint: '备注：每个用户每小时对同一件事情，最好只起一个卦。',
      startButton: '✨ 开始AI解卦',
      loadingButton: '正在解卦中...',
      loadingText: '卦象已成，洞察天机中...',
      loadingSubtext: 'AI大师正在为您解读卦象',
      resultTitle: '📖 卦象解析',
      alertNoQuestion: '请输入您想问的问题！',
      alertNoResult: '请先完成排盘！',
      errorPrefix: '解卦失败：',
      errorSuffix: '\n\n请检查网络连接是否正常。',
    },
  },
  en: {
    nav: {
      title: 'Xiao Liuren Divination',
      subtitle: 'Enter X1 (1-30) and corresponding hour to quickly view palace positions, five elements, and deity guidance.',
    },
    form: {
      x1Label: 'X1',
      x1Placeholder: '1-30',
      x2Label: 'Hour (X2)',
      x2Placeholder: 'Select corresponding hour',
      calculateButton: 'Calculate',
      emptyResult: 'Click "Calculate" after entering to view the six palaces',
      errorX1Range: 'X1 must be between 1-30',
    },
    hours: [
      { value: 1, label: '1 (子 Zi/Rat) 23:00-1:00' },
      { value: 2, label: '2 (丑 Chou/Ox) 1:00-3:00' },
      { value: 3, label: '3 (寅 Yin/Tiger) 3:00-5:00' },
      { value: 4, label: '4 (卯 Mao/Rabbit) 5:00-7:00' },
      { value: 5, label: '5 (辰 Chen/Dragon) 7:00-9:00' },
      { value: 6, label: '6 (巳 Si/Snake) 9:00-11:00' },
      { value: 7, label: '7 (午 Wu/Horse) 11:00-13:00' },
      { value: 8, label: '8 (未 Wei/Goat) 13:00-15:00' },
      { value: 9, label: '9 (申 Shen/Monkey) 15:00-17:00' },
      { value: 10, label: '10 (酉 You/Rooster) 17:00-19:00' },
      { value: 11, label: '11 (戌 Xu/Dog) 19:00-21:00' },
      { value: 12, label: '12 (亥 Hai/Pig) 21:00-23:00' },
    ],
    palaces: {
      大安: '大安 Da\'an (Great Peace)',
      留连: '留连 Liulian (Lingering)',
      速喜: '速喜 Suxi (Swift Joy)',
      赤口: '赤口 Chikou (Red Mouth)',
      小吉: '小吉 Xiaoji (Small Luck)',
      空亡: '空亡 Kongwang (Empty Void)',
    },
    elements: {
      木: '木 Wood',
      火: '火 Fire',
      土: '土 Earth',
      金: '金 Metal',
      水: '水 Water',
      天空: '天空 Heaven',
    },
    animals: {
      玄武: '玄武 Xuanwu (Black Tortoise)',
      勾陈: '勾陈 Gouchen (Hook & Pull)',
      青龙: '青龙 Qinglong (Azure Dragon)',
      朱雀: '朱雀 Zhuque (Vermillion Bird)',
      腾蛇: '腾蛇 Tengshe (Soaring Snake)',
      白虎: '白虎 Baihu (White Tiger)',
    },
    relations: {
      父母: '父母 Parents',
      兄弟: '兄弟 Siblings',
      妻财: '妻财 Wealth',
      官鬼: '官鬼 Authority',
      子孙: '子孙 Children',
      自身: '自身 Self',
    },
    ai: {
      title: '🔮 AI Divination',
      dividerText: 'Continue below for AI-powered divination',
      questionLabel: 'What would you like to ask?',
      questionPlaceholder: 'Focus your mind on one question. Examples: "How is my fortune today?", "What is the future of my relationship?", "Will this job work out?"\n\nXiao Liuren specializes in "current" and "short-term" fortune. Please be as specific as possible.',
      hourlyHint: 'Note: For the same matter, it is best to cast only one divination per hour.',
      startButton: '✨ Start AI Reading',
      loadingButton: 'Reading in progress...',
      loadingText: 'Hexagram formed, interpreting cosmic wisdom...',
      loadingSubtext: 'AI master is interpreting your hexagram',
      resultTitle: '📖 Divination Result',
      alertNoQuestion: 'Please enter your question!',
      alertNoResult: 'Please complete the calculation first!',
      errorPrefix: 'Reading failed: ',
      errorSuffix: '\n\nPlease check your network connection.',
    },
  },
};

export function getTranslation(lang: Language): Translations {
  return translations[lang];
}

