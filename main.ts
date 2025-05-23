import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import pinyin from "https://deno.land/x/pinyin/mod.ts";

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  
  // 处理GET请求
  if (req.method === "GET" && url.pathname === "/convert") {
    try {
      // 从查询参数获取中文文本（自动解码URL编码）
      const text = url.searchParams.get("text");
      if (!text) throw new Error("Missing text parameter");

      // 执行首字母转换
      const abbr = pinyin(text, {
        style: pinyin.STYLE_INITIALS,
        segment: true
      }).flat().join("").toUpperCase();

      // 直接返回文本结果
      return new Response(`${abbr}|${text}`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });

    } catch (error) {
      return new Response(`ERROR: ${error.message}`, { 
        status: 400,
        headers: { "Content-Type": "text/plain" }
      });
    }
  }

  return new Response("Not Found", { status: 404 });
};

serve(handler, { port: 8000 });
