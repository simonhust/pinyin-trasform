import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import pinyin from "https://deno.land/x/pinyin/mod.ts";

// 增强版特例词库
const SPECIAL_CASES: Record<string, string> = {
  // 地名（含多音字）
  "重庆": "CQ",
  "厦门": "XM",
  "朝阳": "CY",
  "长安": "CA",
  "长沙": "CS",
  "西藏": "XZ",
  "乐山": "LS",
  "青岛": "QD",
  "宁波": "NB",
  "长春": "CC",
  "保定": "BD",
  "贵阳": "GY",
  "六安": "LA",
  "台州": "TZ",
  "黄山": "HS",

  // 专有名词（含多音字）
  "重案": "ZA",
  "重量": "ZL",
  "重复": "CF",
  "行程": "XC",
  "长发": "CF",
  "调和": "TH",
  "大夫": "DF",
  "地道": "DD",
  "本事": "BS",

  "哪吒": "NZ",
  "单于": "CY",
  "可汗": "KH",
  "吐蕃": "TB",
  "龟兹": "QC",
  "大宛": "DW",
  "月氏": "YZ",
  "镐京": "HJ",
  "会稽": "KJ",
  "阿房": "AP"
};

// 零声母映射表
const ZERO_INITIALS: Record<string, string> = {
  "a": "A", "o": "O", "e": "E",
  "ai": "A", "ei": "E", "ou": "O"
};

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  
  if (req.method === "GET" && url.pathname === "/convert") {
    try {
      const text = decodeURIComponent(url.searchParams.get("text") || "");
      if (!text) throw new Error("输入内容不能为空");
      
      let abbr = "";
      let pos = 0;
      
      while (pos < text.length) {
        let matched = false;
        
        // 优先匹配最长特例词（4字→1字）
        for (let len = Math.min(4, text.length - pos); len >= 1; len--) {
          const word = text.slice(pos, pos + len);
          if (SPECIAL_CASES[word]) {
            abbr += SPECIAL_CASES[word];
            pos += len;
            matched = true;
            break;
          }
        }
        
        if (!matched) {
          const char = text[pos];
          const [pinyinArr] = pinyin(char, { 
            style: pinyin.STYLE_TONE, // 获取完整拼音
            heteronym: true           // 启用多音字模式
          });
          
          // 选择第一个拼音并处理
          let py = pinyinArr[0].replace(/[^a-z]/g, ''); // 去除声调
          
          // 零声母处理
          let initial = ZERO_INITIALS[py] || py.charAt(0);
          
          // 翘舌音转换
          if (py.startsWith('zh')) initial = 'z';
          if (py.startsWith('ch')) initial = 'c';
          if (py.startsWith('sh')) initial = 's';
          
          abbr += initial.toUpperCase();
          pos++;
        }
      }

      return new Response(`${abbr}|${text}`);

    } catch (error) {
      return new Response(`错误: ${error.message}`, { status: 400 });
    }
  }
  return new Response("接口不存在", { status: 404 });
};

serve(handler, { port: 8000 });
