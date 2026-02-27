import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { service, treatmentId, date, customerName, customerPhone } = body

        if (!service || !date || !customerName || !customerPhone) {
            return NextResponse.json({ success: false, error: 'Campos obrigatórios faltando' }, { status: 400 })
        }

        // Check if there is already a booking for this exact date and time (Simple conflict check)
        const existingBooking = await prisma.booking.findFirst({
            where: {
                date: new Date(date),
                status: {
                    in: ['PENDING', 'CONFIRMED']
                }
            }
        })

        if (existingBooking) {
            return NextResponse.json({ error: 'Horário indisponível' }, { status: 422 })
        }

        // Em um sistema real com Auth, buscaríamos o ID do usuário logado.
        // Como o sistema permite visitantes, vamos buscar ou criar um User genérico
        // baseado no telefone ou e-mail, ou permitir userId nulo se o schema deixasse (mas ele exige)

        let user = await prisma.user.findFirst({ where: { email: `${customerPhone}@visitante.com` } })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: customerName,
                    email: `${customerPhone}@visitante.com`,
                    password: 'visitor_password', // Mocked para visitantes que agendam s/ conta
                    role: 'user'
                }
            })
        } else {
            // Atualiza nome se for mesma pessoa
            user = await prisma.user.update({
                where: { id: user.id },
                data: { name: customerName }
            })
        }

        const data: any = {
            userId: user.id,
            service,
            date: new Date(date),
            status: 'PENDING'
        }

        if (treatmentId) {
            data.treatmentId = treatmentId
        }

        const booking = await prisma.booking.create({ data })

        revalidatePath('/admin/dashboard', 'page')
        revalidatePath('/admin/dashboard', 'layout')

        return NextResponse.json({ success: true, booking }, { status: 201 })
    } catch (error) {
        console.error("ERRO AO SALVAR AGENDAMENTO:", error)
        return NextResponse.json({ success: false, error: 'Falha ao salvar no banco de dados', details: String(error) }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const dateStr = searchParams.get('date') // YYYY-MM-DD

        let whereClause: any = {}

        if (status) {
            whereClause.status = status
        }

        if (dateStr) {
            const startOfDay = new Date(dateStr)
            startOfDay.setUTCHours(0, 0, 0, 0)

            const endOfDay = new Date(dateStr)
            endOfDay.setUTCHours(23, 59, 59, 999)

            whereClause.date = {
                gte: startOfDay,
                lte: endOfDay
            }
        }

        const bookings = await prisma.booking.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { name: true, email: true }
                },
                treatment: {
                    select: { title: true, price: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(bookings)
    } catch (error) {
        console.error("ERRO BOOKING GET:", error)
        return NextResponse.json({ error: 'Erro interno ao buscar agendamentos' }, { status: 500 })
    }
}
