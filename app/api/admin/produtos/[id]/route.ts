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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, price, description, ingredients, imageUrl, category, categoryId, tags, isAvailable } = body

    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        name,
        price: parseFloat(price),
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

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAuth = await checkAuth()
    if (!isAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await prisma.service.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return NextResponse.json({ error: 'Erro ao deletar produto' }, { status: 500 })
  }
}
