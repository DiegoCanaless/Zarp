interface ContadorProps {
    text: string
    numero?: number
}


export const Contador: React.FC<ContadorProps> = ({text, numero}) => {
    return (
        <div className="flex justify-between w-80 rounded-lg m-auto px-5 py-2 bg-secondary mb-5">
            <p>{text}</p>
            <p>{numero}</p>
        </div>
    )
}






    
