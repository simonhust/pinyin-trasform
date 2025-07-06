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
  "阿凡达": "AFD",
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

// 字母到数字的映射表
const LETTER_TO_NUMBER: Record<string, string> = {
  "A": "2", "B": "2", "C": "2",
  "D": "3", "E": "3", "F": "3",
  "G": "4", "H": "4", "I": "4",
  "J": "5", "K": "5", "L": "5",
  "M": "6", "N": "6", "O": "6",
  "P": "7", "Q": "7", "R": "7", "S": "7",
  "T": "8", "U": "8", "V": "8",
  "W": "9", "X": "9", "Y": "9", "Z": "9"
};

// 数字到九键键盘的映射表
const NUMBER_TO_KEYPAD: Record<string, string> = {
  "0": "0", "1": "1", "2": "2", "3": "3", 
  "4": "4", "5": "5", "6": "6", "7": "7", 
  "8": "8", "9": "9"
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
          
          // 检查是否为数字
          if (/^\d$/.test(char)) {
            abbr += char;
            pos++;
            continue;
          }
          
          const [pinyinArr] = pinyin(char, { 
            style: pinyin.STYLE_TONE, // 获取完整拼音
            heteronym: true           // 启用多音字模式
          });
          
          // 选择第一个拼音并处理
          let py = pinyinArr[0].replace(/[^a-z]/g, ''); // 去除声调
          
          // 零声母处理
          let initial = ZERO_INITIALS[py] || py.charAt(0);
          
          // 翘舌音转换，使用大写字母
          if (py.startsWith('zh')) initial = 'Z';
          if (py.startsWith('ch')) initial = 'C';
          if (py.startsWith('sh')) initial = 'S';
          
          // 确保首字母为大写
          initial = initial.toUpperCase();
          
          abbr += initial;
          pos++;
        }
      }

      // 将首拼转换为数字，同时处理字母和数字
      let numbers = "";
      for (let i = 0; i < abbr.length; i++) {
        const char = abbr[i];
        // 如果是字母，使用字母映射表
        if (/[A-Z]/.test(char)) {
          numbers += LETTER_TO_NUMBER[char];
        } 
        // 如果是数字，直接使用数字本身
        else if (/^\d$/.test(char)) {
          numbers += NUMBER_TO_KEYPAD[char];
        }
        // 其他字符忽略（保持原逻辑）
      }

      return new Response(`${abbr}|${text}|${numbers}`);

    } catch (error) {
      return new Response(`错误: ${error.message}`, { status: 400 });
    }
  }
  return new Response("接口不存在", { status: 404 });
};

serve(handler, { port: 8000 });
