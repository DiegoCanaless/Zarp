import { MdOutlineSearch, MdTune, MdGroups } from "react-icons/md";
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader";
import { Footer } from "../../components/layout/Footer";
import { useEffect, useMemo, useState } from "react";
import type { PropiedadResponseDTO } from "../../types/entities/propiedad/PropiedadResponseDTO";
import { CardPropiedad } from "../../components/ui/CardPropiedad";
import { FiltrosModal, type SortOrder } from "../../components/ui/modals/FiltrosModal";
// ⬇️ Este ViajerosModal es el dinámico (recibe tiposPersona y un Record<id, cantidad>)
import { ViajerosModal } from "../../components/ui/modals/ViajerosModal";

// ===================== Helpers =====================
const normalizeProvincia = (raw?: string) =>
  (raw ?? "").toLowerCase().trim().replaceAll("_", " ").replace(/\s+/g, " ");

const formatProvincia = (raw: string) =>
  normalizeProvincia(raw)
    .split(" ")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const normalizeText = (v?: string | number) =>
  (v ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

// Precio: en tu ejemplo el campo real es "precioPorNoche"
const getPrecio = (p: PropiedadResponseDTO): number =>
  Number((p as any)?.precioPorNoche) || 0;

// ===================== Tipos =====================
type TipoPersona = {
  id: number;
  activo?: boolean;
  denominacion: string;   // "Adultos" | "Niños" | "Bebes" | "Adolescentes" | etc.
  descripcion?: string;   // "18+ edad", "0-4 años", ...
};

// Mapa { [tipoPersona.id]: cantidadElegida }
type ViajerosSeleccion = Record<number, number>;

// ===================== Componente =====================
export default function Inicio() {
  const [propiedades, setPropiedades] = useState<PropiedadResponseDTO[]>([]);
  const [provincias, setProvincias] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");

  // sort modal
  const [isFiltrosOpen, setIsFiltrosOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  // viajeros modal (dinámico)
  const [isViajerosOpen, setIsViajerosOpen] = useState(false);
  const [tiposPersona, setTiposPersona] = useState<TipoPersona[]>([]);
  const [viajerosSel, setViajerosSel] = useState<ViajerosSeleccion>({});

  // Carga inicial: propiedades + tiposPersona
  useEffect(() => {
    (async () => {
      try {
        const rProps = await fetch("http://localhost:8080/api/propiedades");
        const data: PropiedadResponseDTO[] = await rProps.json();

        // Solo activas + propietario activo + verificación APROBADA
        const activasYAPROBADAS = data.filter(
          (p: any) =>
            p?.activo === true &&
            p?.propietario?.activo === true &&
            p?.verificacionPropiedad === "APROBADA"
        );

        setPropiedades(activasYAPROBADAS);

        const unicas = Array.from(
          new Set(
            activasYAPROBADAS
              .map((p) => p?.direccion?.provincia)
              .filter((v): v is string => Boolean(v))
              .map(formatProvincia)
          )
        ).sort();
        setProvincias(unicas);
      } catch (e) {
        console.log(e);
      }

      try {
        const rTipos = await fetch("http://localhost:8080/api/tipoPersona");
        const tipos: TipoPersona[] = await rTipos.json();
        setTiposPersona(tipos ?? []);

        // Inicializar en 0 cada tipo
        const init: ViajerosSeleccion = {};
        (tipos ?? []).forEach(t => { init[t.id] = 0; });
        setViajerosSel(prev => ({ ...init, ...prev }));
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  // Agrupar todas por provincia
  const propsPorProvincia = useMemo(() => {
    const grupos: Record<string, PropiedadResponseDTO[]> = {};
    for (const p of propiedades) {
      const provKey = formatProvincia(p?.direccion?.provincia ?? "");
      if (!provKey) continue;
      (grupos[provKey] ??= []).push(p);
    }
    return grupos;
  }, [propiedades]);

  // Matcher de búsqueda
  const makeMatcher = (query: string) => {
    const q = normalizeText(query);
    if (!q) return () => true;
    return (prop: PropiedadResponseDTO) => {
      const nombre = normalizeText(prop?.nombre);
      const descripcion = normalizeText((prop as any)?.descripcion);
      const ciudad = normalizeText(prop?.direccion?.localidad ?? prop?.direccion?.ciudad);
      const calle = normalizeText(prop?.direccion?.calle);
      const provinciaRaw = normalizeText(prop?.direccion?.provincia);
      const provinciaFmt = normalizeText(formatProvincia(prop?.direccion?.provincia ?? ""));
      return (
        nombre.includes(q) ||
        descripcion.includes(q) ||
        ciudad.includes(q) ||
        calle.includes(q) ||
        provinciaRaw.includes(q) ||
        provinciaFmt.includes(q)
      );
    };
  };

  // Filtro por viajeros dinámico (match exacto por tipoPersona.id y cantidad)
  // propiedad.detalleTipoPersonas: [{cantidad, tipoPersona:{id,...}}, ...]
  const aceptaViajeros = (prop: any, seleccion: ViajerosSeleccion) => {
    const pedidos = Object.entries(seleccion).filter(([_, cant]) => (cant ?? 0) > 0);
    if (pedidos.length === 0) return true; // sin filtro

    const capacidades: Record<number, number> = {};
    (prop?.detalleTipoPersonas ?? []).forEach((d: any) => {
      const id = Number(d?.tipoPersona?.id);
      const cant = Number(d?.cantidad) || 0;
      if (id) capacidades[id] = (capacidades[id] || 0) + cant; // acumular por seguridad
    });

    for (const [idStr, cantPedida] of pedidos) {
      const id = Number(idStr);
      const cap = capacidades[id] || 0;
      if (cap < (cantPedida as number)) return false;
    }
    return true;
  };

  // Filtro combinado: búsqueda + viajeros
  const propsPorProvinciaFiltradas = useMemo(() => {
    const match = makeMatcher(search);
    const out: Record<string, PropiedadResponseDTO[]> = {};
    for (const prov of provincias) {
      const base = propsPorProvincia[prov] ?? [];
      const filtradas = base.filter(p => match(p) && aceptaViajeros(p, viajerosSel));
      if (filtradas.length) out[prov] = filtradas;
    }
    return out;
  }, [search, provincias, propsPorProvincia, viajerosSel]);

  const provinciasVisibles = useMemo(
    () => provincias.filter(prov => (propsPorProvinciaFiltradas[prov]?.length ?? 0) > 0),
    [provincias, propsPorProvinciaFiltradas]
  );

  // Ordenar items por precio
  const sortItems = (items: PropiedadResponseDTO[]) => {
    if (sortOrder === "none") return items;
    const sorted = items.slice().sort((a, b) => getPrecio(a) - getPrecio(b));
    return sortOrder === "asc" ? sorted : sorted.reverse();
  };

  // Badge viajeros (ej: "3 viajeros" o "Viajeros")
  const totalViajeros = Object.values(viajerosSel).reduce((a, b) => a + (b || 0), 0);
  const viajerosBadge = totalViajeros > 0 ? `${totalViajeros} viajeros` : "Viajeros";

  return (
    <>
      <UsuarioHeader />
      <main className="bg-secondary min-h-screen px-5 pt-20 md:px-20">
        {/* Buscador + Botones */}
        <div className="flex gap-2 justify-center items-center">
          <div className="relative w-full max-w-md">
            <input type="search" name="buscarPropiedad" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full py-2 bg-[#E2DBBE] rounded-lg px-3 pr-10 outline-none no-clear-button placeholder:text-black/60 text-black" placeholder="Buscar por nombre, ciudad, provincia…" />
            <MdOutlineSearch size={20} color="black" className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
          </div>

          {/* Viajeros (dinámico) */}
          <button className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1" onClick={() => setIsViajerosOpen(true)} aria-label="Seleccionar viajeros" title="Seleccionar viajeros" >
            <MdGroups size={18} />
            <span className="text-sm">{viajerosBadge}</span>
          </button>

          {/* Orden / Filtros */}
          <button aria-label="Abrir filtros" className="p-2 rounded-lg hover:bg-white/10 transition" onClick={() => setIsFiltrosOpen(true)} >
            <MdTune size={24} color="white" />
          </button>
        </div>

        {/* Resumen de filtros activos */}
        <div className="mt-3 flex justify-center gap-3 text-white/80 text-sm">
          {sortOrder !== "none" && (
            <span>
              Orden: {sortOrder === "asc" ? "Menor→Mayor" : "Mayor→Menor"} precio
            </span>
          )}
          {totalViajeros > 0 && <span>Viajeros: {totalViajeros}</span>}
        </div>

        {/* Slider por provincia */}
        <div className="mt-8 space-y-10">
          {provinciasVisibles.map((prov) => {
            const items = sortItems(propsPorProvinciaFiltradas[prov] ?? []);
            return (
              <section key={prov}>
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="text-white text-xl font-semibold">{prov}</h2>
                  <span className="text-white/70 text-sm">
                    {items.length} {items.length === 1 ? "propiedad" : "propiedades"}
                  </span>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                  {items.map((prop) => (
                    <CardPropiedad key={prop.id ?? `${prov}-${prop.nombre}`} propiedad={prop} provincia={prov} onVerMas={(id) => console.log("Ver propiedad", id)} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Empty states */}
        {provincias.length > 0 && provinciasVisibles.length === 0 && (
          <p className="text-center text-white/80 mt-10">
            No encontramos resultados para tus filtros.
          </p>
        )}
        {provincias.length === 0 && (
          <p className="text-center text-white/80 mt-10">
            No hay propiedades aprobadas por ahora.
          </p>
        )}
      </main>
      <Footer />

      {/* Modales */}
      <ViajerosModal open={isViajerosOpen} tiposPersona={tiposPersona} valores={viajerosSel} onClose={() => setIsViajerosOpen(false)} onChange={(next) => setViajerosSel(next)} />
      <FiltrosModal open={isFiltrosOpen} sortOrder={sortOrder} onClose={() => setIsFiltrosOpen(false)} onChangeOrder={setSortOrder} />
    </>
  );
}
