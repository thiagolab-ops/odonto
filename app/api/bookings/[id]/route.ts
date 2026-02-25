import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json()
        const { status } = body

        if (!status) {
            return NextResponse.json({ error: 'Status não informado' }, { status: 400 })
        }

        const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
        }

        const booking = await prisma.booking.update({
            where: { id: params.id },
            data: { status }
        })

        return NextResponse.json(booking)
    } catch (error) {
        console.error("ERRO BOOKING UPDATE:", error)
        return NextResponse.json({ error: 'Erro ao atualizar agendamento' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        // Can optionally delete physically or just change status to CANCELLED.
        const booking = await prisma.booking.delete({
            where: { id: params.id }
        })

        return NextResponse.json(booking)
    } catch (error) {
        console.error("ERRO BOOKING DELETE:", error)
        return NextResponse.json({ error: 'Erro ao excluir agendamento' }, { status: 500 })
    }
}
