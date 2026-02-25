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

    // Buscar tratamentos disponíveis para o bot ter contexto
    const treatments = await prisma.treatment.findMany({
      where: { status: "AVAILABLE" },
      select: { title: true, price: true, duration: true }
    });

    const stockInfo = treatments.map((t: any) => `${t.title} (${t.duration}) - A partir de R$ ${t.price.toLocaleString('pt-BR')}`).join("\n");

    const systemPrompt = {
      role: "system",
      content: `Você é a Assistente Virtual da clínica OdontoPrime. 
      Seja extremamente educada, acolhedora e empática. 
      Seu objetivo é tirar dúvidas sobre procedimentos odontológicos (lentes, implantes, clareamento, etc), acalmar pacientes que tenham medo de dentista e incentivá-los a agendar uma Avaliação Gratuita.
      Estoque de tratamentos disponíveis: ${stockInfo || "Tratamentos padrão"}.
      Nunca invente preços; diga que os valores exatos são passados na avaliação clínica. 
      Fale em Português do Brasil, de forma clara e natural.`
    };

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
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
