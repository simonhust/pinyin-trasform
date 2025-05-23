import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import pinyin from "https://deno.land/x/pinyin/mod.ts";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "POST" && new URL(req.url).pathname === "/convert") {
    try {
      const { text, type } = await req.json();
      
      const result = type === "abbreviation" 
        ? pinyin(text, { 
            style: pinyin.STYLE_INITIALS, 
            segment: true 
          }).flat().join('').toUpperCase() + `|${text}`
        : type === "upper" ? text.toUpperCase() 
        : type === "lower" ? text.toLowerCase() 
        : (() => { throw new Error("Invalid type") })();

      return Response.json({ status: "success", result });
      
    } catch (error) {
      return Response.json(
        { status: "error", message: error.message },
        { status: 400 }
      );
    }
  }
  return new Response("Not Found", { status: 404 });
};

serve(handler, { port: 8000 });
