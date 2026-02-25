'use client'

import { useState } from 'react'

interface VehicleGalleryProps {
    images: string[]
    brand: string
    model: string
}

export function VehicleGallery({ images, brand, model }: VehicleGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0)

    const displayImages = images.length > 0 ? images : ['https://via.placeholder.com/800x600?text=Sem+Foto']

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Imagem Principal em Destaque */}
            <div className="relative w-full aspect-[4/3] md:aspect-video rounded-2xl overflow-hidden border border-surface-border shadow-lg group">
                <img
                    src={displayImages[activeIndex]}
                    alt={`Visão principal do veículo ${brand} ${model}`}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out"
                />
            </div>

            {/* Carrossel de Miniaturas */}
            {displayImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x px-1 -mx-1">
                    {displayImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`relative shrink-0 w-24 h-16 md:w-32 md:h-20 rounded-xl overflow-hidden snap-center transition-all duration-300 group ${activeIndex === idx
                                    ? "ring-2 ring-primary scale-105 opacity-100 z-10 shadow-[0_0_15px_rgba(245,159,10,0.4)]"
                                    : "border border-surface-border opacity-60 hover:opacity-100 hover:scale-105"
                                }`}
                        >
                            <img
                                src={img}
                                alt={`Miniatura ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay escuro para as inativas */}
                            {activeIndex !== idx && (
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
