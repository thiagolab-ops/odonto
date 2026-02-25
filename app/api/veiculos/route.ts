import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const veiculos = await prisma.vehicle.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(veiculos)
    } catch (error) {
        console.error('Erro ao buscar veículos:', error)
        return NextResponse.json({ error: 'Erro ao buscar veículos' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json()

        // Parse numeric and array fields
        const year = parseInt(data.year)
        const price = parseFloat(data.price)
        const images = typeof data.images === 'string'
            ? data.images.split(',').map((url: string) => url.trim()).filter((url: string) => url.length > 0)
            : data.images

        const veiculo = await prisma.vehicle.create({
            data: {
                brand: data.brand,
                model: data.model,
                year,
                price,
                category: data.category,
                description: data.description,
                hasAuction: Boolean(data.hasAuction),
                images: images || [],
                status: data.status || 'AVAILABLE',
                technicalSheet: data.technicalSheet || { transmission: '', fuel: '', mileage: '', engine: '' },
            }
        })

        return NextResponse.json(veiculo)
    } catch (error) {
        console.error('Erro ao criar veículo:', error)
        return NextResponse.json({ error: 'Erro ao criar veículo' }, { status: 500 })
    }
}
