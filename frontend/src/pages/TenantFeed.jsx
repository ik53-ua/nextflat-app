import React, { useState, useEffect } from "react";
import { Filter, SlidersHorizontal, RefreshCcw, Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";
import HoverPropertyCard from "../components/ui/HoverPropertyCard";
import { getFeedForUser, processSwipe } from "../services/api";

// Dummy data for initial dev / fallback
const DUMMY_FLATS = [
  {
    id: 1,
    title: "Loft Moderno Centro",
    location: "Madrid Centro",
    price: 950,
    features: ["1 Hab", "Luminoso", "Mascotas OK"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?w=1920&auto=format&fit=crop",
    ],
  },
  {
    id: 2,
    title: "Estudio Acogedor",
    location: "Malasaña",
    price: 780,
    features: ["Estudio", "Amueblado", "Ascensor"],
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1920&auto=format&fit=crop",
    ],
  },
  {
    id: 3,
    title: "Piso Compartido",
    location: "Chamberí",
    price: 450,
    features: ["Habitación Privada", "Gastos Incluidos"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&auto=format&fit=crop",
    ],
  },
  {
    id: 4,
    title: "Ático con Terraza",
    location: "Retiro",
    price: 1200,
    features: ["2 Habs", "Vistas", "Lujo"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&auto=format&fit=crop",
    ],
  },
];

export default function TenantFeed() {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const usuarioGuardado = localStorage.getItem('usuarioLogueado');
  const currentUser = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const userId = currentUser ? currentUser.id : null; 

  const fetchFeed = async () => {
    console.log("1. Intentando buscar pisos para el usuario con ID:", userId); 

    if (!userId) {
      console.log("❌ ERROR: No hay userId. Abortando búsqueda.");
      setLoading(false);
      return; 
    }

    setLoading(true);
    try {
      console.log("2. Llamando a getFeedForUser...");
      const data = await getFeedForUser(userId);
      
      console.log("3. Respuesta cruda del backend:", data); 

      if (Array.isArray(data)) {
        const formattedFlats = data.map((dbFlat) => ({
          id: dbFlat.id,
          title: dbFlat.direccion, // El JSX espera 'title', la BD da 'direccion'
          location: dbFlat.municipio, // El JSX espera 'location', la BD da 'municipio'
          price: dbFlat.precio,
          features: [
            `${dbFlat.numHabitaciones} Hab`,
            `${dbFlat.numBanos} Baños`,
          ],
          // 🔥 Transformamos la lista de objetos 'fotos' de la BD a un array de URLs puro para React
          images:
            dbFlat.fotos && dbFlat.fotos.length > 0
              ? dbFlat.fotos // ✅ ya son strings, no objetos
              : ["https://via.placeholder.com/800x600?text=Sin+Foto"],
        }));

        setFlats(formattedFlats); // Guardamos los datos ya traducidos
      } else {
        setFlats([]);
      }
    } catch (error) {
      console.error("Error fetching feed:", error);
      setFlats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [userId]);

  const handleSwipe = async (type, item) => {
    if (!userId) return;

    setFlats((prev) => prev.filter((f) => f.id !== item.id));

    try {
      // Send interaction to backend
      await processSwipe({
        usuarioOrigenId: userId,
        inmuebleDestinoId: item.id,
        tipoInteraccion: type, // 'LIKE' or 'DISLIKE'
      });
      console.log(`Successfully recorded ${type} for property ${item.id}`);
    } catch (error) {
      console.error("Failed to record swipe:", error);
      // Optionally, we could add the card back to the state here if the request fails
    }
  };

  const handleLike = (item) => handleSwipe("LIKE", item);
  const handleDislike = (item) => handleSwipe("DISLIKE", item);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      {/* Card Stack Container */}
      <div className="flex-1 relative flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center text-slate-500 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-lg font-medium">
              Buscando pisos recomendados...
            </p>
          </div>
        ) : flats.length === 0 ? (
          /* Out of cards fallback */
          <div className="flex flex-col items-center justify-center text-center text-slate-500 space-y-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 m-4">
            <div className="bg-slate-100 p-5 rounded-full mb-2">
              <Filter className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              ¡Has visto todo!
            </p>
            <p className="text-slate-500">
              Ajusta tus filtros o vuelve más tarde para ver nuevos pisos en tu
              zona.
            </p>
            <Button
              onClick={fetchFeed}
              variant="primary"
              className="mt-4 w-full"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Volver a cargar
            </Button>
          </div>
        ) : (
          /* Stack */
          <div className="relative w-full h-full">
            <AnimatePresence>
              {flats.map((flat, index) => {
                // Only render the top three cards for performance & visual stack
                if (index > flats.length - 4) {
                  return (
                    <HoverPropertyCard
                      key={flat.id}
                      item={flat}
                      onLike={handleLike}
                      onDislike={handleDislike}
                    />
                  );
                }
                return null;
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
