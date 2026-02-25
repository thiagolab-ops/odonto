import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // 1. Criação do Admin
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.upsert({
        where: { email: 'admin@odontoprime.com' },
        update: {},
        create: {
            email: 'admin@odontoprime.com',
            name: 'Dr. Admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    // 2. Criação de Tratamentos Fictícios
    const tratamentos = [
        {
            title: "Lentes de Contato Dental",
            description: "Transforme seu sorriso instantaneamente com finas lâminas de porcelana. Ideal para corrigir formato, cor e pequenos alinhamentos.",
            price: 1500.00,
            duration: "2 a 3 sessões",
            anesthesia: "Local",
            recovery: "Imediata",
            durability: "10 a 15 anos",
            tags: ["Estética", "Rápido", "Sem Dor"],
            images: [
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDhsgELqwJc2ZxtmnhbH9KsPTCQh6B5Bxq_X6rtZoaM1GbVWiQ7S_A98_uWMPKN3SJcAa0H2j8-ClzFxL8_Jl-vTdw1OwFfTXAccuR6m0PSTI7DUEE7fo9Zd6ovjseuwsOV_G4gziKlz5eiXguhcTNQ2gJ07AxI3Z6oU7bFMtePhljpvOLqt74DizuVJKuQNKcI1q83h9v9eMopVLyJtnOPOGC_ycgp3saUsKOJddbAATreReayQkpBD-7n6TkjoA1AXhJWCHdSHVQr",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuB1i4ahYkXBe_WQuV83LxYnVe25fkBlRfhAEaq_S1ZAAF1BA8QVdF7kzszKq3XG2sgpaxv8MXnNvIqVeXo6cEOzNeVnZj2fZsWwdILXW3ffXbmo00MDUYzEpzdhXCxqIsQy29thToOlG1jrnua9d3lyk4KVTyrl9n-meFSPNIIb_nMVTOG65dYXsVQO73rq4verc-XOv_TktMsQL-s9F61O1evWQJryxQSWkvEmVv_j3deLkUNxkvOVdWwGjvzHqp5RU3d0v1c3feid"
            ]
        },
        {
            title: "Clareamento a Laser",
            description: "Recupere a brancura natural dos seus dentes com nossa tecnologia a laser de última geração, garantindo conforto e menos sensibilidade.",
            price: 800.00,
            duration: "1 sessão",
            anesthesia: "Nenhuma",
            recovery: "Imediata",
            durability: "1 a 2 anos",
            tags: ["Estética", "Clareamento"],
            images: [
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCukOTOTbp0Rw-HTkeDiF1sUl7qi3KWdmqnxxLKp6twv_VFpoybZXRoFkV_ZHEN1S0cn3csJ9M7FlyGi2Kh2F-URMDOSRA9MUQGd0e-1CeueUkv7kPHUEvy-9VD9PqwqT0D2oQ-716LBti64bVFgA0PifRTooeTK07HUdvWX4x1lCxE_hTlALUq95DIvj7rGiFbMvF34GdS3LLEwyTnRiUyWjAOBiCCqDuD7Wi9NaU4mATdz0r9QmN2MNKyVkURiWy_KlZJcdWHVRFl"
            ]
        },
        {
            title: "Implante Dentário",
            description: "Solução definitiva e natural para reposição de dentes perdidos, utilizando pinos de titânio de altíssima qualidade.",
            price: 2500.00,
            duration: "3 a 6 meses (ciclo total)",
            anesthesia: "Local",
            recovery: "3 a 5 dias",
            durability: "Vitalícia",
            tags: ["Cirurgia", "Reabilitação"],
            images: [
                "https://lh3.googleusercontent.com/aida-public/AB6AXuARRtKX_OfCQUM9If7ZzliEUg3OJmqwAJAMY0YAN9EAV1W0d_fY9X5nzH02hAd8z7dWS3x6hL1AmqB0dHZxW1IYJU3cNiPGsnl_QKKnnAvkp0s4T3lNoY-AbD9AFvcJweducGTI69x7Ti7TYK-JcbWVo1gI5AD29Ktjx15w9YeqHdHTIYjz0xFy78DPM7FJxC9jVhr581ds3t3oaTDGIORpUm8Wp0-9cK-thnoxb2XgEcCNHVwVS1SP4YMwXUwyzN5ijRu0KZ1ZDcLK"
            ]
        }
    ]

    for (const t of tratamentos) {
        await prisma.treatment.create({ data: t })
    }

    console.log('Seed de tratamentos e admin concluído!')
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
