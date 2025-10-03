export async function fetchPropiedadesByCliente(idCliente: number, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const resp = await fetch(`${import.meta.env.VITE_APIBASE}/api/propiedades/cliente/${idCliente}`, { headers })
    if (!resp.ok) return [] // o throw si preferís
    return await resp.json()
}