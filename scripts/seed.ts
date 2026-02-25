import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados (Luxe Motors)...')

  // Opcional: Não vamos deletar tudo para não apagar o que já foi criado manualmente, 
  // mas vamos garantir que o usuário admin exista usando upsert.

  console.log('Criando usuário administrador...')
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@luxemotors.com' },
    update: {
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      email: 'admin@luxemotors.com',
      name: 'Administrador Luxe',
      password: hashedPassword,
      role: 'admin',
    },
  })

  // Vamos garantir que exista pelo menos uma categoria caso necessário
  const category = await prisma.category.upsert({
    where: { name: 'Sedan' },
    update: {},
    create: {
      name: 'Sedan',
      order: 1,
      isActive: true,
    }
  })

  // Seed de um veículo para teste (opcional, apenas para o catálogo não ficar vazio inicialmente)
  const existingVehicles = await prisma.vehicle.count()
  if (existingVehicles === 0) {
    console.log('Nenhum veículo encontrado. Criando veículo de demonstração...')
    await prisma.vehicle.create({
      data: {
        brand: 'BMW',
        model: '320i M Sport',
        year: 2024,
        price: 315000,
        description: 'Veículo impecável, versão M Sport com pacote completo de tecnologia e conforto.',
        category: 'Sedan',
        status: 'AVAILABLE',
        hasAuction: false,
        images: [
          'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        ],
      }
    })
  }

  console.log('✅ Admin criado:', admin.email)
  console.log('\n🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
