import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const data = await request.json()
        const treatmentId = params.id

        const tratamento = await prisma.treatment.update({
            where: { id: treatmentId },
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
                status: data.status,
            }
        })

        return NextResponse.json(tratamento)
    } catch (error) {
        console.error('Erro ao atualizar tratamento:', error)
        return NextResponse.json({ error: 'Erro ao atualizar tratamento' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.treatment.delete({
            where: { id: params.id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Erro ao deletar tratamento:', error)
        return NextResponse.json({ error: 'Erro ao deletar tratamento' }, { status: 500 })
    }
}
