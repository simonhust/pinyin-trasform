import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import pinyin from "https://deno.land/x/pinyin/mod.ts";

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  
  if (req.method === "GET" && url.pathname === "/convert") {
    try {
      const text = decodeURIComponent(url.searchParams.get("text") || "");
      if (!text) throw new Error("需要提供text参数");

      // 精确分词转换
      const abbr = pinyin(text, {
        style: pinyin.STYLE_TONE,       // 先获取完整拼音
        segment: true,                // 强制启用分词
        heteronym: false
      })
      .flat()
      .map(p => p.charAt(0).toUpperCase())  // 手动取首字母
      .join('');

      return new Response(`${abbr}|${text}`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
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

serve(handler, { port: 8000 });
