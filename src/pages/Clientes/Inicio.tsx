import { MdOutlineSearch, MdTune, MdGroups } from "react-icons/md";
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader";
import { Footer } from "../../components/layout/Footer";
import { useEffect, useMemo, useState } from "react";
import type { PropiedadResponseDTO } from "../../types/entities/propiedad/PropiedadResponseDTO";
import type { TipoPersonaResponseDTO } from "../../types/entities/tipoPersona/TipoPersonaResponseDTO";
import { CardPropiedad } from "../../components/ui/CardPropiedad";
import { FiltrosModal, type SortOrder } from "../../components/ui/modals/FiltrosModal";
import { ViajerosModal } from "../../components/ui/modals/ViajerosModal";
import { useStompTopic } from "../../hooks/useStompTopic";
import type { IMessage } from "@stomp/stompjs";

// ========= Helpers de texto/provincia =========
const normalizeProvincia = (raw?: string) =>
  (raw ?? "").toLowerCase().trim().replaceAll("_", " ").replace(/\s+/g, " ");

const formatProvincia = (raw?: string) =>
  normalizeProvincia(raw)
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const normalizeText = (v?: string | number) =>
  (v ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const getPrecio = (p: PropiedadResponseDTO): number =>
  Number((p as any)?.precioPorNoche) || 0;

// ========= Tipos locales =========
export type ViajerosSeleccion = Record<number, number>;

// ========= Utils WS / estado =========
const safeParse = <T,>(s: string): T | null => {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
};

const pasaReglas = (prop: any) =>
  prop?.activo === true &&
  prop?.propietario?.activo === true &&
  prop?.verificacionPropiedad === "APROBADA";

// raíz del topic; asegurate que coincida con `entidadNombre()` del back:
const TOPIC_ROOT = "/topic/propiedades";
// si en tu back `entidadNombre()` devuelve "propiedad" (singular), usá "/topic/propiedad"

export default function Inicio() {
  const [propiedades, setPropiedades] = useState<PropiedadResponseDTO[]>([]);
  const [search, setSearch] = useState<string>("");

  // sort modal
  const [isFiltrosOpen, setIsFiltrosOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  // viajeros modal (dinámico)
  const [isViajerosOpen, setIsViajerosOpen] = useState(false);
  const [tiposPersona, setTiposPersona] = useState<TipoPersonaResponseDTO[]>([]);
  const [viajerosSel, setViajerosSel] = useState<ViajerosSeleccion>({});

  // ===================== Carga inicial (REST) =====================
  useEffect(() => {
    (async () => {
      try {
        const rProps = await fetch(`${import.meta.env.VITE_APIBASE}/api/propiedades`, {
          credentials: "include",
        });
        const data: PropiedadResponseDTO[] = await rProps.json();
        const activasYAPROBADAS = data.filter((p: any) =>
          p?.activo === true &&
          p?.propietario?.activo === true &&
          p?.verificacionPropiedad === "APROBADA"
        );
        setPropiedades(activasYAPROBADAS);
      } catch (e) {
        console.log("Error cargando propiedades:", e);
      }

      try {
        const rTipos = await fetch(`${import.meta.env.VITE_APIBASE}/api/tipoPersona`, {
          credentials: "include",
        });
        const tipos: TipoPersonaResponseDTO[] = await rTipos.json();

        // 👇 quedate solo con los activos
        const activos = (tipos ?? []).filter((t) => t?.activo === true);
        setTiposPersona(activos);

        // 👇 inicializa/depura el estado de viajeros solo con IDs activos
        setViajerosSel((prev) => {
          const next: ViajerosSeleccion = {};
          activos.forEach((t) => {
            next[t.id] = prev[t.id] ?? 0;
          });
          return next;
        });
      } catch (e) {
        console.log("Error cargando tiposPersona:", e);
      }
    })();
  }, []);

  // Mantener viajerosSel alineado a tiposPersona activos si cambian desde el back (altas/bajas)
  useEffect(() => {
    const activosIds = new Set(tiposPersona.map((t) => t.id));
    setViajerosSel((prev) => {
      const next: ViajerosSeleccion = {};
      // conservar solo claves activas
      Object.entries(prev).forEach(([k, v]) => {
        const id = Number(k);
        if (activosIds.has(id)) next[id] = v || 0;
      });
      // asegurar que existan todas las claves activas (aunque sea en 0)
      tiposPersona.forEach((t) => {
        if (!(t.id in next)) next[t.id] = 0;
      });
      return next;
    });
  }, [tiposPersona]);

  // ===================== Handlers WS =====================
  const handleSave = (prop: PropiedadResponseDTO) => {
    if (!pasaReglas(prop)) return;
    setPropiedades((prev) => (prev.some((p) => p.id === prop.id) ? prev : [...prev, prop]));
  };

  const handleUpdate = (prop: PropiedadResponseDTO) => {
    setPropiedades((prev) => {
      if (!prop) return prev;
      if (!pasaReglas(prop)) return prev.filter((p) => p.id !== prop.id);
      const i = prev.findIndex((p) => p.id === prop.id);
      if (i === -1) return [...prev, prop];
      const next = prev.slice();
      next[i] = prop;
      return next;
    });
  };

  const handleDelete = (body: { id?: number }) => {
    const id = Number(body?.id);
    if (!id) return;
    setPropiedades((prev) => prev.filter((p) => p.id !== id));
  };

  // ===================== Conexión WS (hook) =====================
  useStompTopic({
    wsBaseUrl: `${import.meta.env.VITE_APIBASE}/ws`,
    topics: [`${TOPIC_ROOT}/save`, `${TOPIC_ROOT}/update`, `${TOPIC_ROOT}/delete`],
    onMessage: (topic: string, msg: IMessage) => {
      if (topic.endsWith("/delete")) {
        const payload = safeParse<{ id?: number }>(msg.body);
        if (payload?.id) handleDelete(payload);
        return;
      }
      const prop = safeParse<PropiedadResponseDTO>(msg.body);
      if (!prop) return;
      if (topic.endsWith("/save")) handleSave(prop);
      if (topic.endsWith("/update")) handleUpdate(prop);
    },
    heartbeatMs: 10000,
    reconnectDelayMs: 5000,
  });

  // ===================== Provincias derivadas y filtros =====================
  const provincias = useMemo(() => {
    return Array.from(
      new Set(
        propiedades
          .map((p) => p?.direccion?.provincia)
          .filter((v): v is string => Boolean(v))
          .map((v) => formatProvincia(v))
      )
    ).sort();
  }, [propiedades]);

  const propsPorProvincia = useMemo(() => {
    const grupos: Record<string, PropiedadResponseDTO[]> = {};
    for (const p of propiedades) {
      const provKey = formatProvincia(p?.direccion?.provincia ?? "");
      if (!provKey) continue;
      (grupos[provKey] ??= []).push(p);
    }
    return grupos;
  }, [propiedades]);

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

  // ===================== Solo tipos activos para conteos/filtrado =====================
  const tipoIdsActivos = useMemo(() => new Set(tiposPersona.map((t) => t.id)), [tiposPersona]);

  const viajerosSelActivos = useMemo(() => {
    const out: ViajerosSeleccion = {};
    for (const [k, v] of Object.entries(viajerosSel)) {
      const id = Number(k);
      if (tipoIdsActivos.has(id)) out[id] = v || 0;
    }
    return out;
  }, [viajerosSel, tipoIdsActivos]);

  const totalViajeros = useMemo(
    () => Object.values(viajerosSelActivos).reduce((a, b) => a + (b || 0), 0),
    [viajerosSelActivos]
  );
  const viajerosBadge = totalViajeros > 0 ? `${totalViajeros} viajeros` : "Viajeros";

  const aceptaViajeros = (prop: any) => {
    // pedidos solo de tipos activos con cantidad > 0
    const pedidos = Object.entries(viajerosSelActivos).filter(([_, cant]) => (cant ?? 0) > 0);
    if (pedidos.length === 0) return true;

    // capacidades solo de detalles activos + tipos activos
    const capacidades: Record<number, number> = {};
    (prop?.detalleTipoPersonas ?? []).forEach((d: any) => {
      if (d?.activo === false) return; // ignorá detalle inactivo
      const id = Number(d?.tipoPersona?.id);
      if (!id || !tipoIdsActivos.has(id)) return; // ignorá tipo inactivo
      const cant = Number(d?.cantidad) || 0;
      capacidades[id] = (capacidades[id] || 0) + cant;
    });

    for (const [idStr, cantPedida] of pedidos) {
      const id = Number(idStr);
      const cap = capacidades[id] || 0;
      if (cap < (cantPedida as number)) return false;
    }
    return true;
  };

  const propsPorProvinciaFiltradas = useMemo(() => {
    const match = makeMatcher(search);
    const out: Record<string, PropiedadResponseDTO[]> = {};
    for (const prov of provincias) {
      const base = propsPorProvincia[prov] ?? [];
      const filtradas = base.filter((p) => match(p) && aceptaViajeros(p));
      if (filtradas.length) out[prov] = filtradas;
    }
    return out;
  }, [search, provincias, propsPorProvincia, viajerosSelActivos]);

  const provinciasVisibles = useMemo(
    () => provincias.filter((prov) => (propsPorProvinciaFiltradas[prov]?.length ?? 0) > 0),
    [provincias, propsPorProvinciaFiltradas]
  );

  const sortItems = (items: PropiedadResponseDTO[]) => {
    if (sortOrder === "none") return items;
    const sorted = items.slice().sort((a, b) => getPrecio(a) - getPrecio(b));
    return sortOrder === "asc" ? sorted : sorted.reverse();
  };

  return (
    <>
      <UsuarioHeader />
      <main className="bg-secondary min-h-screen px-5 pt-20 md:px-20">
        {/* Buscador + Botones */}
        <div className="flex gap-2 justify-center items-center">
          <div className="relative w-full max-w-md">
            <input
              type="search"
              name="buscarPropiedad"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2 bg-[#E2DBBE] rounded-lg px-3 pr-10 outline-none no-clear-button placeholder:text-black/60 text-black"
              placeholder="Buscar por nombre, ciudad, provincia…"
            />
            <MdOutlineSearch
              size={20}
              color="black"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            />
          </div>

          <button
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg.white/20 text-white flex items-center gap-1"
            onClick={() => setIsViajerosOpen(true)}
            aria-label="Seleccionar viajeros"
            title="Seleccionar viajeros"
          >
            <MdGroups size={18} />
            <span className="text-sm">{viajerosBadge}</span>
          </button>

          <button
            aria-label="Abrir filtros"
            className="p-2 rounded-lg hover:bg-white/10 transition"
            onClick={() => setIsFiltrosOpen(true)}
          >
            <MdTune size={24} color="white" />
          </button>
        </div>

        <div className="mt-3 flex justify-center gap-3 text-white/80 text-sm">
          {sortOrder !== "none" && (
            <span>Orden: {sortOrder === "asc" ? "Menor→Mayor" : "Mayor→Menor"} precio</span>
          )}
          {totalViajeros > 0 && <span>Viajeros: {totalViajeros}</span>}
        </div>

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
                    <CardPropiedad
                      key={prop.id ?? `${prov}-${prop.nombre}`}
                      propiedad={prop}
                      provincia={prov}
                      onVerMas={(id) => console.log("Ver propiedad", id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {provincias.length > 0 && provinciasVisibles.length === 0 && (
          <p className="text-center text-white/80 mt-10">No encontramos resultados para tus filtros.</p>
        )}
        {provincias.length === 0 && (
          <p className="text-center text-white/80 mt-10">No hay propiedades aprobadas por ahora.</p>
        )}
      </main>

      <Footer />

      <ViajerosModal
        open={isViajerosOpen}
        tiposPersona={tiposPersona} // ya vienen filtrados activos
        valores={viajerosSel}
        onClose={() => setIsViajerosOpen(false)}
        onChange={(next) => setViajerosSel(next)}
      />

      <FiltrosModal
        open={isFiltrosOpen}
        sortOrder={sortOrder}
        onClose={() => setIsFiltrosOpen(false)}
        onChangeOrder={setSortOrder}
      />
    </>
  );
}
