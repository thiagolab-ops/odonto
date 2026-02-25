import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const tratamentos = await prisma.treatment.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(tratamentos)
    } catch (error) {
        console.error('Erro ao buscar tratamentos:', error)
        return NextResponse.json({ error: 'Erro ao buscar tratamentos' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json()

        const tratamento = await prisma.treatment.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                duration: data.duration || null,
                anesthesia: data.anesthesia || null,
                recovery: data.recovery || null,
                durability: data.durability || null,
                tags: data.tags || [],
                images: data.images || [],
                status: data.status || 'AVAILABLE',
            }
        })

        return NextResponse.json(tratamento)
    } catch (error) {
        console.error('Erro ao criar tratamento:', error)
        return NextResponse.json({ error: 'Erro ao criar tratamento' }, { status: 500 })
    }
}
