

interface ButtonPrimaryOptions {
    text?: string;
    maxWidth?: string;
    height?: string;  
    color?: string;  
    bgColor?: string;  
    fontSize?: string;  
    onClick?: () => void;
    className?: string;
    borderRadius?: string;   
    fontWeight?: string;      
}

export const ButtonPrimary: React.FC<ButtonPrimaryOptions> = ({
    text= 'Iniciar Sesion',
    maxWidth= 'max-w-[120px]',
    height= 'h-8',
    fontSize= 'text-xs md:text-sm',
    color = 'text-black',
    bgColor= 'bg-[#E2DBBE]',
    borderRadius = 'rounded-lg',
    fontWeight = 'font-regular',
    onClick = () => {},
    className = '',
}) => {
    const classes = [
        maxWidth,
        height,
        fontSize,
        color,
        bgColor,
        borderRadius,
        fontWeight,
        className,
        'transition-transform',
        'active:scale-95'  
    ].join(' ');

    return (
        <button className={classes} onClick={onClick}>
            {text}
        </button>
    );
};