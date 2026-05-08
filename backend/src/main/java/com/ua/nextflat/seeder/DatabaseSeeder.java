package com.ua.nextflat.seeder;

import com.ua.nextflat.model.FotoInmueble;
import com.ua.nextflat.model.GrupoBusqueda;
import com.ua.nextflat.model.Inmueble;
import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.model.enums.RolUsuario;
import com.ua.nextflat.repository.FotoInmuebleRepository;
import com.ua.nextflat.repository.GrupoBusquedaRepository;
import com.ua.nextflat.repository.InmuebleRepository;
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

    public DatabaseSeeder(UsuarioRepository usuarioRepository,
                          InmuebleRepository inmuebleRepository,
                          FotoInmuebleRepository fotoInmuebleRepository,
                          GrupoBusquedaRepository grupoBusquedaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.inmuebleRepository = inmuebleRepository;
        this.fotoInmuebleRepository = fotoInmuebleRepository;
        this.grupoBusquedaRepository = grupoBusquedaRepository;
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
            System.out.println("✅ Cuenta de Supervisor (admin@nextflat.com) generada con éxito.");
        }

        if (usuarioRepository.count() <= 1) {
            System.out.println("🌱 Base de datos vacía. Iniciando Seeder optimizado con saveAll...");

            Faker faker = new Faker(new Locale("es", "ES"));

            Map<String, String[]> callesPorMunicipio = new HashMap<>();
            callesPorMunicipio.put("San Vicente del Raspeig", new String[]{"Calle Mayor", "Avenida de la Universidad", "Calle Alicante", "Avenida Ancha de Castelar", "Calle Pintor Picasso"});
            callesPorMunicipio.put("Alicante", new String[]{"Explanada de España", "Avenida Maisonnave", "Calle Castaños", "Avenida de Alfonso X El Sabio", "Calle San Francisco"});
            callesPorMunicipio.put("Valencia", new String[]{"Calle Colón", "Avenida del Cid", "Calle de la Paz", "Gran Vía del Marqués del Turia", "Calle Ruzafa"});
            callesPorMunicipio.put("Madrid", new String[]{"Gran Vía", "Calle de Alcalá", "Paseo de la Castellana", "Calle Fuencarral", "Calle Goya"});
            callesPorMunicipio.put("Barcelona", new String[]{"Passeig de Gràcia", "Las Ramblas", "Avenida Diagonal", "Carrer de Balmes", "Carrer d'Aragó"});

            String[] descripciones = {
                "Precioso piso muy luminoso, recién reformado y listo para entrar a vivir. Cuenta con un amplio salón y un balcón exterior perfecto para relajarse.",
                "Apartamento acogedor en pleno centro. Ideal para estudiantes o parejas. Totalmente amueblado y equipado con electrodomésticos de última generación.",
                "Magnífica vivienda con excelentes vistas. Zona muy tranquila, estupendamente comunicada con el transporte público y rodeada de comercios y supermercados.",
                "Piso amplio y exterior. Dispone de aire acondicionado frío/calor, calefacción central y grandes armarios empotrados en todas las habitaciones.",
                "Espectacular loft de diseño moderno. Cocina americana abierta al salón, acabados de primera calidad, suelo de tarima y muchísima luz natural."
            };

            // --- CREACIÓN DE GRUPOS PARA LA US 014 ---
            System.out.println("👥 Generando grupos de búsqueda de prueba...");
            GrupoBusqueda grupoPareja = new GrupoBusqueda();
            grupoBusquedaRepository.save(grupoPareja);

            GrupoBusqueda grupoAmigos = new GrupoBusqueda();
            grupoBusquedaRepository.save(grupoAmigos);
            // ------------------------------------------

            List<Usuario> usuariosALista = new ArrayList<>();
            List<Inmueble> inmueblesALista = new ArrayList<>();
            List<FotoInmueble> fotosALista = new ArrayList<>();

            // 1. Generar 30 Inquilinos
            for (int i = 1; i <= 30; i++) {
                Usuario inquilino = new Usuario();
                inquilino.setNombre(faker.name().fullName());
                inquilino.setEmail("inquilino" + i + "@nextflat.com");
                inquilino.setPassword("password123");
                inquilino.setRol(RolUsuario.INQUILINO);
                inquilino.setProfesion(faker.company().profession());
                inquilino.setBio("Hola, soy " + inquilino.getNombre() + ". Busco un piso compartido por la zona.");
                inquilino.setEstadoVerificacion(com.ua.nextflat.model.enums.EstadoVerificacion.VERIFICADO);
                inquilino.setFechaNacimiento(LocalDate.now().minusYears(faker.number().numberBetween(18, 35)));
                inquilino.setFotoPerfil("https://randomuser.me/api/portraits/" + (i % 2 == 0 ? "men" : "women") + "/" + i + ".jpg");

                // --- ASIGNAR GRUPOS A LOS PRIMEROS 4 INQUILINOS ---
                if (i == 1 || i == 2) {
                    inquilino.setGrupo(grupoPareja);
                    inquilino.setBio("Somos pareja y buscamos nuestro primer nido juntos. Somos muy tranquilos.");
                } else if (i == 3 || i == 4) {
                    inquilino.setGrupo(grupoAmigos);
                    inquilino.setBio("Somos dos amigos estudiantes buscando compartir gastos cerca de la uni.");
                }
                // --------------------------------------------------

                usuariosALista.add(inquilino);
            }

            // 2. Generar 25 Propietarios (5 por ciudad)
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

            // 3. Generar 50 Inmuebles (2 por propietario)
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

            // 4. Generar 150 Fotos (3 por inmueble) con más variedad
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

            System.out.println("✅ ¡ÉXITO! Se han insertado 50 inmuebles, 150 fotos y los grupos de prueba correctamente.");
        }
    }
}