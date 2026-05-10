package com.ua.nextflat.seeder;

import com.ua.nextflat.model.FotoInmueble;
import com.ua.nextflat.model.GrupoBusqueda;
import com.ua.nextflat.model.Inmueble;
import com.ua.nextflat.model.Interaccion;
import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.model.enums.RolUsuario;
import com.ua.nextflat.model.enums.TipoInteraccion;
import com.ua.nextflat.repository.FotoInmuebleRepository;
import com.ua.nextflat.repository.GrupoBusquedaRepository;
import com.ua.nextflat.repository.InmuebleRepository;
import com.ua.nextflat.repository.InteraccionRepository;
import com.ua.nextflat.repository.UsuarioRepository;
import net.datafaker.Faker;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
public class DatabaseSeeder implements CommandLineRunner {
    private static final String[] FOTOS_PERSONAS = {
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80", // Mujer
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80", // Hombre
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80", // Mujer
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80", // Hombre
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&auto=format&fit=crop&q=80", // Mujer
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80", // Hombre
        "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=800&auto=format&fit=crop&q=80", // Mujer
        "https://images.unsplash.com/photo-1491349174775-aaafddd81942?w=800&auto=format&fit=crop&q=80", // Mujer
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80"  // Hombre
    };

    private static final String[] FOTO_URLS = {
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&auto=format&fit=crop&q=80", 
        "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1920&auto=format&fit=crop&q=80", 
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&auto=format&fit=crop&q=80", 
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1920&auto=format&fit=crop&q=80", 
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1920&auto=format&fit=crop&q=80", 
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&auto=format&fit=crop&q=80", 
        "https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=1920&auto=format&fit=crop&q=80", 
        "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=1920&auto=format&fit=crop&q=80", 
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1920&auto=format&fit=crop&q=80", 
        "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1920&auto=format&fit=crop&q=80", 
        "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1920&auto=format&fit=crop&q=80", 
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1920&auto=format&fit=crop&q=80", 
        "https://images.unsplash.com/photo-1585128792020-803d29415281?w=1920&auto=format&fit=crop&q=80", 
        "https://images.unsplash.com/photo-1617104678098-de229db51175?w=1920&auto=format&fit=crop&q=80", 
        "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=1920&auto=format&fit=crop&q=80", 
    };

    private final UsuarioRepository usuarioRepository;
    private final InmuebleRepository inmuebleRepository;
    private final FotoInmuebleRepository fotoInmuebleRepository;
    private final GrupoBusquedaRepository grupoBusquedaRepository;
    private final InteraccionRepository interaccionRepository;

    public DatabaseSeeder(UsuarioRepository usuarioRepository,
                          InmuebleRepository inmuebleRepository,
                          FotoInmuebleRepository fotoInmuebleRepository,
                          GrupoBusquedaRepository grupoBusquedaRepository,
                          InteraccionRepository interaccionRepository) {
        this.usuarioRepository = usuarioRepository;
        this.inmuebleRepository = inmuebleRepository;
        this.fotoInmuebleRepository = fotoInmuebleRepository;
        this.grupoBusquedaRepository = grupoBusquedaRepository;
        this.interaccionRepository = interaccionRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (!usuarioRepository.existsByEmail("admin@nextflat.com")) {
            Usuario supervisor = new Usuario();
            supervisor.setNombre("Admin Supervisor");
            supervisor.setEmail("admin@nextflat.com");
            supervisor.setPassword("admin123");
            supervisor.setRol(RolUsuario.SUPERVISOR);
            supervisor.setFotoPerfil("https://randomuser.me/api/portraits/lego/1.jpg");
            supervisor.setBio("Administrador del sistema NextFlat.");
            supervisor.setEstadoVerificacion(com.ua.nextflat.model.enums.EstadoVerificacion.VERIFICADO);
            usuarioRepository.save(supervisor);
            System.out.println("✅ Cuenta de Supervisor generada.");
        }

        if (usuarioRepository.count() <= 1) {
            System.out.println("🌱 Iniciando Seeder con fotos de alta resolución y Likes automáticos...");

            Faker faker = new Faker(new Locale("es", "ES"));

            Map<String, String[]> callesPorMunicipio = new HashMap<>();
            callesPorMunicipio.put("San Vicente del Raspeig", new String[]{"Calle Mayor", "Avenida de la Universidad"});
            callesPorMunicipio.put("Alicante", new String[]{"Explanada de España", "Avenida Maisonnave"});
            callesPorMunicipio.put("Valencia", new String[]{"Calle Colón", "Avenida del Cid"});
            callesPorMunicipio.put("Madrid", new String[]{"Gran Vía", "Calle de Alcalá"});
            callesPorMunicipio.put("Barcelona", new String[]{"Passeig de Gràcia", "Las Ramblas"});

            String[] descripciones = {
                "Precioso piso muy luminoso, recién reformado y listo para entrar a vivir.",
                "Apartamento acogedor en pleno centro. Ideal para estudiantes o parejas.",
                "Magnífica vivienda con excelentes vistas. Zona muy tranquila."
            };

            // --- GRUPOS PARA US 014 ---
            GrupoBusqueda grupoPareja = new GrupoBusqueda();
            grupoBusquedaRepository.save(grupoPareja);

            GrupoBusqueda grupoAmigos = new GrupoBusqueda();
            grupoBusquedaRepository.save(grupoAmigos);

            List<Usuario> usuariosALista = new ArrayList<>();

            // 1. Generar Inquilinos
            for (int i = 1; i <= 30; i++) {
                Usuario inquilino = new Usuario();
                inquilino.setNombre(faker.name().fullName());
                inquilino.setEmail("inquilino" + i + "@nextflat.com");
                inquilino.setPassword("password123");
                inquilino.setRol(RolUsuario.INQUILINO);
                inquilino.setFechaNacimiento(LocalDate.now().minusYears(faker.number().numberBetween(18, 50)));

                if (i == 1) {
                    inquilino.setNombre("Laura Sánchez");
                    inquilino.setFotoPerfil("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80");
                    inquilino.setGrupo(grupoPareja);
                    inquilino.setBio("Somos pareja y buscamos nuestro primer nido juntos.");
                } else if (i == 2) {
                    inquilino.setNombre("Carlos Ruiz");
                    inquilino.setFotoPerfil("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=80");
                    inquilino.setGrupo(grupoPareja);
                } else if (i == 3) {
                    inquilino.setNombre("Mario García");
                    inquilino.setFotoPerfil("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80");
                    inquilino.setGrupo(grupoAmigos);
                    inquilino.setBio("Somos dos amigos estudiantes buscando compartir gastos.");
                } else if (i == 4) {
                    inquilino.setNombre("Elena Martínez");
                    inquilino.setFotoPerfil("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&auto=format&fit=crop&q=80");
                    inquilino.setGrupo(grupoAmigos);
                } else {
                    int personaUrlIndex = (i) % FOTOS_PERSONAS.length;
                    inquilino.setFotoPerfil(FOTOS_PERSONAS[personaUrlIndex]);
                    inquilino.setBio("Hola, soy " + inquilino.getNombre() + ". Busco un piso compartido por la zona.");
                }

                usuariosALista.add(inquilino);
            }

            // 2. Generar Propietarios
            String[] municipios = {"San Vicente del Raspeig", "Alicante", "Valencia", "Madrid", "Barcelona"};
            int cuentaPropietario = 1;
            for (int i = 0; i < municipios.length; i++) {
                for (int p = 1; p <= 5; p++) {
                    Usuario propietario = new Usuario();
                    propietario.setNombre(faker.name().fullName());
                    propietario.setEmail("propietario" + cuentaPropietario + "@nextflat.com");
                    propietario.setPassword("password123");
                    propietario.setRol(RolUsuario.PROPIETARIO);
                    propietario.setFotoPerfil("https://randomuser.me/api/portraits/" + (cuentaPropietario % 2 == 0 ? "women" : "men") + "/" + (cuentaPropietario + 40) + ".jpg");
                    usuariosALista.add(propietario);
                    cuentaPropietario++;
                }
            }

            usuarioRepository.saveAll(usuariosALista);

            // 3. Generar Inmuebles
            List<Inmueble> inmueblesALista = new ArrayList<>();
            int indexMunicipio = 0;
            int contadorPisosEnCiudad = 0;

            for (Usuario u : usuariosALista) {
                if (u.getRol() == RolUsuario.PROPIETARIO) {
                    String municipioActual = municipios[indexMunicipio];
                    String[] calles = callesPorMunicipio.get(municipioActual);
                    for (int j = 0; j < 2; j++) {
                        Inmueble inm = new Inmueble();
                        inm.setPropietario(u);
                        inm.setMunicipio(municipioActual);
                        inm.setDireccion(calles[faker.number().numberBetween(0, calles.length)] + ", " + faker.number().numberBetween(1, 100));
                        inm.setPrecio(BigDecimal.valueOf(faker.number().numberBetween(400, 1200)));
                        inm.setDescripcion(descripciones[faker.number().numberBetween(0, descripciones.length)]);
                        inm.setNumHabitaciones(faker.number().numberBetween(1, 5));
                        inm.setNumBanos(faker.number().numberBetween(1, 3));
                        inm.setActivo(true);
                        inmueblesALista.add(inm);
                    }
                    contadorPisosEnCiudad++;
                    if (contadorPisosEnCiudad == 5) {
                        indexMunicipio++;
                        contadorPisosEnCiudad = 0;
                    }
                }
            }
            inmuebleRepository.saveAll(inmueblesALista);

            // 4. Generar Fotos de Inmuebles
            List<FotoInmueble> fotosALista = new ArrayList<>();
            int inmuebleIndex = 0;
            for (Inmueble inmGuardado : inmueblesALista) {
                for (int k = 0; k < 3; k++) {
                    FotoInmueble foto = new FotoInmueble();
                    foto.setInmueble(inmGuardado);
                    int urlIndex = (inmuebleIndex * 7 + k * 5) % FOTO_URLS.length;
                    foto.setUrl(FOTO_URLS[urlIndex]);
                    fotosALista.add(foto);
                }
                inmuebleIndex++;
            }
            fotoInmuebleRepository.saveAll(fotosALista);

            // --- 5. EL TRUCO MÁGICO: GENERAR LIKES AUTOMÁTICOS ---
            System.out.println("❤️ Generando Likes automáticos para que salgan en el feed...");
            
            // Buscar al Propietario 1 y a los líderes de los grupos
            Usuario laura = usuariosALista.stream().filter(u -> u.getEmail().equals("inquilino1@nextflat.com")).findFirst().orElse(null);
            Usuario mario = usuariosALista.stream().filter(u -> u.getEmail().equals("inquilino3@nextflat.com")).findFirst().orElse(null);
            Inmueble pisoProp1 = inmueblesALista.stream().filter(i -> i.getPropietario().getEmail().equals("propietario1@nextflat.com")).findFirst().orElse(null);

            if (pisoProp1 != null) {
                // 1. Likes de los 2 GRUPOS
                if (laura != null) {
                    Interaccion likeLaura = new Interaccion();
                    likeLaura.setUsuarioOrigen(laura);
                    likeLaura.setUsuarioTarget(pisoProp1.getPropietario());
                    likeLaura.setInmuebleDestino(pisoProp1);
                    likeLaura.setTipo(TipoInteraccion.LIKE);
                    interaccionRepository.save(likeLaura);
                }

                if (mario != null) {
                    Interaccion likeMario = new Interaccion();
                    likeMario.setUsuarioOrigen(mario);
                    likeMario.setUsuarioTarget(pisoProp1.getPropietario());
                    likeMario.setInmuebleDestino(pisoProp1);
                    likeMario.setTipo(TipoInteraccion.LIKE);
                    interaccionRepository.save(likeMario);
                }

                // 2. Likes de 3 INDIVIDUOS (inquilinos 5, 6 y 7)
                for (int i = 5; i <= 7; i++) {
                    String email = "inquilino" + i + "@nextflat.com";
                    Usuario individual = usuariosALista.stream().filter(u -> u.getEmail().equals(email)).findFirst().orElse(null);
                    
                    if (individual != null) {
                        Interaccion likeIndividual = new Interaccion();
                        likeIndividual.setUsuarioOrigen(individual);
                        likeIndividual.setUsuarioTarget(pisoProp1.getPropietario());
                        likeIndividual.setInmuebleDestino(pisoProp1);
                        likeIndividual.setTipo(TipoInteraccion.LIKE);
                        interaccionRepository.save(likeIndividual);
                    }
                }
            }

            System.out.println("✅ Seeder completado. ¡Propietario 1 ahora tiene 2 grupos y 3 individuos en su feed!");
        }
    }
}