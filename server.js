require('dotenv').config(); // Carrega variáveis de ambiente do .env
const express = require('express');
const cors = require('cors'); // Para permitir requisições do teu frontend
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000; // Porta onde o backend vai correr. Podes mudar se 3000 estiver em uso.

// Inicializa o modelo Gemini Flash
// Garante que a chave de API está definida na variável de ambiente
if (!process.env.GEMINI_API_KEY) {
    console.error("Erro: A variável de ambiente GEMINI_API_KEY não está definida. Certifica-te que criaste o ficheiro .env corretamente.");
    process.exit(1); // Sai do processo se a chave não estiver configurada
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Usamos o Gemini 1.5 Flash

// Middleware
app.use(cors()); // Permite que o frontend (que está num URL diferente) aceda ao backend
app.use(express.json()); // Permite que o servidor leia JSON no corpo das requisições

// Endpoint (rota) para o chatbot
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message; // Mensagem enviada pelo frontend

    if (!userMessage) {
        return res.status(400).json({ error: 'Mensagem do utilizador é obrigatória.' });
    }

    try {
        // Este é o 'prompt' que define o comportamento do STEM Buddy para o Gemini Flash
        const prompt = `
        Tu és o STEM Buddy, um assistente educativo simpático e entusiasta especializado em Ciências, Tecnologia, Engenharia e Matemática (STEM).
        O teu objetivo é ajudar estudantes com dúvidas, fornecer informações sobre carreiras STEM e sugerir recursos de estudo.
        Responde de forma clara, encorajadora e usa uma linguagem acessível e didática.
        Sempre que relevante, tenta incluir emojis para tornar a conversa mais dinâmica e amigável.
        Se te perguntarem sobre áreas que não são STEM (e.g., culinária, história não-científica, fofocas), informa educadamente que o teu foco é STEM e redireciona a conversa para tópicos relevantes.
        Usa a minha persona para contextualizar as respostas.

        Pergunta do utilizador: ${userMessage}
        `;

        // Faz a chamada à API do Gemini Flash
        const result = await model.generateContent(prompt);
        const response = await result.response.text(); // Obtém a resposta de texto do Gemini

        // Envia a resposta de volta para o frontend
        res.json({ reply: response });

    } catch (error) {
        console.error('Erro ao comunicar com a API do Gemini:', error);
        // Envia uma mensagem de erro para o frontend
        res.status(500).json({ error: 'Ocorreu um erro ao processar a sua mensagem. Por favor, tente novamente.' });
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`STEM Buddy Backend a correr em http://localhost:${port}`);
});