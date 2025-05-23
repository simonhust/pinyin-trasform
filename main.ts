import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import pinyin from "https://deno.land/x/pinyin/mod.ts";

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  
  // 解析转换参数
  if (url.pathname === "/convert") {
    const inputText = decodeURIComponent(url.searchParams.get("text") || url.hash.slice(1));
    
    if (!inputText) {
      return new Response(JSON.stringify({ 
        error: "Missing text parameter",
        example: "/convert?text=重庆森林 或 /convert#重庆森林"
      }), { status: 400 });
    }

    try {
      // 生成首字母缩写
      const abbreviation = pinyin(inputText, { style: "FIRST_LETTER" })
        .map(word => word[0].toUpperCase())
        .join("");

      // 构建返回结果
      const result = {
        original: inputText,
        abbreviation,
        combined: `${abbreviation}|${inputText}`
      };

      return new Response(JSON.stringify({ result }, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: "Conversion failed",
        details: error.message
      }), { status: 500 });
    }
  }

  // 返回使用说明
  return new Response(`
    API Usage Examples:
    1. /convert?text=重庆森林
    2. /convert#重庆森林
    
    Response format: 
    {
      "result": {
        "original": "重庆森林",
        "abbreviation": "CQSL",
        "combined": "CQSL|重庆森林"
      }
    }
  `, { headers: { "Content-Type": text/plain" } });
};

serve(handler, { port: 8000 });
