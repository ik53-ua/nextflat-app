package com.ua.nextflat.seeder;

import com.ua.nextflat.model.FotoInmueble;
import com.ua.nextflat.model.Inmueble;
import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.model.enums.RolUsuario;
import com.ua.nextflat.repository.FotoInmuebleRepository;
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

    private final UsuarioRepository usuarioRepository;
    private final InmuebleRepository inmuebleRepository;
    private final FotoInmuebleRepository fotoInmuebleRepository;

    public DatabaseSeeder(UsuarioRepository usuarioRepository,
                          InmuebleRepository inmuebleRepository,
                          FotoInmuebleRepository fotoInmuebleRepository) {
        this.usuarioRepository = usuarioRepository;
        this.inmuebleRepository = inmuebleRepository;
        this.fotoInmuebleRepository = fotoInmuebleRepository;
    }

    @Override
    @Transactional // Esto asegura que todo el proceso sea una única operación rápida
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() == 0) {
            System.out.println("🌱 Base de datos vacía. Iniciando Seeder optimizado con saveAll...");
            
            Faker faker = new Faker(new Locale("es", "ES"));

            // Configuración de municipios y calles
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

            // Listas temporales para acumular los datos
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
                inquilino.setVerificado(true);
                inquilino.setFechaNacimiento(LocalDate.now().minusYears(faker.number().numberBetween(18, 35)));
                inquilino.setFotoPerfil("https://randomuser.me/api/portraits/" + (i % 2 == 0 ? "men" : "women") + "/" + i + ".jpg");
                usuariosALista.add(inquilino);
            }

            // 2. Generar 25 Propietarios (5 por ciudad)
            String[] municipios = {"San Vicente del Raspeig", "Alicante", "Valencia", "Madrid", "Barcelona"};
            int cuentaPropietario = 1;
            for (String m : municipios) {
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

            // GUARDAR USUARIOS (Primer bloque)
            usuarioRepository.saveAll(usuariosALista);

            // 3. Generar 50 Inmuebles (2 por propietario)
            int indexMunicipio = 0;
            int contadorPisosEnCiudad = 0;
            int contadorFotosTotal = 1;
            String[] keywordsFotos = {"livingroom", "bedroom", "kitchen", "bathroom"};

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
                    if (contadorPisosEnCiudad == 5) { // Cada 5 propietarios cambiamos de ciudad
                        indexMunicipio++;
                        contadorPisosEnCiudad = 0;
                    }
                }
            }

            // GUARDAR INMUEBLES (Segundo bloque)
            inmuebleRepository.saveAll(inmueblesALista);

            // 4. Generar 150 Fotos (3 por inmueble)
            for (Inmueble inmGuardado : inmueblesALista) {
                for (int k = 1; k <= 3; k++) {
                    FotoInmueble foto = new FotoInmueble();
                    foto.setInmueble(inmGuardado);
                    String kw = keywordsFotos[contadorFotosTotal % keywordsFotos.length];
                    foto.setUrl("https://loremflickr.com/800/600/" + kw + "?lock=" + contadorFotosTotal);
                    fotosALista.add(foto);
                    contadorFotosTotal++;
                }
            }

            // GUARDAR FOTOS (Tercer bloque final)
            fotoInmuebleRepository.saveAll(fotosALista);

            System.out.println("✅ ¡ÉXITO! Se han insertado 50 inmuebles y 150 fotos correctamente.");
        }
    }
}