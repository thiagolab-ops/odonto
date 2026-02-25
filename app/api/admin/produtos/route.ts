import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export const dynamic = 'force-dynamic'

async function checkAuth() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    return false
  }
  return true
}

export async function GET() {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        categoryRef: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, price, description, ingredients, imageUrl, category, categoryId, tags, isAvailable } = body

    if (!name || !price || !description || !category) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        name,
        price: parseFloat(price),
        duration: 60,
        description,
        ingredients: ingredients || '',
        imageUrl: imageUrl || '',
        category,
        categoryId: categoryId || null,
        tags: tags || [],
        isVegan: tags?.includes('Vegano') || false,
        isGlutenFree: tags?.includes('Sem Glúten') || false,
        isNew: tags?.includes('Novidade') || false,
        isBestSeller: tags?.includes('Mais Vendido') || false,
        isOffer: tags?.includes('Oferta') || false,
        isAvailable: isAvailable !== false,
      }
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}
