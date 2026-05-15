/**
 * @krisspy-file
 * @type page
 * @name "StellaTrips"
 * @title "STELLA — Trajets & Voyages"
 * @description "Deux onglets : Trajets urbains et Voyages. Autocomplétion d'adresses Nominatim, calcul d'itinéraire OSRM, carte Leaflet, géolocalisation, lancement Google Maps."
 * @routes ["/trips"]
 * @flowName "App"
 */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StellaNav from '../components/StellaNav';
import { useModes, useApplyModes } from '../lib/stellaModes';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon bug (icons not showing in bundlers)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Colored markers for departure (green) / arrival (coral)
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const coralIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
import {
  ArrowLeft,
  Mic,
  ChevronRight,
  Home as HomeIcon,
  Briefcase,
  Star,
  MapPin,
  Navigation,
  Map as MapIcon,
  Star as StarIcon,
  User,
  Home as HomeNavIcon,
  Droplet,
  Zap,
  Cloud,
  Users,
  Calendar,
  Leaf,
  Bookmark,
  Save,
  ArrowDown,
  Accessibility as AccessibilityIcon,
  Info,
  ShieldCheck,
  Fuel,
  Loader2,
  LocateFixed,
  X,
} from 'lucide-react';

type Tab = 'trajets' | 'voyages';
type Fuel = 'petrol' | 'diesel' | 'electric';
type Level = 'new' | 'standard' | 'experienced' | null;

type Place = {
  id: string;
  icon: 'home' | 'work' | 'star' | 'pin';
  name: string;
  meta: string;
  distance: string;
};

type SavedTrip = {
  id: string;
  from: string;
  to: string;
  distance: string;
  date: string;
};

type Suggestion = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type LatLon = { lat: number; lon: number };

type RouteResult = {
  km: number;
  minutes: number;
  geojson: GeoJSON.LineString;
};

const RECENTS: (Place & { addr: string })[] = [
  { id: 'work', icon: 'work', name: 'La Défense', meta: 'Travail', distance: '12 km', addr: 'La Défense, Puteaux, France' },
  { id: 'home', icon: 'home', name: 'Bastille', meta: 'Maison', distance: '3 km', addr: 'Place de la Bastille, Paris, France' },
  { id: 'fav',  icon: 'star', name: 'Parc de Saint-Cloud', meta: 'Favori', distance: '18 km', addr: 'Parc de Saint-Cloud, France' },
  { id: 'lyon', icon: 'pin',  name: 'Lyon', meta: 'Week-end', distance: '465 km', addr: 'Lyon, France' },
];

const SAVED_TRIPS: SavedTrip[] = [
  { id: 's1', from: 'Paris', to: 'Lyon', distance: '465 km', date: '12 mai' },
  { id: 's2', from: 'Paris', to: 'Deauville', distance: '200 km', date: '28 avril' },
];

const placeIcon = (kind: Place['icon']) => {
  if (kind === 'home') return <HomeIcon size={16} strokeWidth={2.5} />;
  if (kind === 'work') return <Briefcase size={16} strokeWidth={2.5} />;
  if (kind === 'star') return <Star size={16} strokeWidth={2.5} />;
  return <MapPin size={16} strokeWidth={2.5} />;
};

// --- Free API helpers -------------------------------------------------
async function searchAddress(query: string, signal?: AbortSignal): Promise<Suggestion[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=fr&addressdetails=0`;
  const res = await fetch(url, {
    signal,
    headers: { 'Accept-Language': 'fr' },
  });
  if (!res.ok) throw new Error('nominatim failed');
  return (await res.json()) as Suggestion[];
}

async function reverseGeocode(lat: number, lon: number, signal?: AbortSignal): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=0`;
  const res = await fetch(url, { signal, headers: { 'Accept-Language': 'fr' } });
  if (!res.ok) throw new Error('reverse failed');
  const data = await res.json();
  return data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

async function geocodeOnce(query: string, signal?: AbortSignal): Promise<LatLon | null> {
  const results = await searchAddress(query, signal);
  if (!results.length) return null;
  return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
}

async function fetchRoute(from: LatLon, to: LatLon, signal?: AbortSignal): Promise<RouteResult> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('osrm failed');
  const data = await res.json();
  const r = data.routes?.[0];
  if (!r) throw new Error('no route');
  return {
    km: r.distance / 1000,
    minutes: r.duration / 60,
    geojson: r.geometry as GeoJSON.LineString,
  };
}
// ----------------------------------------------------------------------

const formatDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
};

// Jeep Avenger Electric approximation
const ELEC_CONSO_KWH_PER_100KM = 17;
const ELEC_PRICE_PER_KWH = 0.33;
const ELEC_CO2_G_PER_KM = 55; // mix électrique français ~ 60 g/km
const PETROL_COST_PER_KM = 0.14;
const PETROL_CO2 = 180;
const DIESEL_COST_PER_KM = 0.11;
const DIESEL_CO2 = 150;

function costForKm(km: number, fuel: Fuel) {
  if (fuel === 'electric') return Math.round((km * ELEC_CONSO_KWH_PER_100KM / 100) * ELEC_PRICE_PER_KWH);
  if (fuel === 'diesel') return Math.round(km * DIESEL_COST_PER_KM);
  return Math.round(km * PETROL_COST_PER_KM);
}

function co2ForKm(km: number, fuel: Fuel) {
  const gPerKm = fuel === 'electric' ? ELEC_CO2_G_PER_KM : fuel === 'diesel' ? DIESEL_CO2 : PETROL_CO2;
  return Math.round((km * gPerKm) / 1000);
}

// ============================================================
// AddressInput — controlled input with Nominatim autocomplete
// ============================================================
type AddressInputProps = {
  value: string;
  onChange: (v: string) => void;
  onPick: (addr: string, coord?: LatLon) => void;
  placeholder: string;
  icon: React.ReactNode;
  label: string;
  showLocate?: boolean;
  onLocate?: () => void;
  locating?: boolean;
  showMic?: boolean;
  onMic?: () => void;
};

const AddressInput: React.FC<AddressInputProps> = ({
  value, onChange, onPick, placeholder, icon, label,
  showLocate, onLocate, locating, showMic, onMic,
}) => {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);
  const justPickedRef = useRef(false);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (justPickedRef.current) {
      justPickedRef.current = false;
      setOpen(false);
      setSuggestions([]);
      return;
    }
    const q = value.trim();
    if (q.length < 3) {
      if (abortRef.current) abortRef.current.abort();
      setSuggestions([]);
      setLoading(false);
      setOpen(false);
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const s = await searchAddress(q, ctrl.signal);
        setSuggestions(s);
        setOpen(true);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [value]);

  const handlePick = (s: Suggestion) => {
    justPickedRef.current = true;
    onChange(s.display_name);
    onPick(s.display_name, { lat: parseFloat(s.lat), lon: parseFloat(s.lon) });
    setOpen(false);
    setSuggestions([]);
    inputRef.current?.blur();
  };

  // Auto-select first suggestion; if none cached yet, fetch on demand.
  const autoSelectFirst = useCallback(async () => {
    const q = value.trim();
    if (q.length < 3) return;
    if (suggestions.length > 0) {
      handlePick(suggestions[0]);
      return;
    }
    // No cached suggestions yet — fetch synchronously
    try {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      const s = await searchAddress(q, ctrl.signal);
      setLoading(false);
      if (s.length > 0) handlePick(s[0]);
    } catch {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void autoSelectFirst();
    }
  };

  const handleBlur = () => {
    // Give the mousedown on the suggestion list a chance to fire first.
    window.setTimeout(() => {
      if (justPickedRef.current) return;
      if (suggestions.length > 0 && value.trim().length >= 3) {
        handlePick(suggestions[0]);
      }
    }, 150);
  };

  return (
    <div className="tv-addr-wrap" ref={wrapRef}>
      <div className="tv-field-card">
        <span className="tv-field-ico">{icon}</span>
        <div className="tv-field-body">
          <span className="tv-field-label">{label}</span>
          <input
            ref={inputRef}
            type="text"
            className="tv-field-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            aria-label={label}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        {loading && <Loader2 size={14} strokeWidth={2.5} className="tv-input-spin" />}
        {!loading && value.length > 0 && (
          <button
            type="button"
            className="tv-input-clear"
            onClick={() => { onChange(''); onPick(''); setSuggestions([]); setOpen(false); }}
            aria-label="Effacer"
          >
            <X size={13} strokeWidth={2.8} />
          </button>
        )}
        {showLocate && (
          <button
            type="button"
            className="tv-input-locate"
            onClick={onLocate}
            aria-label="Utiliser ma position"
            disabled={locating}
          >
            {locating
              ? <Loader2 size={14} strokeWidth={2.5} className="tv-input-spin" />
              : <LocateFixed size={14} strokeWidth={2.5} />}
          </button>
        )}
        {showMic && (
          <button
            type="button"
            className="tv-mic-inline"
            onClick={onMic}
            aria-label="Dicter"
          >
            <Mic size={15} strokeWidth={2.5} />
          </button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="tv-suggest" role="listbox">
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              type="button"
              role="option"
              className="tv-suggest-row"
              onClick={() => handlePick(s)}
            >
              <span className="tv-suggest-ico"><MapPin size={13} strokeWidth={2.5} /></span>
              <span className="tv-suggest-text">{s.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// LeafletMap — lazy leaflet mount + route drawing
// ============================================================
type LeafletMapProps = {
  height?: number;
  from?: LatLon | null;
  to?: LatLon | null;
  route?: GeoJSON.LineString | null;
  label?: string;
};

const LeafletMap: React.FC<LeafletMapProps> = ({ height = 220, from, to, route, label }) => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const fromMarkerRef = useRef<L.Marker | null>(null);
  const toMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;
    const map = L.map(mapDivRef.current, {
      zoomControl: false,
      attributionControl: true,
      dragging: true,
      scrollWheelZoom: false,
      doubleClickZoom: true,
      touchZoom: true,
    }).setView([48.8566, 2.3522], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OSM',
    }).addTo(map);
    mapRef.current = map;

    // Force correct size after container becomes visible
    const t = window.setTimeout(() => {
      try { map.invalidateSize(); } catch { /* noop */ }
    }, 300);

    return () => {
      window.clearTimeout(t);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-validate size whenever height or key props change (e.g. tab switch)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const t = window.setTimeout(() => {
      try { map.invalidateSize(); } catch { /* noop */ }
    }, 300);
    return () => window.clearTimeout(t);
  }, [height, from, to, route]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Departure marker (green)
    if (fromMarkerRef.current) { fromMarkerRef.current.remove(); fromMarkerRef.current = null; }
    if (from) {
      fromMarkerRef.current = L.marker([from.lat, from.lon], { icon: greenIcon })
        .addTo(map)
        .bindPopup('Départ');
    }

    // Arrival marker (coral)
    if (toMarkerRef.current) { toMarkerRef.current.remove(); toMarkerRef.current = null; }
    if (to) {
      toMarkerRef.current = L.marker([to.lat, to.lon], { icon: coralIcon })
        .addTo(map)
        .bindPopup('Arrivée');
    }

    // Route polyline — forced chained sequence so it renders after the container resizes
    if (routeLayerRef.current) { routeLayerRef.current.remove(); routeLayerRef.current = null; }
    if (route && route.coordinates && route.coordinates.length > 0) {
      const latlngs = route.coordinates.map(([lon, lat]) => [lat, lon] as [number, number]);
      const line = L.polyline(latlngs, {
        color: '#FF7A70',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      });
      window.setTimeout(() => {
        try { map.invalidateSize(); } catch { /* noop */ }
        window.setTimeout(() => {
          try {
            line.addTo(map);
            routeLayerRef.current = line;
            const bounds = line.getBounds();
            if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
          } catch { /* noop */ }
        }, 100);
      }, 200);
    } else if (from && to) {
      const g = L.featureGroup([
        L.marker([from.lat, from.lon]),
        L.marker([to.lat, to.lon]),
      ]);
      map.fitBounds(g.getBounds(), { padding: [32, 32] });
    } else if (from) {
      map.setView([from.lat, from.lon], 12);
    } else if (to) {
      map.setView([to.lat, to.lon], 12);
    }
  }, [from, to, route]);

  return (
    <div className="tv-leaflet-wrap" style={{ height, width: '100%' }}>
      {label && (
        <span className="tv-map-label">
          <MapIcon size={11} strokeWidth={2.8} />
          {label}
        </span>
      )}
      <div ref={mapDivRef} className="tv-leaflet" style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

// ============================================================
// Page
// ============================================================
const StellaTrips: React.FC = () => {
  const navigate = useNavigate();
  useApplyModes();
  const { modes } = useModes();
  const [tab, setTab] = useState<Tab>('trajets');

  // Tab 1 state
  const [t1From, setT1From] = useState<string>('');
  const [t1FromCoord, setT1FromCoord] = useState<LatLon | null>(null);
  const [t1To, setT1To] = useState<string>('');
  const [t1ToCoord, setT1ToCoord] = useState<LatLon | null>(null);

  // Tab 2 state
  const [t2From, setT2From] = useState<string>('');
  const [t2FromCoord, setT2FromCoord] = useState<LatLon | null>(null);
  const [t2To, setT2To] = useState<string>('');
  const [t2ToCoord, setT2ToCoord] = useState<LatLon | null>(null);
  const [date, setDate] = useState('12 mai');
  const [passengers, setPassengers] = useState(2);
  const [fuel, setFuel] = useState<Fuel>('electric');
  const [planned, setPlanned] = useState(false);

  // Loading / result
  const [locating, setLocating] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const routeAbortRef = useRef<AbortController | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const nickname = useMemo(() => {
    try {
      const stored = (window.sessionStorage.getItem('stella:nickname') || '').trim();
      if (stored) return stored;
    } catch { /* noop */ }
    return 'toi';
  }, []);

  const vehicleName = useMemo(() => {
    try {
      const raw = window.sessionStorage.getItem('stella:vehicle');
      if (raw) {
        const v = JSON.parse(raw) as { brand?: string; model?: string };
        return [v.brand, v.model].filter(Boolean).join(' ') || 'ton véhicule';
      }
    } catch { /* noop */ }
    return 'Jeep Avenger';
  }, []);

  const [profile] = useState<{ level: Level; accessibility: boolean }>(() => {
    let level: Level = 'standard';
    let acc = false;
    try {
      const l = window.sessionStorage.getItem('stella:level');
      if (l === 'new' || l === 'standard' || l === 'experienced') level = l;
      acc = window.sessionStorage.getItem('stella:accessibility') === '1';
    } catch { /* noop */ }
    return { level, accessibility: acc };
  });

  const isNew = profile.level === 'new';
  const a11y = profile.accessibility;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      if (routeAbortRef.current) routeAbortRef.current.abort();
    };
  }, []);

  // Auto-calculate route whenever both ends are set (Tab 1 and Tab 2)
  const activeFromCoord = tab === 'trajets' ? t1FromCoord : t2FromCoord;
  const activeToCoord = tab === 'trajets' ? t1ToCoord : t2ToCoord;

  useEffect(() => {
    if (!activeFromCoord || !activeToCoord) {
      setRoute(null);
      setRouteError(null);
      return;
    }
    if (routeAbortRef.current) routeAbortRef.current.abort();
    const ctrl = new AbortController();
    routeAbortRef.current = ctrl;
    setRouteLoading(true);
    setRouteError(null);
    fetchRoute(activeFromCoord, activeToCoord, ctrl.signal)
      .then((r) => { setRoute(r); setRouteLoading(false); })
      .catch((e) => {
        if ((e as Error).name !== 'AbortError') {
          setRouteError('Impossible de calculer l\'itinéraire');
          setRoute(null);
          setRouteLoading(false);
        }
      });
  }, [activeFromCoord, activeToCoord]);

  const handleLocate = async (which: 'tab1' | 'tab2') => {
    if (!navigator.geolocation) {
      showToast('Géolocalisation indisponible');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coord = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        let addr = `${coord.lat.toFixed(5)}, ${coord.lon.toFixed(5)}`;
        try { addr = await reverseGeocode(coord.lat, coord.lon); } catch { /* keep coords */ }
        if (which === 'tab1') { setT1From(addr); setT1FromCoord(coord); }
        else { setT2From(addr); setT2FromCoord(coord); }
        setLocating(false);
        showToast('Position actuelle récupérée');
      },
      () => {
        setLocating(false);
        showToast('Impossible d\'obtenir ta position');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  };

  const handleRecent = async (r: (Place & { addr: string })) => {
    // Ensure Départ is filled (default = current position if available, else Paris)
    if (!t1FromCoord) {
      const parisAddr = 'Paris, France';
      const coord = await geocodeOnce(parisAddr);
      setT1From(parisAddr);
      setT1FromCoord(coord);
    }
    const coord = await geocodeOnce(r.addr);
    setT1To(r.addr);
    setT1ToCoord(coord);
  };

  const handleVoice = () => {
    setT1To('La Défense, Puteaux, France');
    geocodeOnce('La Défense, Puteaux, France').then(setT1ToCoord);
    showToast('Reconnaissance vocale — La Défense');
  };

  const handlePlan = () => {
    if (!t2FromCoord || !t2ToCoord) return;
    setPlanned(true);
  };

  const handleReset = () => {
    setPlanned(false);
    setT2To('');
    setT2ToCoord(null);
    setRoute(null);
    setRouteError(null);
    setActionResult(null);
  };

  const launchNavigation = (fromAddr: string, toAddr: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(fromAddr)}&destination=${encodeURIComponent(toAddr)}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Result slot under the quick actions — each action populates a rich card
  type ActionResult =
    | null
    | { kind: 'banner'; tone: 'green' | 'coral'; text: string }
    | { kind: 'card'; icon: string; title: string; meta: string; points?: number }
    | { kind: 'addStop' };
  const [actionResult, setActionResult] = useState<ActionResult>(null);
  const [addStopValue, setAddStopValue] = useState('');

  const awardPoints = (n: number) =>
    showToast(`🎉 +${n} points ajoutés à ton compte Stella !`);

  const runAction = (id: string) => {
    if (id === 'ask') {
      try {
        window.sessionStorage.setItem(
          'stella:copilot_seed',
          `Je prépare un trajet ${t2From || t1From || ''} → ${t2To || t1To || ''}. Donne-moi ton meilleur conseil.`
        );
      } catch { /* noop */ }
      navigate('/copilot');
      return;
    }
    if (id === 'avoid') {
      setActionResult({ kind: 'banner', tone: 'green', text: '✅ Itinéraire recalculé — trafic évité. Gain estimé : 12 min' });
      return;
    }
    if (id === 'parking') {
      setActionResult({ kind: 'card', icon: '🅿️', title: 'Indigo La Défense', meta: '4 places EV disponibles · 5–7 € · 3 min à pied', points: 40 });
      return;
    }
    if (id === 'eco') {
      setActionResult({ kind: 'card', icon: '🌿', title: 'Itinéraire éco sélectionné', meta: '38 min · économie CO₂ estimée : 8%', points: 30 });
      return;
    }
    if (id === 'charge') {
      setActionResult({ kind: 'card', icon: '⚡', title: "Belib' La Défense", meta: `Recharge rapide compatible ${vehicleName}`, points: 25 });
      return;
    }
    if (id === 'opt_charge') {
      setActionResult({ kind: 'card', icon: '⚡', title: 'Stratégie optimisée', meta: '1 arrêt IONITY Orléans · économie estimée 6–8 €', points: 80 });
      return;
    }
    if (id === 'no_toll') {
      setActionResult({ kind: 'banner', tone: 'green', text: '✅ Itinéraire sans péage calculé — +22 min · économie péages : ~18 €' });
      return;
    }
    if (id === 'add_stop') {
      setActionResult({ kind: 'addStop' });
      return;
    }
  };

  const confirmAddStop = () => {
    const v = addStopValue.trim();
    if (!v) return;
    setActionResult({ kind: 'banner', tone: 'green', text: `✅ Arrêt "${v}" ajouté à ton itinéraire` });
    setAddStopValue('');
  };

  // Derived metrics for Tab 2 results
  const metrics = useMemo(() => {
    if (!route) return null;
    const km = Math.round(route.km);
    const cost = costForKm(km, fuel);
    const perPax = Math.max(1, Math.round(cost / Math.max(passengers, 1)));
    const co2 = co2ForKm(km, fuel);
    return {
      km,
      duration: formatDuration(route.minutes),
      cost,
      perPax,
      co2,
      costLabel: fuel === 'electric' ? 'Recharge' : 'Carburant',
      co2Label: fuel === 'electric' ? 'Émissions estimées (électrique)' : 'Émissions estimées',
    };
  }, [route, fuel, passengers]);

  const trajetsSubtitle = useMemo(() => {
    const base = isNew
      ? 'Stella te propose l\'itinéraire le plus simple et le mieux éclairé 💡'
      : 'Trafic modéré à Paris. Itinéraire plus rapide via l\'A86.';
    return a11y ? `${base} · Arrêts accessibles PMR privilégiés ♿` : base;
  }, [isNew, a11y]);

  const voyagesSubtitle = useMemo(() => {
    return isNew
      ? 'Stella prépare ton voyage étape par étape 🗺️'
      : 'Organisez votre prochain trajet';
  }, [isNew]);

  const partnerStops = useMemo(() => {
    const base = [
      { id: 'p1', kind: 'food' as const, emoji: '🍽️', name: 'Le Petit Bistrot', category: 'Français traditionnel', rating: 4.6, distance: '0.3 km', price: null as string | null, points: 50, accessible: true },
      { id: 'p2', kind: 'charge' as const, emoji: '⚡', name: 'Ionity Charging Hub', category: 'Recharge rapide', rating: 4.8, distance: '1.2 km', price: null as string | null, points: 80, accessible: true },
      { id: 'p3', kind: 'food' as const, emoji: '🍕', name: 'Pizzeria Luigi', category: 'Italien', rating: 4.7, distance: '2.8 km', price: null as string | null, points: 50, accessible: false },
      { id: 'p4', kind: 'hotel' as const, emoji: '🏨', name: 'Ibis Budget', category: 'Hôtel', rating: 4.1, distance: '120 km', price: 'À partir de 55€/nuit', points: 100, accessible: true },
      { id: 'p5', kind: 'hotel' as const, emoji: '🏨', name: 'Novotel', category: 'Hôtel', rating: 4.5, distance: '380 km', price: 'À partir de 98€/nuit', points: 150, accessible: true },
    ];
    return a11y ? base.filter((s) => s.accessible) : base;
  }, [a11y]);

  const t2CanPlan = Boolean(t2FromCoord && t2ToCoord);

  const quickActions = (variant: 'city' | 'long') => {
    const cityActions = [
      { id: 'avoid',   label: 'Éviter le trafic' },
      { id: 'parking', label: 'Trouver un parking' },
      { id: 'eco',     label: 'Itinéraire éco' },
      { id: 'charge',  label: 'Trouver une borne' },
      { id: 'ask',     label: 'Demander à STELLA' },
    ];
    const longActions = [
      { id: 'opt_charge', label: 'Optimiser la recharge' },
      { id: 'no_toll',    label: 'Éviter les péages' },
      { id: 'add_stop',   label: 'Ajouter un arrêt' },
      { id: 'eco',        label: 'Itinéraire éco' },
      { id: 'ask',        label: 'Demander à STELLA' },
    ];
    const actions = variant === 'city' ? cityActions : longActions;
    return (
      <>
        <div className="tv-qa-row">
          {actions.map((a) => (
            <button
              key={a.id}
              type="button"
              className="tv-qa-chip"
              onClick={() => runAction(a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>
        {actionResult && (
          <>
            {actionResult.kind === 'banner' && (
              <div className={`tv-result-banner ${actionResult.tone}`} role="status">
                <span>{actionResult.text}</span>
              </div>
            )}
            {actionResult.kind === 'card' && (
              <div className="tv-result-card">
                <span className="tv-result-emoji">{actionResult.icon}</span>
                <div className="tv-result-body">
                  <span className="tv-result-title">{actionResult.title}</span>
                  <span className="tv-result-meta">{actionResult.meta}</span>
                </div>
                {actionResult.points !== undefined && (
                  <button
                    type="button"
                    className="tv-result-points"
                    onClick={() => awardPoints(actionResult.points as number)}
                    aria-label="Collecter les points"
                  >
                    +{actionResult.points} pts
                  </button>
                )}
              </div>
            )}
            {actionResult.kind === 'addStop' && (
              <div className="tv-add-stop-card">
                <span className="tv-add-stop-label">Ajouter un arrêt sur votre route</span>
                <form
                  className="tv-add-stop-row"
                  onSubmit={(e) => { e.preventDefault(); confirmAddStop(); }}
                >
                  <input
                    type="text"
                    className="tv-add-stop-input"
                    value={addStopValue}
                    onChange={(e) => setAddStopValue(e.target.value)}
                    placeholder="Ex : Fontainebleau, aire de service…"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="tv-add-stop-confirm"
                    disabled={!addStopValue.trim()}
                  >
                    Confirmer
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <>
      <style>{`
        .tv-root * { box-sizing: border-box; }
        .tv-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
          position: relative; overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .tv-blobs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .tv-blobs::before, .tv-blobs::after {
          content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.45;
        }
        .tv-blobs::before {
          width: 320px; height: 320px;
          background: radial-gradient(circle, #FFB5A7 0%, transparent 70%);
          top: -80px; right: -80px;
        }
        .tv-blobs::after {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #D4C5F3 0%, transparent 70%);
          bottom: 10%; left: -100px;
        }
        .tv-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 16px 20px 108px;
          display: flex; flex-direction: column; gap: 16px;
          position: relative; z-index: 1;
        }

        .tv-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .tv-back {
          display: inline-flex; align-items: center; gap: 6px;
          border: none; background: rgba(255,255,255,0.7);
          color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px;
          cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06);
          transition: background 180ms ease, transform 150ms ease;
          backdrop-filter: blur(8px);
        }
        .tv-back:hover { background: #FFF; }
        .tv-back:active { transform: scale(0.97); }

        .tv-profile-chips { display: flex; gap: 6px; }
        .tv-profile-chip {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.3px;
          padding: 5px 10px; border-radius: 50px;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(26,26,46,0.05);
          color: #1A1A2E;
          backdrop-filter: blur(8px);
        }
        .tv-profile-chip.a11y { background: rgba(107,78,155,0.12); color: #6B4E9B; border-color: rgba(107,78,155,0.25); }

        .tv-tabs {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 4px; padding: 4px;
          background: rgba(255,255,255,0.75);
          border-radius: 50px;
          backdrop-filter: blur(10px);
          box-shadow: 0 6px 16px rgba(26,26,46,0.06);
          border: 1px solid rgba(26,26,46,0.04);
        }
        .tv-tab {
          border: none; background: transparent;
          font-family: inherit; font-size: 13px; font-weight: 800;
          color: #8A7A7A;
          padding: 10px 14px; border-radius: 50px;
          cursor: pointer;
          letter-spacing: 0.2px;
          transition: all 200ms ease;
        }
        .tv-tab.active {
          background: linear-gradient(135deg, #FF7A70 0%, #F26158 100%);
          color: #FFF;
          box-shadow: 0 6px 14px rgba(255,122,112,0.38);
        }
        .tv-tabs.voyages .tv-tab.active {
          background: linear-gradient(135deg, #7B5CAF 0%, #6B4E9B 100%);
          box-shadow: 0 6px 14px rgba(107,78,155,0.35);
        }

        .tv-mark {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          font-size: 11px; font-weight: 800; letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #FF7A70; padding: 5px 12px;
          background: rgba(255,122,112,0.1); border-radius: 50px;
        }
        .tv-h1 {
          font-size: 24px; font-weight: 900; line-height: 1.2;
          letter-spacing: -0.4px; color: #1A1A2E;
          margin: 6px 0 4px;
        }
        .tv-sub {
          font-size: 14px; font-weight: 500;
          color: #8A7A7A; line-height: 1.5; margin: 0;
        }

        /* Address field cards */
        .tv-fields { display: flex; flex-direction: column; gap: 10px; position: relative; }
        .tv-fields-top { position: relative; z-index: 10; }
        .tv-addr-wrap { position: relative; }
        .tv-map-slot { position: relative; z-index: 1; }
        .tv-field-card {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px;
          padding: 0 10px 0 14px;
          min-height: 52px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 6px 16px rgba(26,26,46,0.05);
          transition: border-color 180ms ease, box-shadow 180ms ease;
        }
        .tv-field-card:focus-within {
          border-color: #FF7A70;
          box-shadow: 0 10px 22px rgba(255,122,112,0.15);
        }
        .tv-field-ico {
          flex-shrink: 0;
          width: 28px; height: 28px; border-radius: 9px;
          background: #FFE6E3; color: #FF7A70;
          display: flex; align-items: center; justify-content: center;
        }
        .tv-field-ico.purple { background: #EEE7F7; color: #6B4E9B; }
        .tv-field-body { flex: 1; display: flex; flex-direction: column; gap: 0; min-width: 0; }
        .tv-field-label {
          font-size: 10px; font-weight: 800; letter-spacing: 0.5px;
          text-transform: uppercase; color: #8A7A7A;
          line-height: 1.2;
        }
        .tv-field-input {
          border: none; outline: none; background: transparent;
          font-family: inherit; font-size: 13.5px; font-weight: 700;
          color: #1A1A2E;
          padding: 2px 0;
          min-width: 0;
          width: 100%;
        }
        .tv-field-input::placeholder { color: #B8ACAC; font-weight: 500; }

        .tv-input-spin { color: #FF7A70; animation: tv-spin 1s linear infinite; flex-shrink: 0; }
        @keyframes tv-spin { to { transform: rotate(360deg); } }

        .tv-input-clear {
          flex-shrink: 0; border: none;
          width: 24px; height: 24px; border-radius: 50%;
          background: rgba(26,26,46,0.06);
          color: #8A7A7A;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .tv-input-clear:hover { background: rgba(26,26,46,0.12); color: #1A1A2E; }

        .tv-input-locate {
          flex-shrink: 0; border: none;
          width: 34px; height: 34px; border-radius: 50%;
          background: #EEE7F7; color: #6B4E9B;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 150ms ease;
        }
        .tv-input-locate:hover { background: #DFD1F5; }
        .tv-input-locate:disabled { opacity: 0.6; cursor: wait; }

        .tv-mic-inline {
          flex-shrink: 0; border: none;
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #FF7A70 0%, #F26158 100%);
          color: #FFF;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(255,122,112,0.35);
          transition: transform 150ms ease;
        }
        .tv-mic-inline:active { transform: scale(0.94); }

        .tv-arrow-sep {
          align-self: center;
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          color: #FFF;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 10px rgba(255,122,112,0.3);
          margin: -18px auto;
          position: relative; z-index: 2;
        }

        /* Autocomplete dropdown */
        .tv-suggest {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.08);
          border-radius: 14px;
          box-shadow: 0 16px 36px rgba(26,26,46,0.15);
          padding: 6px;
          z-index: 9999;
          max-height: 240px; overflow-y: auto;
          animation: tv-fadein 180ms ease;
        }
        @keyframes tv-fadein {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tv-suggest-row {
          width: 100%;
          display: flex; align-items: flex-start; gap: 8px;
          padding: 9px 10px;
          background: transparent; border: none;
          font-family: inherit; text-align: left;
          cursor: pointer;
          border-radius: 10px;
          transition: background 120ms ease;
        }
        .tv-suggest-row:hover { background: #FDF6F0; }
        .tv-suggest-ico {
          flex-shrink: 0;
          width: 24px; height: 24px; border-radius: 8px;
          background: #FFE6E3; color: #FF7A70;
          display: flex; align-items: center; justify-content: center;
          margin-top: 1px;
        }
        .tv-suggest-text {
          font-size: 12.5px; font-weight: 600; color: #1A1A2E;
          line-height: 1.4;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .tv-sec-label {
          font-size: 11px; font-weight: 800; letter-spacing: 0.8px;
          text-transform: uppercase; color: #8A7A7A;
          padding: 0 4px;
        }
        .tv-recent-list { display: flex; flex-direction: column; gap: 10px; }
        .tv-recent {
          display: flex; align-items: center; gap: 12px;
          font-family: inherit; cursor: pointer;
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px;
          padding: 12px 14px;
          text-align: left;
          box-shadow: 0 6px 14px rgba(26,26,46,0.04);
          transition: border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
        }
        .tv-recent:hover {
          border-color: rgba(255,122,112,0.3);
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(26,26,46,0.07);
        }
        .tv-recent-ico {
          flex-shrink: 0;
          width: 38px; height: 38px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .tv-recent-ico.home { background: #FFE6E3; color: #FF7A70; }
        .tv-recent-ico.work { background: #EEE7F7; color: #6B4E9B; }
        .tv-recent-ico.star { background: #FDEFD4; color: #B27300; }
        .tv-recent-ico.pin { background: #DFF5F1; color: #17856C; }
        .tv-recent-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .tv-recent-name {
          font-size: 14px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.1px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .tv-recent-meta {
          font-size: 12px; font-weight: 600; color: #8A7A7A;
        }
        .tv-recent-meta b { color: #1A1A2E; font-weight: 800; }
        .tv-recent-chev { color: #B8ACAC; transition: transform 200ms ease, color 200ms ease; }
        .tv-recent:hover .tv-recent-chev { transform: translateX(3px); color: #FF7A70; }

        /* Voyages — hero */
        .tv-hero {
          background: linear-gradient(135deg, #3FB98C 0%, #2BB8A6 60%, #17856C 100%);
          border-radius: 20px;
          padding: 18px;
          color: #FFF;
          box-shadow: 0 14px 30px rgba(23,133,108,0.28);
          position: relative; overflow: hidden;
        }
        .tv-hero::after {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at 92% 8%, rgba(255,255,255,0.22) 0%, transparent 55%);
          pointer-events: none;
        }
        .tv-hero-row { display: flex; align-items: center; gap: 12px; position: relative; z-index: 1; }
        .tv-hero-ico {
          flex-shrink: 0;
          width: 44px; height: 44px; border-radius: 14px;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(4px);
        }
        .tv-hero-title { font-size: 17px; font-weight: 900; letter-spacing: -0.2px; }
        .tv-hero-sub { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.9); margin-top: 2px; }
        .tv-gps-row {
          display: flex; align-items: center; gap: 10px;
          margin-top: 14px;
          position: relative; z-index: 1;
          flex-wrap: wrap;
        }
        .tv-gps-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 11px; border-radius: 50px;
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.6px;
          text-transform: uppercase;
        }
        .tv-gps-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #BFF0D9;
          box-shadow: 0 0 8px rgba(191,240,217,0.9);
          animation: tv-pulse 1.4s ease-in-out infinite;
        }
        @keyframes tv-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }
        .tv-gps-coord {
          font-size: 11.5px; font-weight: 700;
          color: rgba(255,255,255,0.92);
          font-variant-numeric: tabular-nums;
        }

        /* Leaflet wrap */
        .tv-leaflet-wrap {
          position: relative;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(26,26,46,0.08);
          box-shadow: 0 6px 14px rgba(26,26,46,0.06);
          background: #EDF8F2;
        }
        .tv-leaflet { width: 100%; }
        .tv-map-label {
          position: absolute; top: 12px; left: 12px;
          z-index: 500;
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 50px;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(6px);
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.5px;
          text-transform: uppercase; color: #17856C;
          box-shadow: 0 4px 10px rgba(26,26,46,0.1);
        }
        .tv-leaflet-marker { background: transparent; border: none; }
        .tv-leaflet-dot {
          display: block;
          width: 16px; height: 16px; border-radius: 50%;
          border: 3px solid #FFF;
          box-shadow: 0 4px 10px rgba(26,26,46,0.2);
        }
        .tv-leaflet-from { background: #FF7A70; }
        .tv-leaflet-to { background: #6B4E9B; }

        .tv-route-overlay {
          position: absolute; inset: 0;
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(2px);
          z-index: 550;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 8px;
        }
        .tv-route-spinner {
          color: #FF7A70;
          animation: tv-spin 1s linear infinite;
        }
        .tv-route-msg {
          font-size: 12px; font-weight: 800; color: #1A1A2E;
        }

        /* Form */
        .tv-form {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 12px 26px rgba(26,26,46,0.06);
          display: flex; flex-direction: column; gap: 12px;
        }
        .tv-form-field {
          display: flex; align-items: center; gap: 10px;
          background: #FDF6F0;
          border-radius: 14px;
          padding: 10px 14px;
          border: 1.5px solid transparent;
          transition: border-color 180ms ease, background 180ms ease;
        }
        .tv-form-field:focus-within {
          border-color: #6B4E9B;
          background: #FFF;
        }
        .tv-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .tv-stepper {
          display: flex; align-items: center; gap: 4px;
          margin-left: auto;
          background: #FFF;
          border-radius: 50px;
          padding: 2px;
          border: 1px solid rgba(26,26,46,0.08);
        }
        .tv-stepper-btn {
          border: none; background: transparent;
          width: 24px; height: 24px; border-radius: 50%;
          color: #6B4E9B;
          font-size: 14px; font-weight: 900; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .tv-stepper-btn:hover { background: #EEE7F7; }
        .tv-stepper-val {
          font-size: 13px; font-weight: 900; color: #1A1A2E;
          min-width: 14px; text-align: center;
        }

        .tv-fuel-group {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
        }
        .tv-fuel {
          border: 1.5px solid rgba(26,26,46,0.08);
          background: #FFF;
          border-radius: 12px;
          padding: 10px 8px;
          font-family: inherit; font-size: 12px; font-weight: 800;
          color: #1A1A2E;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 180ms ease;
        }
        .tv-fuel:hover { border-color: #6B4E9B; }
        .tv-fuel.active {
          background: #EEE7F7;
          border-color: #6B4E9B;
          color: #6B4E9B;
          box-shadow: 0 4px 10px rgba(107,78,155,0.15);
        }
        .tv-fuel-dot { width: 7px; height: 7px; border-radius: 50%; }
        .tv-fuel-dot.petrol { background: #E53935; }
        .tv-fuel-dot.diesel { background: #C23B2C; }
        .tv-fuel-dot.electric { background: #17856C; }

        .tv-plan-cta {
          width: 100%;
          border: none; cursor: pointer;
          background: linear-gradient(135deg, #7B5CAF 0%, #6B4E9B 100%);
          color: #FFF;
          font-family: inherit; font-size: 15px; font-weight: 900;
          padding: 14px 18px; border-radius: 50px;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 12px 26px rgba(107,78,155,0.4);
          transition: background 150ms ease, transform 150ms ease, opacity 200ms ease;
          letter-spacing: 0.2px;
        }
        .tv-plan-cta:hover:not(:disabled) { filter: brightness(1.05); }
        .tv-plan-cta:active:not(:disabled) { transform: scale(0.99); }
        .tv-plan-cta:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: 0 4px 10px rgba(107,78,155,0.2); }

        .tv-nav-cta {
          width: 100%;
          border: none; cursor: pointer;
          background: #FF7A70;
          color: #FFF;
          font-family: inherit; font-size: 15px; font-weight: 900;
          padding: 14px 18px; border-radius: 50px;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 12px 26px rgba(255,122,112,0.4);
          transition: background 150ms ease, transform 150ms ease;
          letter-spacing: 0.2px;
        }
        .tv-nav-cta:hover { background: #F26158; }
        .tv-nav-cta:active { transform: scale(0.99); }

        .tv-link {
          align-self: center;
          background: transparent; border: none;
          font-family: inherit; font-size: 12.5px; font-weight: 700;
          color: #6B4E9B; cursor: pointer;
          text-decoration: underline; text-underline-offset: 3px;
          padding: 4px 8px;
        }
        .tv-link:hover { color: #FF7A70; }
        .tv-edit-link {
          align-self: center;
          background: transparent; border: none;
          font-family: inherit; font-size: 13px; font-weight: 800;
          color: #FF7A70; cursor: pointer;
          text-decoration: underline; text-underline-offset: 3px;
          padding: 6px 10px;
          margin: -4px 0 2px;
        }
        .tv-edit-link:hover { color: #F26158; }

        .tv-info {
          background: linear-gradient(135deg, #F4EFFC 0%, #EEE7F7 100%);
          border: 1px solid rgba(107,78,155,0.22);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex; align-items: flex-start; gap: 10px;
          color: #4E3A7A;
        }
        .tv-info-ico {
          flex-shrink: 0;
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(107,78,155,0.15);
          color: #6B4E9B;
          display: flex; align-items: center; justify-content: center;
          margin-top: 1px;
        }
        .tv-info-text { font-size: 12.5px; font-weight: 700; line-height: 1.4; }
        .tv-nd-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 800;
          padding: 8px 14px; border-radius: 50px;
          background: #DFF5F1; color: #0F6B57;
          border: 1px solid rgba(23,133,108,0.25);
          align-self: flex-start;
        }

        .tv-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .tv-stat {
          background: #FFF;
          border-radius: 14px;
          padding: 12px;
          border: 1px solid rgba(26,26,46,0.06);
          display: flex; flex-direction: column; gap: 3px;
          box-shadow: 0 6px 14px rgba(26,26,46,0.04);
        }
        .tv-stat-label {
          font-size: 10px; font-weight: 800; letter-spacing: 0.5px;
          text-transform: uppercase; color: #8A7A7A;
        }
        .tv-stat-value {
          font-size: 16px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.2px;
        }
        .tv-stat-value small {
          font-size: 10px; font-weight: 700; color: #8A7A7A; margin-left: 2px;
        }
        .tv-per-pax {
          font-size: 12px; font-weight: 600; color: #8A7A7A;
          padding-left: 4px;
        }

        .tv-eco {
          background: linear-gradient(135deg, #E8F6EC 0%, #DFF5F1 100%);
          border: 1px solid rgba(23,133,108,0.2);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .tv-eco-ico {
          flex-shrink: 0;
          width: 34px; height: 34px; border-radius: 10px;
          background: #17856C; color: #FFF;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 10px rgba(23,133,108,0.3);
        }
        .tv-eco-text { flex: 1; display: flex; flex-direction: column; gap: 1px; }
        .tv-eco-title { font-size: 14px; font-weight: 900; color: #0F6B57; }
        .tv-eco-sub { font-size: 11.5px; font-weight: 600; color: #17856C; }

        .tv-weather {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex; align-items: center; gap: 12px;
          box-shadow: 0 6px 14px rgba(26,26,46,0.04);
        }
        .tv-weather-ico {
          flex-shrink: 0;
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, #B8D8FF 0%, #6CB2FF 100%);
          color: #FFF;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 10px rgba(108,178,255,0.3);
        }
        .tv-weather-text { flex: 1; display: flex; flex-direction: column; gap: 1px; }
        .tv-weather-title { font-size: 13px; font-weight: 800; color: #1A1A2E; }
        .tv-weather-meta { font-size: 11.5px; font-weight: 600; color: #8A7A7A; }
        .tv-weather-temp {
          font-size: 18px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.3px;
        }

        .tv-row {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex; align-items: center; gap: 12px;
          box-shadow: 0 6px 14px rgba(26,26,46,0.04);
        }
        .tv-row-ico {
          flex-shrink: 0;
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .tv-row-ico.coral { background: #FFE6E3; color: #FF7A70; }
        .tv-row-ico.purple { background: #EEE7F7; color: #6B4E9B; }
        .tv-row-ico.teal { background: #DFF5F1; color: #17856C; }
        .tv-row-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .tv-row-title {
          font-size: 13.5px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.1px;
          display: inline-flex; align-items: center; gap: 6px; flex-wrap: wrap;
        }
        .tv-row-meta {
          font-size: 11.5px; font-weight: 600; color: #8A7A7A;
          line-height: 1.4;
        }
        .tv-row-right {
          text-align: right; flex-shrink: 0;
          display: flex; flex-direction: column; gap: 1px; align-items: flex-end;
        }
        .tv-row-distance { font-size: 12px; font-weight: 800; color: #6B4E9B; }
        .tv-row-price { font-size: 14px; font-weight: 900; color: #1A1A2E; }
        .tv-row-price small { font-size: 10px; font-weight: 700; color: #8A7A7A; margin-left: 2px; }
        .tv-row-stars { font-size: 10px; letter-spacing: 1px; color: #F5A524; }

        .tv-a11y-badge {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 10px; font-weight: 800; letter-spacing: 0.2px;
          padding: 2px 7px; border-radius: 50px;
          background: #DFF5F1; color: #0F6B57;
          border: 1px solid rgba(23,133,108,0.25);
        }

        /* Partner stops */
        .tv-partner-banner {
          background: linear-gradient(135deg, #F4EFFC 0%, #EEE7F7 100%);
          border: 1px solid rgba(107,78,155,0.2);
          color: #4E3A7A;
          border-radius: 14px;
          padding: 10px 14px;
          font-size: 12.5px; font-weight: 700;
          line-height: 1.4;
        }
        .tv-partner-stop {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex; align-items: center; gap: 12px;
          box-shadow: 0 6px 14px rgba(26,26,46,0.04);
          transition: border-color 180ms ease, transform 150ms ease;
        }
        .tv-partner-stop:hover {
          border-color: rgba(255,122,112,0.3);
          transform: translateY(-1px);
        }
        .tv-partner-emoji {
          flex-shrink: 0;
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }
        .tv-partner-emoji.food { background: #FFE6E3; }
        .tv-partner-emoji.charge { background: #DFF5F1; }
        .tv-partner-emoji.hotel { background: #EEE7F7; }
        .tv-partner-body {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; gap: 3px;
        }
        .tv-partner-top {
          display: inline-flex; align-items: center; gap: 6px;
          flex-wrap: wrap;
        }
        .tv-partner-name {
          font-size: 13.5px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.1px;
        }
        .tv-partner-meta {
          font-size: 11.5px; font-weight: 600; color: #8A7A7A;
          line-height: 1.4;
        }
        .tv-partner-rating { color: #B27300; font-weight: 800; }
        .tv-partner-tag {
          align-self: flex-start;
          display: inline-flex; align-items: center;
          font-size: 10px; font-weight: 800; letter-spacing: 0.3px;
          padding: 2px 8px; border-radius: 50px;
          background: rgba(107,78,155,0.12);
          color: #6B4E9B;
          border: 1px solid rgba(107,78,155,0.2);
          margin-top: 2px;
        }
        .tv-partner-points {
          flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 900;
          padding: 6px 12px; border-radius: 50px;
          background: linear-gradient(135deg, #FF8F85 0%, #FF7A70 100%);
          color: #FFF;
          box-shadow: 0 4px 10px rgba(255,122,112,0.35);
          letter-spacing: 0.2px;
          white-space: nowrap;
          cursor: pointer;
          transition: transform 150ms ease;
          border: none; font-family: inherit;
        }
        .tv-partner-points:hover { transform: translateY(-1px); }
        .tv-partner-points:active { transform: scale(0.96); }

        /* Quick action chips row */
        .tv-qa-row {
          display: flex; flex-wrap: wrap; gap: 8px;
        }
        .tv-qa-chip {
          font-family: inherit; border: none; cursor: pointer;
          background: #FFF; color: #1A1A2E;
          border: 1.5px solid #EADFD6;
          font-size: 12.5px; font-weight: 700;
          padding: 9px 14px; border-radius: 50px;
          display: inline-flex; align-items: center; gap: 6px;
          transition: all 180ms ease;
          box-shadow: 0 2px 6px rgba(26,26,46,0.03);
        }
        .tv-qa-chip:hover {
          background: #FFF5F2; color: #FF7A70;
          border-color: #FF7A70;
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(255,122,112,0.18);
        }
        .tv-qa-chip:active { transform: translateY(0); }

        /* Action result card/banner */
        .tv-result-banner {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px;
          border-radius: 14px;
          font-size: 13px; font-weight: 700;
          line-height: 1.4;
          animation: tv-fadein 220ms ease;
        }
        .tv-result-banner.green {
          background: linear-gradient(135deg, #E8F6EC 0%, #DFF5F1 100%);
          border: 1px solid rgba(23,133,108,0.25);
          color: #0F6B57;
        }
        .tv-result-banner.coral {
          background: linear-gradient(135deg, #FFF5F2 0%, #FFE6E3 100%);
          border: 1px solid rgba(255,122,112,0.3);
          color: #C2221B;
        }
        .tv-result-card {
          background: #FFF;
          border: 1px solid rgba(255,122,112,0.2);
          border-radius: 16px;
          padding: 14px;
          display: flex; align-items: center; gap: 12px;
          box-shadow: 0 10px 24px rgba(255,122,112,0.12);
          animation: tv-fadein 220ms ease;
        }
        .tv-result-emoji {
          flex-shrink: 0;
          width: 40px; height: 40px; border-radius: 12px;
          background: #FFE6E3;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }
        .tv-result-body {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; gap: 2px;
        }
        .tv-result-title {
          font-size: 13.5px; font-weight: 900; color: #1A1A2E;
        }
        .tv-result-meta {
          font-size: 11.5px; font-weight: 600; color: #8A7A7A;
          line-height: 1.4;
        }
        .tv-result-points {
          flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 11.5px; font-weight: 900;
          padding: 6px 11px; border-radius: 50px;
          background: linear-gradient(135deg, #FF8F85 0%, #FF7A70 100%);
          color: #FFF;
          box-shadow: 0 4px 10px rgba(255,122,112,0.35);
          white-space: nowrap;
        }

        .tv-add-stop-card {
          background: #FFF;
          border: 1px solid rgba(107,78,155,0.25);
          border-radius: 16px;
          padding: 14px;
          display: flex; flex-direction: column; gap: 10px;
          box-shadow: 0 8px 18px rgba(26,26,46,0.05);
          animation: tv-fadein 220ms ease;
        }
        .tv-add-stop-label {
          font-size: 12px; font-weight: 800; color: #6B4E9B;
          letter-spacing: 0.3px;
        }
        .tv-add-stop-row {
          display: flex; gap: 8px;
        }
        .tv-add-stop-input {
          flex: 1; border: 1px solid rgba(26,26,46,0.08);
          background: #FDF6F0;
          border-radius: 12px;
          padding: 10px 14px;
          font-family: inherit; font-size: 13px; font-weight: 700;
          color: #1A1A2E; outline: none;
          transition: border-color 150ms ease, background 150ms ease;
        }
        .tv-add-stop-input:focus { border-color: #6B4E9B; background: #FFF; }
        .tv-add-stop-confirm {
          flex-shrink: 0;
          border: none; cursor: pointer;
          background: #FF7A70; color: #FFF;
          padding: 0 16px; border-radius: 50px;
          font-family: inherit; font-size: 13px; font-weight: 900;
          display: inline-flex; align-items: center; gap: 6px;
          box-shadow: 0 6px 14px rgba(255,122,112,0.35);
          transition: background 150ms ease, transform 150ms ease;
        }
        .tv-add-stop-confirm:hover { background: #F26158; }
        .tv-add-stop-confirm:disabled {
          opacity: 0.5; cursor: not-allowed;
        }

        .tv-actions-row { display: grid; grid-template-columns: 1fr 1.3fr; gap: 10px; }
        .tv-btn {
          font-family: inherit; border: none; cursor: pointer;
          padding: 13px 16px; border-radius: 50px;
          font-size: 13px; font-weight: 900;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 180ms ease;
        }
        .tv-btn.outline {
          background: #FFF;
          color: #6B4E9B;
          border: 1.5px solid #6B4E9B;
        }
        .tv-btn.outline:hover { background: #EEE7F7; }
        .tv-btn.filled {
          background: linear-gradient(135deg, #7B5CAF 0%, #6B4E9B 100%);
          color: #FFF;
          box-shadow: 0 10px 22px rgba(107,78,155,0.38);
        }
        .tv-btn.filled:hover { filter: brightness(1.05); }
        .tv-btn:active { transform: scale(0.98); }

        .tv-saved { display: flex; flex-direction: column; gap: 8px; }
        .tv-saved-row {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 12px;
          padding: 10px 14px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 4px 10px rgba(26,26,46,0.03);
        }
        .tv-saved-ico {
          flex-shrink: 0;
          width: 32px; height: 32px; border-radius: 9px;
          background: #EEE7F7; color: #6B4E9B;
          display: flex; align-items: center; justify-content: center;
        }
        .tv-saved-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
        .tv-saved-route { font-size: 13px; font-weight: 800; color: #1A1A2E; }
        .tv-saved-meta { font-size: 11.5px; font-weight: 600; color: #8A7A7A; }

        .tv-toast {
          position: fixed; bottom: 96px; left: 50%;
          transform: translate(-50%, 20px);
          background: #1A1A2E; color: #FFF;
          padding: 12px 22px; border-radius: 50px;
          font-size: 13px; font-weight: 700;
          box-shadow: 0 20px 50px rgba(26,26,46,0.25);
          z-index: 200; opacity: 0;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease;
          pointer-events: none;
        }
        .tv-toast.show { transform: translate(-50%, 0); opacity: 1; }

        @media (min-width: 640px) {
          .tv-app { padding: 24px 20px 108px; }
          .tv-h1 { font-size: 26px; }
        }
        @media (min-width: 1024px) {
          .tv-root { padding-left: 220px; justify-content: flex-start; }
          .tv-app { max-width: 640px; padding-bottom: 32px; }
        }
      `}</style>

      <div className="tv-root">
        <div className="tv-blobs" aria-hidden="true" />

        <main className="tv-app">
          <div className="tv-top">
            <button type="button" className="tv-back" onClick={() => navigate(-1)} aria-label="Retour">
              <ArrowLeft size={15} strokeWidth={2.5} />
              Retour
            </button>
            <div className="tv-profile-chips">
              {isNew && <span className="tv-profile-chip">🔑 Nouvelle</span>}
              {a11y && (
                <span className="tv-profile-chip a11y">
                  <AccessibilityIcon size={11} strokeWidth={3} />
                  PMR
                </span>
              )}
            </div>
          </div>

          {modes.eco && (
            <div className="stella-eco-banner">🌿 Mode Éco actif — Stella privilégie les itinéraires écologiques</div>
          )}

          <div className={`tv-tabs ${tab === 'voyages' ? 'voyages' : ''}`} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'trajets'}
              className={`tv-tab ${tab === 'trajets' ? 'active' : ''}`}
              onClick={() => { setTab('trajets'); setPlanned(false); setActionResult(null); }}
            >Trajets</button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'voyages'}
              className={`tv-tab ${tab === 'voyages' ? 'active' : ''}`}
              onClick={() => { setTab('voyages'); setActionResult(null); }}
            >Voyages</button>
          </div>

          {tab === 'trajets' && (
            <>
              <header>
                <span className="tv-mark">Trajet urbain</span>
                <h1 className="tv-h1">On va où aujourd'hui, {nickname} ?</h1>
                <p className="tv-sub">{trajetsSubtitle}</p>
              </header>

              <div className="tv-fields tv-fields-top">
                <AddressInput
                  value={t1From}
                  onChange={(v) => { setT1From(v); if (!v) setT1FromCoord(null); }}
                  onPick={(addr, coord) => { setT1From(addr); setT1FromCoord(coord || null); }}
                  placeholder="Ma position actuelle"
                  icon={<MapPin size={15} strokeWidth={2.5} />}
                  label="Départ"
                  showLocate
                  onLocate={() => handleLocate('tab1')}
                  locating={locating}
                />
                <span className="tv-arrow-sep" aria-hidden="true">
                  <ArrowDown size={15} strokeWidth={2.8} />
                </span>
                <AddressInput
                  value={t1To}
                  onChange={(v) => { setT1To(v); if (!v) setT1ToCoord(null); }}
                  onPick={(addr, coord) => { setT1To(addr); setT1ToCoord(coord || null); }}
                  placeholder="Où vas-tu ?"
                  icon={<Navigation size={15} strokeWidth={2.5} />}
                  label="Arrivée"
                />
              </div>

              {(routeLoading || route) && (
                <div className="tv-map-slot" style={{ position: 'relative', zIndex: 1, marginTop: 12 }}>
                  <LeafletMap
                    height={220}
                    from={t1FromCoord}
                    to={t1ToCoord}
                    route={route?.geojson || null}
                    label={route ? 'Itinéraire' : 'Aperçu'}
                  />
                  {routeLoading && (
                    <div className="tv-route-overlay">
                      <Loader2 size={22} strokeWidth={2.5} className="tv-route-spinner" />
                      <span className="tv-route-msg">Calcul de l'itinéraire…</span>
                    </div>
                  )}
                </div>
              )}

              {route && t1FromCoord && t1ToCoord && (
                <>
                  <div className="tv-stats">
                    <div className="tv-stat">
                      <span className="tv-stat-label">Distance</span>
                      <span className="tv-stat-value">{Math.round(route.km)}<small>km</small></span>
                    </div>
                    <div className="tv-stat">
                      <span className="tv-stat-label">Durée</span>
                      <span className="tv-stat-value">{formatDuration(route.minutes)}</span>
                    </div>
                    <div className="tv-stat">
                      <span className="tv-stat-label">Recharge</span>
                      <span className="tv-stat-value">{costForKm(route.km, 'electric')}<small>€</small></span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="tv-edit-link"
                    onClick={() => {
                      if (routeAbortRef.current) routeAbortRef.current.abort();
                      setRoute(null);
                      setRouteError(null);
                      setT1ToCoord(null);
                      setActionResult(null);
                    }}
                  >
                    ✏️ Modifier l'itinéraire
                  </button>
                  <button
                    type="button"
                    className="tv-nav-cta"
                    onClick={() => launchNavigation(t1From, t1To)}
                  >
                    <Navigation size={15} strokeWidth={2.5} />
                    🗺️ Lancer la navigation
                  </button>
                  {quickActions('city')}
                </>
              )}

              {routeError && (
                <div className="tv-info">
                  <span className="tv-info-ico"><Info size={14} strokeWidth={2.5} /></span>
                  <span className="tv-info-text">{routeError}</span>
                </div>
              )}

              <span className="tv-sec-label">Récents</span>
              <div className="tv-recent-list">
                {RECENTS.map((r) => (
                  <button key={r.id} type="button" className="tv-recent" onClick={() => handleRecent(r)}>
                    <span className={`tv-recent-ico ${r.icon}`}>{placeIcon(r.icon)}</span>
                    <span className="tv-recent-text">
                      <span className="tv-recent-name">{r.name}</span>
                      <span className="tv-recent-meta">{r.meta} · <b>{r.distance}</b></span>
                    </span>
                    <ChevronRight size={18} strokeWidth={2.5} className="tv-recent-chev" />
                  </button>
                ))}
              </div>
            </>
          )}

          {tab === 'voyages' && !planned && (
            <>
              <section className="tv-hero">
                <div className="tv-hero-row">
                  <span className="tv-hero-ico"><MapIcon size={22} strokeWidth={2.3} /></span>
                  <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                    <div className="tv-hero-title">Planificateur de voyage</div>
                    <div className="tv-hero-sub">{voyagesSubtitle}</div>
                  </div>
                </div>
                <div className="tv-gps-row">
                  <span className="tv-gps-badge">
                    <span className="tv-gps-dot" />
                    GPS actif
                  </span>
                  <span className="tv-gps-coord">48.8566, 2.3522</span>
                </div>
              </section>

              <div style={{ position: 'relative' }}>
                <LeafletMap
                  height={220}
                  from={t2FromCoord}
                  to={t2ToCoord}
                  route={null}
                  label="Carte interactive"
                />
              </div>

              <section className="tv-form">
                <AddressInput
                  value={t2From}
                  onChange={(v) => { setT2From(v); if (!v) setT2FromCoord(null); }}
                  onPick={(addr, coord) => { setT2From(addr); setT2FromCoord(coord || null); }}
                  placeholder="Ma position actuelle"
                  icon={<MapPin size={15} strokeWidth={2.5} />}
                  label="Départ"
                  showLocate
                  onLocate={() => handleLocate('tab2')}
                  locating={locating}
                />
                <span className="tv-arrow-sep" aria-hidden="true">
                  <ArrowDown size={15} strokeWidth={2.8} />
                </span>
                <AddressInput
                  value={t2To}
                  onChange={(v) => { setT2To(v); if (!v) setT2ToCoord(null); }}
                  onPick={(addr, coord) => { setT2To(addr); setT2ToCoord(coord || null); }}
                  placeholder="Arrivée"
                  icon={<Navigation size={15} strokeWidth={2.5} />}
                  label="Destination"
                />

                <div className="tv-row-2">
                  <div className="tv-form-field">
                    <span className="tv-field-ico"><Calendar size={15} strokeWidth={2.5} /></span>
                    <div className="tv-field-body">
                      <span className="tv-field-label">Date</span>
                      <input
                        type="text"
                        className="tv-field-input"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="Quand ?"
                      />
                    </div>
                  </div>
                  <div className="tv-form-field">
                    <span className="tv-field-ico"><Users size={15} strokeWidth={2.5} /></span>
                    <div className="tv-field-body">
                      <span className="tv-field-label">Passagers</span>
                    </div>
                    <div className="tv-stepper">
                      <button type="button" className="tv-stepper-btn" onClick={() => setPassengers((v) => Math.max(1, v - 1))} aria-label="Moins">−</button>
                      <span className="tv-stepper-val">{passengers}</span>
                      <button type="button" className="tv-stepper-btn" onClick={() => setPassengers((v) => Math.min(8, v + 1))} aria-label="Plus">+</button>
                    </div>
                  </div>
                </div>

                <div className="tv-fuel-group" role="radiogroup" aria-label="Type de carburant">
                  <button type="button" role="radio" aria-checked={fuel === 'petrol'} className={`tv-fuel ${fuel === 'petrol' ? 'active' : ''}`} onClick={() => setFuel('petrol')}>
                    <span className="tv-fuel-dot petrol" />
                    <Fuel size={13} strokeWidth={2.5} />
                    Essence
                  </button>
                  <button type="button" role="radio" aria-checked={fuel === 'diesel'} className={`tv-fuel ${fuel === 'diesel' ? 'active' : ''}`} onClick={() => setFuel('diesel')}>
                    <span className="tv-fuel-dot diesel" />
                    <Droplet size={13} strokeWidth={2.5} />
                    Diesel
                  </button>
                  <button type="button" role="radio" aria-checked={fuel === 'electric'} className={`tv-fuel ${fuel === 'electric' ? 'active' : ''}`} onClick={() => setFuel('electric')}>
                    <span className="tv-fuel-dot electric" />
                    <Zap size={13} strokeWidth={2.5} />
                    Électrique
                  </button>
                </div>

                <button
                  type="button"
                  className="tv-plan-cta"
                  onClick={handlePlan}
                  disabled={!t2CanPlan}
                  aria-disabled={!t2CanPlan}
                >
                  {routeLoading ? (
                    <>
                      <Loader2 size={15} strokeWidth={2.5} className="tv-input-spin" style={{ color: '#FFF' }} />
                      Calcul en cours…
                    </>
                  ) : (
                    <>Planifier 🗺️</>
                  )}
                </button>

                <button type="button" className="tv-link" onClick={handleReset}>
                  Nouvelle recherche
                </button>
              </section>

              <span className="tv-sec-label">Vos voyages</span>
              <div className="tv-saved">
                {SAVED_TRIPS.map((s) => (
                  <div key={s.id} className="tv-saved-row">
                    <span className="tv-saved-ico"><Bookmark size={15} strokeWidth={2.5} /></span>
                    <div className="tv-saved-body">
                      <span className="tv-saved-route">{s.from} → {s.to}</span>
                      <span className="tv-saved-meta">{s.distance} · {s.date}</span>
                    </div>
                    <ChevronRight size={16} strokeWidth={2.5} style={{ color: '#B8ACAC' }} />
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'voyages' && planned && metrics && (
            <>
              {a11y && (
                <div className="tv-info">
                  <span className="tv-info-ico"><Info size={14} strokeWidth={2.5} /></span>
                  <span className="tv-info-text">🛈 Résultats filtrés pour accessibilité PMR</span>
                </div>
              )}

              <span className="tv-sec-label">Itinéraire proposé</span>
              <div style={{ position: 'relative' }}>
                <LeafletMap
                  height={220}
                  from={t2FromCoord}
                  to={t2ToCoord}
                  route={route?.geojson || null}
                  label="Itinéraire"
                />
                {routeLoading && (
                  <div className="tv-route-overlay">
                    <Loader2 size={22} strokeWidth={2.5} className="tv-route-spinner" />
                    <span className="tv-route-msg">Calcul de l'itinéraire…</span>
                  </div>
                )}
              </div>

              {isNew && (
                <span className="tv-nd-badge">
                  <ShieldCheck size={14} strokeWidth={2.8} />
                  ✅ Itinéraire adapté nouvelle conductrice — échangeurs complexes évités
                </span>
              )}

              <div className="tv-stats">
                <div className="tv-stat">
                  <span className="tv-stat-label">Distance</span>
                  <span className="tv-stat-value">{metrics.km}<small>km</small></span>
                </div>
                <div className="tv-stat">
                  <span className="tv-stat-label">Durée</span>
                  <span className="tv-stat-value">{metrics.duration}</span>
                </div>
                <div className="tv-stat">
                  <span className="tv-stat-label">{metrics.costLabel}</span>
                  <span className="tv-stat-value">{metrics.cost}<small>€</small></span>
                </div>
              </div>
              <span className="tv-per-pax">Soit {metrics.perPax} € par passager</span>

              <button
                type="button"
                className="tv-edit-link"
                onClick={() => setPlanned(false)}
              >
                ✏️ Modifier l'itinéraire
              </button>

              <div className="tv-eco">
                <span className="tv-eco-ico"><Leaf size={18} strokeWidth={2.5} /></span>
                <div className="tv-eco-text">
                  <span className="tv-eco-title">🌿 {metrics.co2} kg CO₂ — {metrics.co2Label}</span>
                  <span className="tv-eco-sub">{vehicleName} · {fuel === 'electric' ? 'Recharge partenaire' : fuel === 'diesel' ? 'Diesel' : 'Essence'}</span>
                </div>
              </div>

              <div className="tv-weather">
                <span className="tv-weather-ico"><Cloud size={20} strokeWidth={2.3} /></span>
                <div className="tv-weather-text">
                  <span className="tv-weather-title">Météo sur le trajet</span>
                  <span className="tv-weather-meta">Nuages épars · Visibilité OK</span>
                </div>
                <span className="tv-weather-temp">18°</span>
              </div>

              <span className="tv-sec-label">Arrêts recommandés</span>
              <div className="tv-partner-banner">
                <span>💜 Arrêts chez nos partenaires — gagne des points à chaque étape !</span>
              </div>
              <div className="tv-recent-list">
                {partnerStops.map((s) => (
                  <div key={s.id} className="tv-partner-stop">
                    <span className={`tv-partner-emoji ${s.kind}`}>{s.emoji}</span>
                    <div className="tv-partner-body">
                      <span className="tv-partner-top">
                        <span className="tv-partner-name">{s.name}</span>
                        {a11y && s.accessible && (
                          <span className="tv-a11y-badge">
                            <AccessibilityIcon size={10} strokeWidth={3} />
                            PMR
                          </span>
                        )}
                      </span>
                      <span className="tv-partner-meta">
                        {s.category} · {s.distance} · <span className="tv-partner-rating">⭐ {s.rating}</span>
                        {s.price && <> · {s.price}</>}
                      </span>
                      <span className="tv-partner-tag">Partenaire Stella ✦</span>
                    </div>
                    <button
                      type="button"
                      className="tv-partner-points"
                      onClick={() => awardPoints(s.points)}
                      aria-label={`Collecter ${s.points} points`}
                    >
                      +{s.points} pts
                    </button>
                  </div>
                ))}
              </div>

              {quickActions('long')}

              <div className="tv-actions-row">
                <button type="button" className="tv-btn outline" onClick={() => showToast('Voyage sauvegardé 💾')}>
                  <Save size={15} strokeWidth={2.5} />
                  Sauvegarder
                </button>
                <button type="button" className="tv-btn filled" onClick={() => launchNavigation(t2From, t2To)}>
                  <Navigation size={15} strokeWidth={2.5} />
                  Lancer la navigation
                </button>
              </div>

              <button type="button" className="tv-link" onClick={handleReset}>
                Nouvelle recherche
              </button>
            </>
          )}
        </main>

        <StellaNav activePage="trips" />

        <div className={`tv-toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
          {toast}
        </div>
      </div>
    </>
  );
};

export default StellaTrips;
