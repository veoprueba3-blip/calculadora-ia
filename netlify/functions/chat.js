// Este es el CÓDIGO para el archivo netlify/functions/chat.js

// Usamos la API de Google directamente para no necesitar instalaciones complicadas.
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

// Esta es la función principal que Netlify ejecutará.
exports.handler = async (event) => {
  // 1. Verificamos que nos hayan enviado una pregunta.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 2. Leemos la pregunta que nos envió el chat del HTML.
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
        return { statusCode: 400, body: 'No se recibió ningún prompt.' };
    }

    // 3. Preparamos el cuerpo de la petición para enviárselo a Gemini.
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 256,
      },
    };

    // 4. Hacemos la llamada a la IA de Google de forma segura desde el servidor.
    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('Error en la API de Google:', errorText);
        throw new Error('La respuesta de la API de Google no fue exitosa.');
    }

    const responseData = await apiResponse.json();

    // 5. Extraemos el texto de la respuesta de Gemini.
    const iaText = responseData.candidates[0].content.parts[0].text;

    // 6. Le devolvemos la respuesta a nuestro chat en el HTML.
    return {
      statusCode: 200,
      body: JSON.stringify({ response: iaText }),
    };

  } catch (error) {
    console.error("Error en la función de Netlify:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Hubo un error al procesar tu pregunta.' }),
    };
  }
};