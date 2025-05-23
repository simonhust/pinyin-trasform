import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import pinyin from "https://deno.land/x/pinyin/mod.ts";

// 核心转换逻辑
const convertToInitials = (text: string): string => {
  return [...text].map(char => {
    // 处理中文字符
    if (/[\u4e00-\u9fa5]/.test(char)) {
      const py = pinyin(char, { style: "FIRST_LETTER" })[0];
      return py ? py[0].toUpperCase() : '';
    }
    // 保留字母数字
    return /[a-zA-Z0-9]/.test(char) ? char.toUpperCase() : '';
  }).join('');
};

// API请求处理
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "POST" && new URL(req.url).pathname === "/convert") {
    try {
      const { text } = await req.json();
      if (!text || typeof text !== "string") throw new Error("Invalid input");
      
      const initials = convertToInitials(text);
      const result = `${initials}|${text}`;

      return new Response(JSON.stringify({ result }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: error.message 
      }), { status: 400 });
    }
  }
  
  return new Response("Not Found", { status: 404 });
};

// 启动服务
serve(handler, { port: 8000 });
