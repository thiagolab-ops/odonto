import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const data = await request.json()

        // Parse numeric and array fields
        const year = parseInt(data.year)
        const price = parseFloat(data.price)
        const images = typeof data.images === 'string'
            ? data.images.split(',').map((url: string) => url.trim()).filter((url: string) => url.length > 0)
            : data.images

        const vehicleId = params.id
        const veiculo = await prisma.vehicle.update({
            where: { id: vehicleId },
            data: {
                brand: data.brand,
                model: data.model,
                year,
                price,
                category: data.category,
                description: data.description,
                hasAuction: Boolean(data.hasAuction),
                images: images || [],
                status: data.status,
                technicalSheet: data.technicalSheet || { transmission: '', fuel: '', mileage: '', engine: '' },
            }
        })

        return NextResponse.json(veiculo)
    } catch (error) {
        console.error('Erro ao atualizar veículo:', error)
        return NextResponse.json({ error: 'Erro ao atualizar veículo' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.vehicle.delete({
            where: { id: params.id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Erro ao deletar veículo:', error)
        return NextResponse.json({ error: 'Erro ao deletar veículo' }, { status: 500 })
    }
}
