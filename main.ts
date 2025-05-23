import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import pinyin from "https://deno.land/x/pinyin/mod.ts";

const processText = (text: string, type: string): string => {
  const processors = {
    upper: () => text.toUpperCase(),
    lower: () => text.toLowerCase(),
    abbreviation: () => {
      const abbr = pinyin(text, {
        style: pinyin.STYLE_INITIALS, // 正确首字母样式
        segment: true,               // 启用分词
        heteronym: false             // 禁用多音字
      }).join('').toUpperCase();
      return `${abbr}|${text}`;
    }
  };

  if (!(type in processors)) throw new Error("Invalid conversion type");
  return processors[type as keyof typeof processors]();
};

serve(handler, { port: 8000 });
