import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import pinyin from "https://deno.land/x/pinyin/mod.ts";

// 特例词库配置
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
  "本事": "BS"

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

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  
  if (req.method === "GET" && url.pathname === "/convert") {
    try {
      // 参数解码与验证
      const text = decodeURIComponent(url.searchParams.get("text") || "");
      if (!text) throw new Error("请输入要转换的文本");
      if (!/^[\p{Script=Han}]+$/u.test(text)) {
        throw new Error("仅支持纯中文字符输入");
      }

      // 核心转换逻辑
      let abbr = "";
      let pos = 0;
      
      while (pos < text.length) {
        let matched = false;
        
        // 贪婪匹配最长特例词 (4字 -> 1字)
        for (let len = Math.min(4, text.length - pos); len >= 1; len--) {
          const word = text.slice(pos, pos + len);
          if (SPECIAL_CASES[word]) {
            abbr += SPECIAL_CASES[word];
            pos += len;
            matched = true;
            break;
          }
        }
        
        // 未匹配时处理单字
        if (!matched) {
          const [initial] = pinyin(text[pos], {
            style: pinyin.STYLE_INITIALS,
            heteronym: false
          });
          abbr += initial[0].toUpperCase();
          pos++;
        }
      }

      return new Response(`${abbr}|${text}`, {
        headers: { 
          "Content-Type": "text/plain; charset=utf-8",
          "X-Tecent-Debug": Object.keys(SPECIAL_CASES).join(",") // 调试信息
        }
      });

    } catch (error) {
      return new Response(`错误: ${error.message}`, { 
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  }

  return new Response("接口不存在", { status: 404 });
};

// 启动服务
serve(handler, { port: 8000 });
