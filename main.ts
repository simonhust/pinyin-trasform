import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import pinyin from "https://deno.land/x/pinyin/mod.ts";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "POST" && req.url.endsWith("/convert")) {
    try {
      const { text, type } = await req.json();
      
      let result = text;
      switch(type) {
        case "upper":
          result = text.toUpperCase();
          break;
        case "lower":
          result = text.toLowerCase();
          break;
        case "abbreviation":  // 新增首字母缩写处理
          const abbreviation = pinyin(text, {
            pattern: 'first',
            toneType: 'none',
            type: 'array'
          }).join('').toUpperCase();
          result = `${abbreviation}|${text}`;
          break;
        default:
          throw new Error("Invalid conversion type");
      }

      return new Response(JSON.stringify({ 
        status: "success",
        result
      }), {
        headers: { "Content-Type": "application/json" }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({
        status: "error",
        message: error.message
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  return new Response("Not Found", { status: 404 });
};

serve(handler, { port: 8000 });
