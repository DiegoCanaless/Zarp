export async function fetchPropiedadesByCliente(idCliente: number, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const resp = await fetch(`http://localhost:8080/api/propiedades/cliente/${idCliente}`, { headers })
    if (!resp.ok) return [] // o throw si preferís
    return await resp.json()
}