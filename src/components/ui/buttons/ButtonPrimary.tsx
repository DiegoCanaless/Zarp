import React from 'react';

interface ButtonPrimaryOptions {
    text?: string;
    maxWidth?: string;        // Ej: 'max-w-xs'
    height?: string;          // Ej: 'h-10'
    color?: string;           // Ej: 'text-black'
    bgColor?: string;         // Ej: 'bg-[#E2DBBE]' o color hex
    fontSize?: string;        // Ej: 'text-base'
    onClick?: () => void;
    className?: string;
    borderRadius?: string;    // Ej: 'rounded-lg'
    fontWeight?: string;      // Ej: 'font-semibold'
}

export const ButtonPrimary: React.FC<ButtonPrimaryOptions> = ({
    text= 'Iniciar Sesion',
    maxWidth= 'max-w-[120px]',    // Cambia según lo que prefieras
    height= 'h-8',
    fontSize= 'text-xs',
    color = 'text-black',
    bgColor= 'bg-[#E2DBBE]',
    borderRadius = 'rounded-lg',
    fontWeight = 'font-regular',
    onClick = () => {},
    className = '',
}) => {
    // Junta todas las clases de tailwind
    const classes = [
        maxWidth,
        height,
        fontSize,
        color,
        bgColor,
        borderRadius,
        fontWeight,
        className,
        'transition-transform',  // Para hover:scale-105
        'active:scale-95'        // Pequeña animación al click
    ].join(' ');

    return (
        <button className={classes} onClick={onClick}>
            {text}
        </button>
    );
};