import fs from "fs";
import { GoogleGenAI } from "@google/genai";

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY environment variable is not defined");
    process.exit(1);
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const pdfPath = "./Villa Leopardi - Brand Book.pdf";
  if (!fs.existsSync(pdfPath)) {
    console.error(`PDF not found at ${pdfPath}`);
    process.exit(1);
  }

  console.log("Reading PDF...");
  const pdfBuffer = fs.readFileSync(pdfPath);
  const base64Pdf = pdfBuffer.toString("base64");

  const prompt = `You are a world-class lead UI/UX designer and design system architect.
Analyze the attached "Villa Leopardi - Brand Book.pdf" and extract all the critical styling and design system guidelines.

Exhaustively document:
1. **Color Palette**: Complete listing of primary, secondary, background, and accent colors with their exact Hex/RGB values and their designated roles (e.g., text, buttons, backgrounds, highlights).
2. **Typography**: Font family recommendations, fonts used for headings/displays, body text, subheadings, and specific weights/spacings.
3. **Spacing & Elements**: Grid, borders (e.g. radius, widths), padding/margin styles.
4. **Imagery & Aesthetics**: Mood, visual motifs, image styling (e.g., overlays, borders, aspect ratios).
5. **Key Elements**: Logo application instructions, buttons, cards.

Output a clean Markdown file with exactly this information. Be extremely precise with color Hex codes and font families.`;

  console.log("Generating guidelines via Gemini...");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // We use a fast multimodal model
      contents: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Pdf,
          },
        },
        {
          text: prompt,
        },
      ],
    });

    const markdown = response.text;
    console.log("Guidelines extracted successfully!");
    fs.writeFileSync("./brand_book_guidelines.md", markdown);
    console.log("Guidelines written to ./brand_book_guidelines.md");
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    process.exit(1);
  }
}

run();
