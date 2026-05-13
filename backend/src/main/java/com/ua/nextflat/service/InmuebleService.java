package com.ua.nextflat.service;

import com.ua.nextflat.dto.DetalleInmuebleDTO;
import com.ua.nextflat.model.FotoInmueble;
import com.ua.nextflat.model.Inmueble;
import com.ua.nextflat.repository.FotoInmuebleRepository;
import com.ua.nextflat.repository.InmuebleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InmuebleService {

    private final InmuebleRepository inmuebleRepository;
    private final FotoInmuebleRepository fotoInmuebleRepository;

    @Autowired
    public InmuebleService(InmuebleRepository inmuebleRepository, FotoInmuebleRepository fotoInmuebleRepository) {
        this.inmuebleRepository = inmuebleRepository;
        this.fotoInmuebleRepository = fotoInmuebleRepository;
    }

    public DetalleInmuebleDTO getDetalleInmueble(Long id) {
        Inmueble inmueble = inmuebleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inmueble no encontrado con ID: " + id));

        List<FotoInmueble> fotos = fotoInmuebleRepository.findByInmuebleId(id);

        DetalleInmuebleDTO dto = new DetalleInmuebleDTO();
        dto.setId(inmueble.getId());
        dto.setPrecio(inmueble.getPrecio());
        dto.setDireccion(inmueble.getDireccion());
        dto.setMunicipio(inmueble.getMunicipio());
        dto.setLatitud(inmueble.getLatitud());
        dto.setLongitud(inmueble.getLongitud());
        dto.setDescripcion(inmueble.getDescripcion());
        dto.setNumHabitaciones(inmueble.getNumHabitaciones());
        dto.setNumBanos(inmueble.getNumBanos());
        dto.setTieneAscensor(inmueble.isTieneAscensor());
        dto.setAdmiteMascotas(inmueble.isAdmiteMascotas());
        dto.setEsCompartido(inmueble.isEsCompartido());
        dto.setFotos(fotos.stream().map(FotoInmueble::getUrl).collect(Collectors.toList()));
        
        if (inmueble.getPropietario() != null) {
            dto.setPropietarioNombre(inmueble.getPropietario().getNombre());
            dto.setPropietarioFoto(inmueble.getPropietario().getFotoPerfil());
            dto.setPropietarioBio(inmueble.getPropietario().getBio());
        }

        return dto;
    }
}
