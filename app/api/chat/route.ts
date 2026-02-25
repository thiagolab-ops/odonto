import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Formato de mensagens inválido" }, { status: 400 });
    }

    // Buscar carros disponíveis para o bot ter contexto do estoque real
    const vehicles = await prisma.vehicle.findMany({
      where: { status: "AVAILABLE" },
      select: { brand: true, model: true, year: true, price: true }
    });

    const stockInfo = vehicles.map(v => `${v.brand} ${v.model} (${v.year}) - R$ ${v.price.toLocaleString('pt-BR')}`).join(", ");

    const systemPrompt = {
      role: "system",
      content: `Você é um Consultor de Vendas Premium da concessionária Luxe Motors. 
      Seja extremamente educado, sofisticado, persuasivo e conciso nas suas respostas (1 a 3 parágrafos curtos no máximo). 
      Seu objetivo principal é transparecer autoridade no mercado de luxo e tentar sutilmente convencer o cliente a agendar um Test Drive ou uma Visita à loja.
      Nunca invente carros que não estão no estoque de jeito nenhum.
      Estoque atual disponível na loja agora: ${stockInfo || "Nenhum carro cadastrado no momento"}.
      Se o cliente perguntar se tem um carro X, e não estiver na lista de estoque, diga educadamente que no momento não temos aquela unidade, mas sugira um similar da lista de estoque.
      Se o cliente perguntar sobre financiamento, taxas, ou entrada, diga que temos "condições exclusivas e taxas especiais de financiamento premium" e peça para ele "agendar uma visita presencial para uma simulação personalizada".
      Fale sempre em Português do Brasil de forma muito natural. Não use formatações markdown exageradas (apenas bold para nomes de carros ou preços se necessário).`
    };

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages: [systemPrompt, ...messages],
      temperature: 0.6,
      max_tokens: 500,
    });

    return NextResponse.json({
      message: response.choices?.[0]?.message?.content || "Desculpe, ocorreu um erro de comunicação com nossos servidores de IA."
    });
  } catch (error) {
    console.error("Erro no Chatbot Groq:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao processar o chat" }, { status: 500 });
  }
}
