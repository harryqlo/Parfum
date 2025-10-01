
import { GoogleGenAI } from "@google/genai";
import { Product, Sale, Purchase } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getBusinessInsights = async (
    query: string,
    products: Product[],
    sales: Sale[],
    purchases: Purchase[]
) => {
    if (!process.env.API_KEY) {
        return "Error: API key for Gemini is not configured. Please set the API_KEY environment variable.";
    }

    try {
        const model = 'gemini-2.5-flash';
        
        const prompt = `
            Eres un analista de negocios experto para una tienda de perfumes. Tu tarea es proporcionar información clara y concisa basada en los datos proporcionados y la pregunta del usuario.

            Aquí están los datos actuales del negocio:
            - Inventario de Productos: ${JSON.stringify(products, null, 2)}
            - Historial de Ventas: ${JSON.stringify(sales, null, 2)}
            - Historial de Compras: ${JSON.stringify(purchases, null, 2)}

            Pregunta del usuario: "${query}"

            Basado en los datos, por favor responde la pregunta del usuario. Sé directo, utiliza los datos para respaldar tu respuesta y formatea la salida en un lenguaje fácil de entender para un dueño de negocio. Puedes usar listas o párrafos cortos.
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        
        return response.text;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Hubo un error al contactar al servicio de IA. Por favor, inténtalo de nuevo más tarde.";
    }
};
