import Link from 'next/link'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { VehicleGallery } from './_components/vehicle-gallery'

export default async function VehicleDetailsPage({ params }: { params: { id: string } }) {
    const vehicle = await prisma.vehicle.findUnique({
        where: { id: params.id }
    })

    if (!vehicle) {
        notFound()
    }

    // Since technicalSheet is JSON, we can try to extract specs or use generic ones
    const specs = vehicle.technicalSheet as any || {
        engine: 'Consultar',
        transmission: 'Consultar',
        fuel: 'Flex',
        mileage: '0 km'
    }

    // Default message for whatsapp
    const whatsappMessage = `Olá, vim pelo site e tenho interesse no ${vehicle.brand} ${vehicle.model} - ${vehicle.year}.`
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(whatsappMessage)}`

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-dark text-slate-100 max-w-screen-md mx-auto shadow-2xl">
            {/* Header Transparente */}
            <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 pt-6">
                <Link
                    href="/veiculos"
                    className="flex size-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </Link>
                <Link
                    href="/veiculos?search=focus"
                    className="flex size-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition group"
                    aria-label="Buscar outro veículo"
                >
                    <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors">search</span>
                </Link>
            </header>

            <div className="pt-24 px-4 mb-8">
                <VehicleGallery images={vehicle.images} brand={vehicle.brand} model={vehicle.model} />
            </div>

            {/* Content Area */}
            <main className="flex-1 px-5 pb-32">

                {/* Title and Price */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-surface-dark border border-surface-border text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                            {vehicle.year}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-surface-dark border border-surface-border text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                            {vehicle.category}
                        </span>
                        {vehicle.hasAuction ? (
                            <span className="px-3 py-1 rounded-full bg-red-900/40 border border-red-500/50 text-[10px] font-bold uppercase tracking-wider text-red-400">
                                Passagem por Leilão
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full bg-green-900/40 border border-green-500/50 text-[10px] font-bold uppercase tracking-wider text-green-400">
                                Laudo Aprovado
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl font-black uppercase text-white tracking-tight leading-none mb-4">
                        {vehicle.brand} <span className="font-medium text-text-secondary">{vehicle.model}</span>
                    </h1>

                    <div className="flex flex-col">
                        <span className="text-xs text-text-secondary font-medium uppercase tracking-widest">Preço à vista</span>
                        <span className="font-header text-4xl font-bold text-primary tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price)}
                        </span>
                    </div>
                </div>

                {/* Technical Sheet */}
                <div className="mb-8">
                    <h3 className="text-xs text-text-secondary font-black tracking-widest uppercase mb-4">Ficha Técnica</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-dark border border-surface-border/50">
                            <span className="material-symbols-outlined text-primary text-2xl">settings</span>
                            <div>
                                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Câmbio</p>
                                <p className="text-sm font-semibold text-white">{specs.transmission}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-dark border border-surface-border/50">
                            <span className="material-symbols-outlined text-primary text-2xl">local_gas_station</span>
                            <div>
                                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Combustível</p>
                                <p className="text-sm font-semibold text-white">{specs.fuel}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-dark border border-surface-border/50">
                            <span className="material-symbols-outlined text-primary text-2xl">speed</span>
                            <div>
                                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Quilometragem</p>
                                <p className="text-sm font-semibold text-white">{specs.mileage}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-dark border border-surface-border/50">
                            <span className="material-symbols-outlined text-primary text-2xl">directions_car</span>
                            <div>
                                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Motor</p>
                                <p className="text-sm font-semibold text-white">{specs.engine}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-xs text-text-secondary font-black tracking-widest uppercase mb-4">Sobre o Veículo</h3>
                    <div className="p-5 rounded-2xl bg-surface-dark/50 border border-surface-border/30">
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {vehicle.description}
                        </p>
                    </div>
                </div>
            </main>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-[40] w-full max-w-screen-md mx-auto pointer-events-none">
                <div className="h-10 bg-gradient-to-t from-background-dark to-transparent w-full absolute -top-10" />

                <div className="bg-background-dark/95 backdrop-blur-xl border-t border-surface-border px-4 py-4 pb-6 safely-padding-bottom pointer-events-auto">
                    <div className="flex gap-3 pr-20">
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center shrink-0 w-[60px] h-[60px] rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] transition active:scale-95 shadow-lg shadow-[#25D366]/20"
                        >
                            <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.711.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.418-.099.824z" />
                            </svg>
                        </a>

                        <Link
                            href={`/agendamento?vehicleId=${vehicle.id}`}
                            className="flex-1 flex items-center justify-center rounded-2xl bg-primary hover:bg-primary-dark transition active:scale-[0.98] shadow-[0_0_20px_rgba(245,159,10,0.3)] group"
                        >
                            <span className="text-background-dark font-black text-lg uppercase tracking-tight group-hover:scale-105 transition-transform">
                                Agendar Test Drive
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
