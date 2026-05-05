import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, MapPin, Bed, Droplets, 
    ArrowUpCircle, Dog, Users, Heart, X, 
    CheckCircle2, Loader2, Info, Maximize2, Maximize, Minimize 
} from 'lucide-react';

// Importaciones de Leaflet
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

import { getPropertyDetails, processSwipe } from '../services/api';
import Button from '../components/ui/Button';

// Componente para actualizar el tamaño y centrado del mapa
function MapUpdater({ lat, lng, isExpanded }) {
    const map = useMap();
    
    useEffect(() => {
        // Un timeout ligeramente mayor asegura que la animación CSS acabe antes de centrar
        const timeoutId = setTimeout(() => {
            map.invalidateSize(); 
            if (!isExpanded) {
                map.setView([lat, lng], 15);
            }
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [isExpanded, lat, lng, map]);

    return null;
}

export default function PropertyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [showFullGallery, setShowFullGallery] = useState(false);
    
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    const usuarioGuardado = localStorage.getItem("usuarioLogueado");
    const currentUser = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    const userId = currentUser ? currentUser.id : null;

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await getPropertyDetails(id);
                setProperty(data);
            } catch (error) {
                console.error("Error fetching property details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleInteraction = async (type) => {
        if (!userId) {
            navigate('/login');
            return;
        }
        try {
            await processSwipe({
                usuarioOrigenId: userId,
                inmuebleDestinoId: property.id,
                tipoInteraccion: type,
            });
            navigate('/feed');
        } catch (error) {
            console.error(`Failed to record ${type} interaction:`, error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-slate-500 font-medium">Cargando detalles...</p>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <Info className="w-12 h-12 text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-800">No encontramos el inmueble</h2>
                <p className="text-slate-500 mt-2">Puede que ya no esté disponible o que el enlace sea incorrecto.</p>
                <Button onClick={() => navigate(-1)} variant="secondary" className="mt-6">
                    Volver atrás
                </Button>
            </div>
        );
    }

    const nextImage = () => {
        if (property.fotos && property.fotos.length > 0) {
            setActiveImage((prev) => (prev + 1) % property.fotos.length);
        }
    };

    const prevImage = () => {
        if (property.fotos && property.fotos.length > 0) {
            setActiveImage((prev) => (prev > 0 ? prev - 1 : property.fotos.length - 1));
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
            {/* Header / Gallery */}
            <div 
                className="relative h-[45vh] w-full flex-shrink-0 bg-slate-900 overflow-hidden cursor-zoom-in"
                onClick={() => !isMapExpanded && setShowFullGallery(true)}
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={activeImage}
                        src={property.fotos?.[activeImage] || 'https://via.placeholder.com/800x600?text=Sin+Foto'}
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    />
                </AnimatePresence>
                
                {/* Desmontamos todos los botones superpuestos si el mapa está expandido */}
                {!isMapExpanded && (
                    <>
                        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-20" />
                        <button 
                            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                            className="absolute top-4 left-4 z-40 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors shadow-lg"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div className="absolute top-4 right-4 z-40 flex items-center gap-2 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/80 pointer-events-none">
                            <Maximize2 className="w-4 h-4" />
                            <span className="text-xs font-bold mr-1">Ver galería</span>
                        </div>

                        {property.fotos && property.fotos.length > 1 && (
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-40 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-full">
                                {property.fotos.map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === activeImage ? 'w-8 bg-white' : 'w-1.5 bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Content Body: Aumentamos z-index si el mapa está expandido para evitar colisiones */}
            <div className={`flex-1 -mt-8 relative bg-white rounded-t-[40px] px-6 pt-10 pb-40 ${isMapExpanded ? 'z-[100]' : 'z-30'}`}>
                
                {!isMapExpanded && (
                    <div className="absolute -top-12 right-6 bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-xl border-4 border-white">
                        <span className="text-3xl font-black">{property.precio}€</span>
                        <span className="text-xs font-bold uppercase tracking-wider ml-1">/ mes</span>
                    </div>
                )}

                <header className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 leading-tight">
                        {property.direccion}
                    </h1>
                    <div className="flex items-center mt-2 text-slate-500 font-medium">
                        <MapPin className="w-4 h-4 mr-1.5 text-indigo-500" />
                        <span>{property.municipio}</span>
                    </div>
                </header>

                <div className="grid grid-cols-2 gap-4 mb-10">
                    <SpecCard icon={<Bed />} label={`${property.numHabitaciones} Habitaciones`} />
                    <SpecCard icon={<Droplets />} label={`${property.numBanos} Baños`} />
                    {property.tieneAscensor && <SpecCard icon={<ArrowUpCircle />} label="Ascensor" />}
                    {property.admiteMascotas && <SpecCard icon={<Dog />} label="Mascotas ok" />}
                    {property.esCompartido && <SpecCard icon={<Users />} label="Piso compartido" />}
                    <SpecCard icon={<CheckCircle2 />} label="Verificado" success />
                </div>

                <section className="mb-10">
                    <h3 className="text-lg font-extrabold text-slate-800 mb-3">Descripción</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {property.descripcion || "No hay una descripción detallada disponible para este inmueble."}
                    </p>
                </section>

                {/* Mapa Interactivo con capacidad de expansión */}
                {property.latitud && property.longitud && (
                    <section className={isMapExpanded ? "fixed inset-0 z-[200] bg-white m-0 flex flex-col" : "mb-10"}>
                        {!isMapExpanded && <h3 className="text-lg font-extrabold text-slate-800 mb-3">Ubicación</h3>}
                        
                        <div className={`${isMapExpanded ? 'h-full w-full' : 'h-64 w-full rounded-2xl'} overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative z-0`}>
                            
                            <button
                                onClick={() => setIsMapExpanded(!isMapExpanded)}
                                className="absolute top-4 right-4 z-[400] p-3 bg-white/90 backdrop-blur-md rounded-full text-slate-800 shadow-lg hover:bg-white transition-all border border-slate-200"
                                title={isMapExpanded ? "Contraer mapa" : "Expandir mapa"}
                            >
                                {isMapExpanded ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                            </button>

                            <MapContainer 
                                center={[property.latitud, property.longitud]} 
                                zoom={15} 
                                scrollWheelZoom={isMapExpanded}
                                style={{ height: '100%', width: '100%', zIndex: 0 }}
                            >
                                <MapUpdater lat={property.latitud} lng={property.longitud} isExpanded={isMapExpanded} />
                                
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                />
                                <Marker position={[property.latitud, property.longitud]}>
                                    <Popup className="font-sans">
                                        <strong>{property.precio}€ / mes</strong><br/>
                                        {property.direccion}
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </section>
                )}

                <section className="bg-white rounded-3xl p-6 mb-8 border-l-[6px] border-[rgb(232,56,93)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[rgb(232,56,93)] opacity-[0.03] rounded-full pointer-events-none" />
                    
                    <h3 className="text-[10px] font-black text-[rgb(232,56,93)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[rgb(232,56,93)]" />
                        Propietario
                    </h3>
                    
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-xl font-black text-slate-900">{property.propietarioNombre}</h4>
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-[rgb(232,56,93)]/10 text-[rgb(232,56,93)] text-[10px] font-black rounded-full uppercase tracking-wider">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verificado
                                </span>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed italic">
                                "{property.propietarioBio || "Propietario verificado en NextFlat apasionado por crear comunidades acogedoras y seguras."}"
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Ocultamos los botones de interacción inferiores cuando el mapa ocupa la pantalla */}
            {!isMapExpanded && (
                <div className="fixed bottom-0 inset-x-0 p-8 pb-10 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none z-50 flex justify-center">
                    <div className="flex gap-8 pointer-events-auto items-center">
                        <motion.button
                            whileHover={{ scale: 1.15, rotate: -10, boxShadow: "0 20px 25px -5px rgba(220, 38, 38, 0.15)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleInteraction('DISLIKE')}
                            className="w-16 h-16 rounded-full bg-white shadow-xl shadow-red-100 flex items-center justify-center text-red-500 border border-red-50 border-b-4 border-b-red-100"
                        >
                            <X className="w-6 h-6" strokeWidth={4} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.15, rotate: 10, boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.3)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleInteraction('LIKE')}
                            className="w-16 h-16 rounded-full bg-emerald-500 shadow-2xl shadow-emerald-200 flex items-center justify-center text-white border-4 border-white"
                        >
                            <Heart className="w-5 h-5" fill="currentColor" />
                        </motion.button>
                    </div>
                </div>
            )}

            {/* FULL SCREEN GALLERY OVERLAY */}
            <AnimatePresence>
                {showFullGallery && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col"
                    >
                        <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
                            <span className="text-white font-bold tracking-widest text-sm">
                                {activeImage + 1} / {property.fotos?.length || 1}
                            </span>
                            <button 
                                onClick={() => setShowFullGallery(false)}
                                className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/20"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImage}
                                    src={property.fotos?.[activeImage]}
                                    className="max-w-full max-h-full object-contain"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            </AnimatePresence>
                            {property.fotos && property.fotos.length > 1 && (
                                <>
                                    <button 
                                        onClick={prevImage}
                                        className="absolute left-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-50 border border-white/10"
                                    >
                                        <ChevronLeft className="w-8 h-8" />
                                    </button>
                                    <button 
                                        onClick={nextImage}
                                        className="absolute right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-50 border border-white/10"
                                    >
                                        <ChevronLeft className="w-8 h-8 rotate-180" />
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SpecCard({ icon, label, success }) {
    return (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${success ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
            <span className={success ? 'text-emerald-500' : 'text-indigo-500'}>
                {React.cloneElement(icon, { size: 20 })}
            </span>
            <span className="text-sm font-bold">{label}</span>
        </div>
    );
}