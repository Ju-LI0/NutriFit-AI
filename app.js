// Gerenciamento da Chave da API do Gemini no Navegador
const apiKeyInput = document.getElementById('apiKeyInput');
const btnSaveKey = document.getElementById('btnSaveKey');

// Recupera a chave de API salva anteriormente no localStorage do navegador
if (localStorage.getItem('GEMINI_KEY')) {
    apiKeyInput.value = localStorage.getItem('GEMINI_KEY');
}

btnSaveKey.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('GEMINI_KEY', key);
        alert('Chave de API salva no navegador com sucesso!');
    } else {
        alert('Por favor, insira uma chave de API válida.');
    }
});

// Função principal para realizar requisições à API do Gemini
async function callGemini(promptText) {
    const apiKey = localStorage.getItem('GEMINI_KEY') || apiKeyInput.value.trim();
    
    if (!apiKey) {
        alert('Insira e salve sua Chave da API do Gemini no bloco do topo antes de continuar!');
        throw new Error("Chave de API ausente.");
    }

    // Endpoint configurado com o modelo gemini-3.6-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("Erro retornado pela API do Gemini:", data.error);
            return `⚠️ Erro da API: ${data.error.message}`;
        }

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Resposta em formato inesperado.");
        }
    } catch (error) {
        console.error("Erro de comunicação com a IA:", error);
        return "❌ Não foi possível se conectar à IA. Verifique sua Chave de API e a conexão de rede.";
    }
}

// Função para simular o efeito de digitação em tempo real convertendo Markdown em HTML
function typeWriterMarkdown(element, rawText, speed = 10) {
    return new Promise((resolve) => {
        let i = 0;
        element.innerHTML = '';
        element.classList.add('typing-cursor');

        function type() {
            if (i < rawText.length) {
                const currentText = rawText.substring(0, i + 1);
                // Converte a string parcial Markdown para HTML formatado via Marked.js
                element.innerHTML = typeof marked !== 'undefined' ? marked.parse(currentText) : currentText;
                i++;
                setTimeout(type, speed);
            } else {
                element.classList.remove('typing-cursor');
                resolve();
            }
        }
        type();
    });
}

// Módulo 1 & 2: Processamento do Formulário Biométrico e Diagnóstico com IA
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const age = document.getElementById('age').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const biotype = document.getElementById('biotype').value;
    const goal = document.getElementById('goal').value;

    const planOutput = document.getElementById('aiPlanOutput');
    const planCard = document.getElementById('aiPlanCard');

    planCard.style.display = 'block';
    planOutput.innerHTML = "<em>Analisando perfil metabólico e gerando estratégia com IA...</em>";

    const prompt = `Atue como um nutricionista esportivo e personal trainer especialista em fisiologia humana e biotipos.
Dados do Cliente:
- Idade: ${age} anos
- Peso: ${weight} kg
- Altura: ${height} cm
- Biotipo Predominante: ${biotype}
- Objetivo: ${goal}

Forneça um relatório detalhado e bem estruturado em Markdown com as seguintes seções:
### 🧬 Análise Genética & Metabólica
- Explicação da resposta metabólica e tolerância a macronutrientes para o biotipo **${biotype}**.

### 📊 Metas Diárias
- **Taxa Metabólica Basal (TMB):** Valor estimado.
- **Calorias Recomendadas:** Meta para o objetivo de ${goal}.
- **Macronutrientes:** Proporção em gramas de Proteínas, Carboidratos e Gorduras.

### 🥗 Sugestão de Plano Alimentar
- **Café da Manhã:** Opção balanceada.
- **Almoço:** Opção balanceada.
- **Lanche:** Opção balanceada.
- **Jantar:** Opção balanceada.

### 🏋️ Recomendação de Treino
- Estímulo, intensidade e frequência ideais para esse perfil biológico.`;

    const rawResult = await callGemini(prompt);
    
    // Executa a animação de escrita com o Markdown formatado
    await typeWriterMarkdown(planOutput, rawResult, 8);
});

// Módulo 3: Diário Alimentar com Análise Rápida em Efeito de Digitação
document.getElementById('logFoodForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const foodInput = document.getElementById('foodInput').value;
    const logOutput = document.getElementById('logOutput');

    const logEntry = document.createElement('div');
    logEntry.className = 'log-item';
    logEntry.innerHTML = `<strong>Refeição:</strong> ${foodInput} <br><em>Calculando nutrientes com IA...</em>`;
    logOutput.prepend(logEntry);

    const promptLog = `Analise este relato de refeição e forneça uma resposta direta formatada em Markdown (no máximo 3 frases):
Refeição enviada: "${foodInput}"
Estime: **Calorias**, **Proteínas**, **Carboidratos** e **Gorduras**, finalizando com uma dica prática para a próxima refeição.`;

    const rawResult = await callGemini(promptLog);
    
    const analysisContainer = document.createElement('div');
    analysisContainer.className = 'markdown-body';
    logEntry.appendChild(analysisContainer);
    
    document.getElementById('foodInput').value = '';
    
    // Aplica o efeito de digitação rápida no card da refeição
    await typeWriterMarkdown(analysisContainer, rawResult, 10);
});