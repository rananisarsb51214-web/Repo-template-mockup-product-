
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Modality } from "@google/genai";
import { Asset, PlacedLayer } from "../types";

/**
 * Helper to strip the data URL prefix (e.g. "data:image/png;base64,")
 */
const getBase64Data = (dataUrl: string): string => {
  return dataUrl.split(',')[1];
};

/**
 * Generates a product mockup by compositing multiple logos onto a product image.
 */
export const generateMockup = async (
  product: Asset,
  layers: { asset: Asset; placement: PlacedLayer }[],
  instruction: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-image-preview';

    const parts: any[] = [
      {
        inlineData: {
          mimeType: product.mimeType,
          data: getBase64Data(product.data),
        },
      },
    ];

    let layoutHints = "";
    layers.forEach((layer, index) => {
      parts.push({
        inlineData: {
          mimeType: layer.asset.mimeType,
          data: getBase64Data(layer.asset.data),
        },
      });

      const vPos = layer.placement.y < 33 ? "top" : layer.placement.y > 66 ? "bottom" : "center";
      const hPos = layer.placement.x < 33 ? "left" : layer.placement.x > 66 ? "right" : "center";
      
      layoutHints += `\n- Logo ${index + 1}: Render at ${vPos}-${hPos} (relative coordinates: ${Math.round(layer.placement.x)}%, ${Math.round(layer.placement.y)}%). Applied Scale: ${layer.placement.scale.toFixed(2)}.`;
    });

    const finalPrompt = `
    User Instructions: ${instruction || "Place the logo naturally."}
    
    Spatial Layout Hints:
    ${layoutHints}

    System Directives: 
    1. Composite the provided graphics (images 2-${layers.length + 1}) onto the primary product (image 1).
    2. Maintain realistic physical integration: apply displacement maps based on product surface texture (wrinkles, curves, fabric weave).
    3. Match environmental lighting, shadows, and perspective accurately.
    4. Output the final photo-realistic image ONLY.
    `;

    parts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE],
        imageConfig: {
          imageSize: "1K"
        }
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
        for (const part of candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                 return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("Empty visualization returned");
  } catch (error) {
    console.error("Mockup engine error:", error);
    throw error;
  }
};

/**
 * Generates a new logo or product base from scratch using text.
 */
export const generateAsset = async (prompt: string, type: 'logo' | 'product'): Promise<string> => {
   try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-image-preview';
    
    const enhancedPrompt = type === 'logo' 
        ? `A world-class minimalist logo design of a ${prompt}. Single icon isolated on a pure white background. Modern, sleek, professional vector style. High contrast.`
        : `A professional commercial studio photograph of a ${prompt}. Photorealistic, front view, 8k resolution, cinematic lighting, isolated on a neutral gray studio backdrop. Perfect geometry.`;

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [{ text: enhancedPrompt }]
        },
        config: {
            responseModalities: [Modality.IMAGE],
        }
    });

    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
        for (const part of candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                 return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("Asset generation engine failed");
   } catch (error) {
       console.error("Asset generation error:", error);
       throw error;
   }
}

/**
 * Takes a raw AR composite and makes it photorealistic.
 */
export const generateRealtimeComposite = async (
    compositeImageBase64: string,
    prompt: string = "Ensure lighting and perspective match"
  ): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-3-pro-image-preview';
  
      const parts = [
        {
          inlineData: {
            mimeType: 'image/png',
            data: getBase64Data(compositeImageBase64),
          },
        },
        {
          text: `The input is a rough augmented reality preview. 
          Task: ${prompt}. 
          Refine the composite to be indistinguishable from a real photo. 
          Seamlessly blend the overlaid object by matching the background's grain, focal depth, lighting temperature, and contact shadows. 
          Maintain the object's identity while integrating it physically into the scene.
          Return ONLY the final rendered image.`,
        },
      ];
  
      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          responseModalities: [Modality.IMAGE],
          imageConfig: {
            imageSize: "1K"
          }
        },
      });
  
      const candidates = response.candidates;
      if (candidates && candidates[0]?.content?.parts) {
          for (const part of candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                   return `data:image/png;base64,${part.inlineData.data}`;
              }
          }
      }
      throw new Error("Composite refinement failed");
    } catch (error) {
      console.error("Reality blend error:", error);
      throw error;
    }
  };
