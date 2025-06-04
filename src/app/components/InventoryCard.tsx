import React from 'react'

interface InventoryCardProps {
    title: string
    value: string | number
    className?: string
}

const InventoryCard: React.FC<InventoryCardProps> = ({ title, value, className = '' }) => {
    return (
        <div className={`bg-white p-2 md:p-4 rounded-lg shadow-md flex flex-col items-center justify-center ${className}`}>
            <h2 className="text-xs font-semibold text-blue-700 mb-1 md:mb-2 text-center">{title}</h2>
            <div className="text-xl md:text-3xl font-bold text-gray-900 mt-2 md:mt-5">
                {value}
            </div>
        </div>
    )

}

export default InventoryCard