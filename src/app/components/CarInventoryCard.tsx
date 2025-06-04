'use client';
import Image from 'next/image';

interface CarInventoryCardProps {
    image: string;
    name: string;
    year: number;
    modelYear: number;
    status: string;
    priceLabel: string;
}

export default function CarInventoryCard({
    image,
    name,
    year,
    modelYear,
    status,
    priceLabel,
}: CarInventoryCardProps) {
    return (
        <div className="w-full border rounded-xl p-2 shadow-md">
            <div className="rounded overflow-hidden mb-2 aspect-[4/3]">
                <Image
                    src={image}
                    alt={name}
                    width={200}
                    unoptimized
                    height={150}
                    className="w-full h-full object-cover"
                    // If your image URLs are external, add next.config.js config for domains
                />
            </div>
            <div className="text-sm font-semibold truncate">{name}</div>
            <div className="text-xs text-gray-500">Year: {year}</div>
            <div className="text-xs text-gray-500">Model: {modelYear}</div>
            <div
                className={`text-xs mt-1 ${
                    status === 'In Tranzerd' ? 'text-green-600' : 'text-yellow-600'
                } font-semibold`}
            >
                {status}
            </div>
            <div className="text-xs text-right mt-1">{priceLabel}</div>
        </div>
    );
}
