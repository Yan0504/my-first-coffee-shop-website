import { CoffeeProduct, ProductCategory, RoastLevel } from '../types/coffee';

export const HERO_IMAGE_URL = '/src/assets/images/hero_coffee_roastery_1793168024739.jpg';

export const COFFEE_PRODUCTS: CoffeeProduct[] = [
  {
    id: 'ethiopia-gedeb-pourover',
    code: 'BAR-01',
    name: '衣索比亞 歌迪貝 日曬手沖',
    englishSubtitle: 'Ethiopia Yirgacheffe Gedeb Natural Pour-Over',
    category: ProductCategory.FRESH_DRINK,
    roastLevel: RoastLevel.LIGHT,
    origin: '衣索比亞 耶加雪菲 歌迪貝產區',
    altitude: '2,150m',
    process: '非洲式高架棚日曬處理',
    varietal: 'Heirloom 原生種',
    flavorNotes: ['佛手柑', '白桃果肉', '新鮮茉莉', '柑橘蜂蜜'],
    shortDescription:
      '採用日本 Hario V60 錐形濾杯三段式斷水萃取，入口綻放清澈白桃與佛手柑香氣，尾韻帶有高山烏龍茶般的綿長甜感。',
    story:
      '來自歌迪貝（Gedeb）海拔超過兩千公尺的紅櫻桃微批次，農民於全熟紫紅果實階段手工採收，經 18 天慢速日曬乾燥。我們以輕柔脫水與短發展期淺焙鎖住細膩花香，無論熱飲品嚐層次或冰鎮鎖香皆極具辨識度。',
    basePrice: 170,
    unitLabel: '360ml 現沖單杯',
    statusNote: '當日鮮烘現沖',
    imageUrl: '/src/assets/images/coffee_ethiopia_pourover_1793168025490.jpg',
    sensory: {
      acidity: 5,
      sweetness: 4,
      body: 3,
    },
    brewingRecipe: {
      method: 'Hario V60 磁石濾杯三段注水',
      ratio: '1 : 15.5（20g 咖啡粉 / 310ml 軟水）',
      waterTemp: '92°C',
      brewTime: '02 分 15 秒',
      grindNote: 'EK43 刻度 #8.2 中細研磨',
    },
    customizationGroups: [
      {
        id: 'temperature',
        name: '飲用溫度',
        required: true,
        choices: [
          { id: 'hot', label: '熱飲 65°C（附聞香分享小杯）', priceDelta: 0 },
          { id: 'iced-flash', label: '日式急冷冰手沖（鎖住花果香）', priceDelta: 10 },
        ],
      },
      {
        id: 'size',
        name: '杯量規格',
        required: true,
        choices: [
          { id: 'regular', label: '標準杯 360ml', priceDelta: 0 },
          { id: 'large', label: '大杯 480ml', priceDelta: 30 },
        ],
      },
    ],
  },
  {
    id: 'signature-amber-latte',
    code: 'BAR-02',
    name: '嶼光琥珀 莊園配方拿鐵',
    englishSubtitle: 'Lumi Signature Amber Espresso Latte',
    category: ProductCategory.FRESH_DRINK,
    roastLevel: RoastLevel.MEDIUM_DARK,
    origin: '哥倫比亞 薇拉 × 瓜地馬拉 安提瓜 × 衣索比亞 西達摩',
    altitude: '1,650m–1,950m',
    process: '水洗與蜜處理拼配',
    varietal: 'Caturra · Bourbon · Heirloom',
    flavorNotes: ['烤榛果', '焦糖布蕾', '牛奶巧克力', '太妃糖尾韻'],
    shortDescription:
      '以三產區黃金比例中深烘焙濃縮為基底，融合絲絨般細緻微奶泡，呈現烤堅果與黑糖太妃糖的溫潤圓融口感。',
    story:
      '專為乳飲設計的「琥珀配方」歷經 42 次曲線微調，利用安提瓜火山土壤帶來的濃厚可可脂感支撐乳香，再點綴 20% 西達摩水洗豆提亮尾韻甜感，不加糖即可品嚐自然乳糖與咖啡焦糖化交織的甘甜。',
    basePrice: 150,
    unitLabel: '360ml 義式乳飲',
    statusNote: '人氣必點招牌',
    imageUrl: '/src/assets/images/coffee_amber_latte_1793168026959.jpg',
    sensory: {
      acidity: 2,
      sweetness: 5,
      body: 5,
    },
    brewingRecipe: {
      method: '9 Bar 雙份精準義式濃縮萃取',
      ratio: '1 : 2.0（19g 咖啡粉 → 38g Ristretto/Espresso）',
      waterTemp: '93°C',
      brewTime: '00 分 29 秒',
      grindNote: 'Mythos One 義式恆溫細研磨',
    },
    customizationGroups: [
      {
        id: 'temperature',
        name: '飲用溫度',
        required: true,
        choices: [
          { id: 'hot', label: '熱飲綿密拉花 62°C', priceDelta: 0 },
          { id: 'less-ice', label: '微冰清爽口感', priceDelta: 0 },
          { id: 'ice-free', label: '去冰滿杯乳香', priceDelta: 10 },
        ],
      },
      {
        id: 'milk',
        name: '乳品選擇',
        required: true,
        choices: [
          { id: 'fresh-milk', label: '台灣吉蒸牧場秀姑巒鮮乳', priceDelta: 0 },
          { id: 'oat-milk', label: 'Oatly 咖啡師燕麥奶（全素友善）', priceDelta: 25 },
          { id: 'extra-shot', label: '鮮乳 ＋ 加倍濃縮 Double Ristretto', priceDelta: 30 },
        ],
      },
      {
        id: 'sweetness',
        name: '甜度調整',
        required: true,
        choices: [
          { id: 'unsweetened', label: '無糖（品嚐自然乳糖甜感）', priceDelta: 0 },
          { id: 'cane-sugar', label: '微糖（手作沖繩黑糖漿）', priceDelta: 10 },
        ],
      },
    ],
  },
  {
    id: 'golden-yuzu-sparkling-coldbrew',
    code: 'BAR-03',
    name: '黃金柚香 慢萃冷萃氣泡咖啡',
    englishSubtitle: 'Golden Yuzu Sparkling Slow Cold Brew',
    category: ProductCategory.FRESH_DRINK,
    roastLevel: RoastLevel.MEDIUM,
    origin: '肯亞 涅里 AA × 衣索比亞 古吉 水洗',
    altitude: '1,900m–2,100m',
    process: '4°C 低溫 18 小時慢速浸漬冷萃',
    varietal: 'SL28 · SL34 · Heirloom',
    flavorNotes: ['日本黃金柚皮', '紅葡萄柚', '黑醋栗', '細緻氣泡感'],
    shortDescription:
      '歷時 18 小時低溫慢萃的清亮冷萃咖啡液，佐以糖漬黃金柚子與高壓綿密氣泡水，沁涼果香與乾淨果酸層次分明。',
    story:
      '採用肯亞 AA 與古吉水洗豆低溫萃取，避開高溫帶來的苦澀單寧，保留紅柚與黑醋栗般的明亮果汁感；出杯前手工削入新鮮黃柚皮噴灑天然精油，是午後最清爽提神的精品咖啡特調。',
    basePrice: 165,
    unitLabel: '380ml 冰鎮特調',
    statusNote: '每日限量 30 杯',
    imageUrl: '/src/assets/images/coffee_yuzu_coldbrew_1793168028184.jpg',
    sensory: {
      acidity: 4,
      sweetness: 4,
      body: 3,
    },
    brewingRecipe: {
      method: '4°C 恆溫無氧冷萃浸漬 ＋ 現打氣泡',
      ratio: '1 : 11 冷萃原液兌氣泡水與柚子蜜',
      waterTemp: '4°C 低溫萃取',
      brewTime: '18 小時靜置熟成',
      grindNote: '粗研磨 #9.5 均勻篩粉',
    },
    customizationGroups: [
      {
        id: 'sparkle',
        name: '基底口感',
        required: true,
        choices: [
          { id: 'sparkling', label: '綿密氣泡冷萃（推薦招牌）', priceDelta: 0 },
          { id: 'still', label: '純靜冷萃（無氣泡・更顯醇厚）', priceDelta: 0 },
        ],
      },
      {
        id: 'yuzu-level',
        name: '柚香甜度',
        required: true,
        choices: [
          { id: 'standard-yuzu', label: '黃金比例柚蜜（三分微甜）', priceDelta: 0 },
          { id: 'light-yuzu', label: '減糖輕柚香（一分極微甜）', priceDelta: 0 },
        ],
      },
    ],
  },
  {
    id: 'single-origin-estate-beans',
    code: 'BEAN-01',
    name: '微批次莊園單品咖啡熟豆',
    englishSubtitle: 'Micro-Lot Single Origin Whole Beans · Freshly Roasted',
    category: ProductCategory.ROASTED_BEANS,
    roastLevel: RoastLevel.LIGHT,
    origin: '衣索比亞 / 哥倫比亞 天堂莊園 / 台灣阿里山 鄒築園',
    altitude: '1,450m–2,150m',
    process: '日曬 / 雙重厭氧水洗 / 高山水洗',
    varietal: 'Heirloom · Pink Bourbon · Geisha',
    flavorNotes: ['玫瑰荔枝', '佛手柑白桃', '高山烏龍茶韻', '蔗糖回甘'],
    shortDescription:
      '採用單向排氣閥霧面保鮮袋封存，下單後由烘焙師挑選 48 小時內出爐批次，提供原豆或依沖煮器材免費精準代磨。',
    story:
      '使用 Loring 全熱風智能烘焙機進行微量批次烘焙，透過精準風門與升溫率（RoR）控制，讓豆芯與豆表均勻熟化、無焦苦燥感。可自由選擇三款當季杯測 88 分以上之莊園代表豆款。',
    basePrice: 460,
    unitLabel: '200g / 單向排氣閥包裝',
    statusNote: '接單後 48h 內鮮烘',
    imageUrl: '/src/assets/images/beans_single_origin_bag_1793168028835.jpg',
    sensory: {
      acidity: 4,
      sweetness: 5,
      body: 3,
    },
    brewingRecipe: {
      method: '建議養豆 5–7 天後沖煮風味最佳',
      ratio: '1 : 15（15g 咖啡粉 / 225ml 熱水）',
      waterTemp: '91°C–93°C',
      brewTime: '02 分 10 秒',
      grindNote: '細砂糖般顆粒大小（可選免費代磨）',
    },
    customizationGroups: [
      {
        id: 'bean-lot',
        name: '選擇莊園批次',
        required: true,
        choices: [
          {
            id: 'gedeb-natural',
            label: '衣索比亞 歌迪貝 日曬（佛手柑 · 白桃 · 淺焙）',
            priceDelta: 0,
          },
          {
            id: 'colombia-pink-bourbon',
            label: '哥倫比亞 天堂莊園 粉紅波旁（玫瑰荔枝 · 淺中焙）',
            priceDelta: 90,
          },
          {
            id: 'alishan-geisha',
            label: '台灣阿里山 鄒築園 水洗藝伎 150g（玉蘭花 · 烏龍茶韻）',
            priceDelta: 320,
          },
        ],
      },
      {
        id: 'pack-weight',
        name: '包裝容量',
        required: true,
        choices: [
          { id: '200g', label: '標準單包 200g（約可沖煮 13 杯）', priceDelta: 0 },
          { id: '450g', label: '職人分享包 450g（享 88 折量販優惠）', priceDelta: 460 },
        ],
      },
      {
        id: 'grind',
        name: '研磨刻度服務',
        required: true,
        choices: [
          { id: 'whole-bean', label: '原豆不研磨（保留最完整香氣）', priceDelta: 0 },
          { id: 'pourover-grind', label: '手沖濾杯研磨（EK43 #8.2 中細度）', priceDelta: 0 },
          { id: 'espresso-grind', label: '家用義式機細研磨（#2.0 細度）', priceDelta: 0 },
          { id: 'french-press', label: '法式濾壓壺／冷萃粗研磨（#10.0 粗度）', priceDelta: 0 },
        ],
      },
    ],
  },
  {
    id: 'architectural-drip-gift-box',
    code: 'BEAN-02',
    name: '嶼光日常 充氮精品濾掛禮盒（10入）',
    englishSubtitle: 'Nitrogen-Flushed Specialty Drip Bag Gift Collection',
    category: ProductCategory.ROASTED_BEANS,
    roastLevel: RoastLevel.MEDIUM,
    origin: '衣索比亞 晨曦花果 ×5 入 ＋ 哥倫比亞 暮色堅果 ×5 入',
    altitude: '1,750m–2,150m',
    process: '99.9% 食品級充氮封裝 · 殘氧量低於 0.8%',
    varietal: '雙風味典藏精裝組',
    flavorNotes: ['柑橘花香', '烤杏仁可可', '楓糖甜感', '乾淨回甘'],
    shortDescription:
      '每包足量 12g 精品現磨咖啡粉，採食品級充氮保鮮技術鎖住剛磨好的香氣，搭配極簡灰石硬殼禮盒，送禮與辦公室日常皆宜。',
    story:
      '打破傳統濾掛單薄且易油耗的印象，我們將每包粉量提升至 12 公克，並於研磨後 3 分鐘內完成充氮密封。內含 5 包淺焙花果調與 5 包中焙堅果可可調，無需手沖壺也能在 90 秒內重現店內杯測等級風味。',
    basePrice: 520,
    unitLabel: '12g × 10 入精裝禮盒',
    statusNote: '企業贈禮熱銷',
    imageUrl: '/src/assets/images/beans_drip_gift_box_1793168030065.jpg',
    sensory: {
      acidity: 3,
      sweetness: 5,
      body: 4,
    },
    brewingRecipe: {
      method: '撕開濾袋掛於杯緣，分 3 次緩慢注水即可享用',
      ratio: '12g 濾掛包建議注水 180ml–195ml',
      waterTemp: '90°C–92°C',
      brewTime: '01 分 30 秒',
      grindNote: '已由烘焙室精準研磨並充氮封裝',
    },
    customizationGroups: [
      {
        id: 'assortment',
        name: '禮盒風味組合',
        required: true,
        choices: [
          { id: 'mixed-10', label: '經典雙享組（晨曦淺焙 ×5 ＋ 暮色中焙 ×5）', priceDelta: 0 },
          { id: 'floral-10', label: '全花果淺焙組（衣索比亞日曬 ×10 入）', priceDelta: 20 },
          { id: 'nutty-10', label: '全堅果中焙組（琥珀焦糖可可 ×10 入）', priceDelta: 0 },
        ],
      },
      {
        id: 'gift-bag',
        name: '提袋與禮卡配件',
        required: true,
        choices: [
          { id: 'self-use', label: '環保無提袋（自用減碳包裝）', priceDelta: 0 },
          { id: 'paper-bag', label: '附品牌厚磅棉繩提袋 ＋ 空白風味手寫卡', priceDelta: 25 },
        ],
      },
    ],
  },
];

export interface RoastGuideEntry {
  id: string;
  indexLabel: string;
  title: string;
  agtron: string;
  roastRatio: string;
  waterTemp: string;
  acidityText: string;
  sweetnessText: string;
  bodyText: string;
  aromaSpectrum: string;
  description: string;
  recommendedProductId: string;
  recommendedLabel: string;
}

export const ROAST_GUIDE_ENTRIES: RoastGuideEntry[] = [
  {
    id: 'light',
    indexLabel: '01. 晨曦淺焙 Light Roast',
    title: '完整保留高海拔果實的花香與明亮柑橘酸質',
    agtron: 'Agtron #75 · 一爆密集後 65 秒下豆',
    roastRatio: '發展期比例 14.5%',
    waterTemp: '建議水溫 92–94°C',
    acidityText: '清澈白桃與佛手柑果酸',
    sweetnessText: '荔枝與百花蜜清甜',
    bodyText: '絲綢般輕盈茶感',
    aromaSpectrum: '茉莉白花 · 佛手柑 · 水蜜桃 · 烏龍茶韻',
    description:
      '採用高風量全熱風對流穿透豆芯，避免外焦內生（Tipping & Underdeveloped）。適合喜愛精品手沖果香、追求產地風土辨識度的品飲者。',
    recommendedProductId: 'ethiopia-gedeb-pourover',
    recommendedLabel: '衣索比亞 歌迪貝 日曬手沖',
  },
  {
    id: 'medium',
    indexLabel: '02. 琥珀中焙 Medium Roast',
    title: '果酸與梅納反應焦糖甜感的黃金平衡點',
    agtron: 'Agtron #58 · 一爆結束靜置滑行下豆',
    roastRatio: '發展期比例 17.8%',
    waterTemp: '建議水溫 89–91°C',
    acidityText: '溫潤紅柚與熟果柔酸',
    sweetnessText: '楓糖漿與烤甘蔗甜感',
    bodyText: '圓潤飽滿果汁質地',
    aromaSpectrum: '黃金柚皮 · 烤杏仁 · 焦糖蘋果 · 紅茶尾韻',
    description:
      '拉長梅納反應階段使還原糖充分轉化，柔化尖銳酸感並帶出飽滿堅果與熟果甜香，無論冷萃、濾掛或手沖皆極度順口耐喝。',
    recommendedProductId: 'architectural-drip-gift-box',
    recommendedLabel: '嶼光日常 充氮精品濾掛禮盒',
  },
  {
    id: 'medium-dark',
    indexLabel: '03. 暮色中深焙 Medium-Dark',
    title: '濃郁榛果可可脂香，與鮮乳及燕麥奶完美交融',
    agtron: 'Agtron #46 · 二爆前夕精準冷卻鎖香',
    roastRatio: '發展期比例 21.0%',
    waterTemp: '建議水溫 86–88°C（義式 93°C）',
    acidityText: '極低酸度・溫和醇順',
    sweetnessText: '黑糖太妃糖與焦糖布蕾',
    bodyText: '厚實奶油絲絨醇厚度',
    aromaSpectrum: '烘烤榛果 · 70% 黑巧克力 · 黑糖 · 奶油太妃',
    description:
      '嚴格止步於二爆油脂滲出前，絕無傳統深焙焦炭苦澀味，卻擁有深邃的可可脂厚度與綿長黑糖回甘，是拿鐵與濃縮愛好者的首選。',
    recommendedProductId: 'signature-amber-latte',
    recommendedLabel: '嶼光琥珀 莊園配方拿鐵',
  },
];

export interface TestimonialItem {
  id: string;
  quote: string;
  authorName: string;
  role: string;
  organization: string;
  metricContext: string;
}

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't1',
    quote:
      '過去辦公室訂購商業濾掛常因氧化產生油耗苦味；改用嶼光充氮濾掛與歌迪貝熟豆連續 8 個月後，團隊晨間手沖滿意度極高，每週固定回購兩箱分享包。',
    authorName: '林宥辰',
    role: '共同創辦人暨設計總監',
    organization: '森嶼建築設計事務所',
    metricContext: '企業長期訂閱客戶 · 連續回購 8 個月',
  },
  {
    id: 't2',
    quote:
      '每天早上通勤前在網站預訂熱琥珀燕麥拿鐵，到店免排隊 30 秒直接取餐，奶泡細膩度與濃縮油脂甜感始終維持在杯測室水準。',
    authorName: '陳品妤',
    role: 'CQI Q Arabica 認證杯測師',
    organization: '獨立飲食專欄作者',
    metricContext: '線上預訂自取常客 · 累計超過 60 次訂購',
  },
];
