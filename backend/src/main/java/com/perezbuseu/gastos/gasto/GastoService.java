package com.perezbuseu.gastos.gasto;

import com.perezbuseu.gastos.actividad.ActividadService;
import com.perezbuseu.gastos.gasto.dto.CrearGastoRequest;
import com.perezbuseu.gastos.grupo.Grupo;
import com.perezbuseu.gastos.grupo.GrupoRepository;
import com.perezbuseu.gastos.usuario.Usuario;
import com.perezbuseu.gastos.usuario.UsuarioRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.time.LocalDateTime;
import java.util.List;


@ApplicationScoped
public class GastoService {


    @Inject
    GastoRepository gastoRepository;


    @Inject
    GrupoRepository grupoRepository;


    @Inject
    UsuarioRepository usuarioRepository;


    @Inject
    RepartoService repartoService;


    /*
     * Servicio encargado
     * del historial de actividad.
     */
    @Inject
    ActividadService actividadService;


    public List<Gasto> listar() {

        return gastoRepository.listAll();

    }


    public List<Gasto> listarPorGrupo(
            Long grupoId) {

        return gastoRepository.list(
                "grupo.id",
                grupoId
        );

    }


    public Gasto obtenerPorId(
            Long gastoId) {

        Gasto gasto =
                gastoRepository.findById(gastoId);

        if (gasto == null) {

            throw new NotFoundException(
                    "Gasto no encontrado"
            );

        }

        return gasto;

    }


    /*
     * Crear un gasto.
     */
    @Transactional
    public Gasto crear(
            CrearGastoRequest request) {

        validarParticipantes(request);


        Grupo grupo =
                obtenerGrupo(request.grupoId);


        Usuario pagador =
                obtenerUsuario(request.pagadorId);


        Gasto gasto =
                new Gasto();


        asignarDatos(
                gasto,
                request,
                grupo,
                pagador
        );


        gasto.creadoPor =
                pagador;


        gasto.fechaCreacion =
                LocalDateTime.now();


        gastoRepository.persist(gasto);


        repartoService.crearRepartos(
                gasto,
                request.participantesIds,
                pagador
        );


        /*
         * Registrar la actividad.
         */
        actividadService.registrarActividad(

                grupo.id,

                "CREAR_GASTO",

                pagador.nombre
                        + " añadió el gasto «"
                        + gasto.descripcion
                        + "» por "
                        + gasto.importe
                        + " €"

        );


        return gasto;

    }


    /*
     * Actualizar un gasto.
     */
    @Transactional
    public Gasto actualizar(
            Long gastoId,
            CrearGastoRequest request) {

        validarParticipantes(request);


        Gasto gasto =
                obtenerPorId(gastoId);


        Grupo grupo =
                obtenerGrupo(request.grupoId);


        Usuario pagador =
                obtenerUsuario(request.pagadorId);


        asignarDatos(
                gasto,
                request,
                grupo,
                pagador
        );


        repartoService.eliminarRepartosDeGasto(
                gasto.id
        );


        repartoService.crearRepartos(
                gasto,
                request.participantesIds,
                pagador
        );


        /*
         * Registrar la actividad.
         */
        actividadService.registrarActividad(

                grupo.id,

                "EDITAR_GASTO",

                pagador.nombre
                        + " modificó el gasto «"
                        + gasto.descripcion
                        + "»"

        );


        return gasto;

    }


    /*
     * Eliminar un gasto.
     */
    @Transactional
    public void eliminar(
            Long gastoId) {


        Gasto gasto =
                obtenerPorId(gastoId);


        /*
         * Guardamos los datos antes
         * de eliminar el gasto.
         */
        Long grupoId =
                gasto.grupo.id;


        String descripcion =
                gasto.descripcion;


        repartoService.eliminarRepartosDeGasto(
                gastoId
        );


        gastoRepository.deleteById(
                gastoId
        );


        /*
         * Registrar la actividad.
         */
        actividadService.registrarActividad(

                grupoId,

                "ELIMINAR_GASTO",

                "Se eliminó el gasto «"
                        + descripcion
                        + "»"

        );

    }


    private void asignarDatos(
            Gasto gasto,
            CrearGastoRequest request,
            Grupo grupo,
            Usuario pagador) {

        gasto.descripcion =
                request.descripcion;


        gasto.importe =
                request.importe;


        gasto.categoria =
                request.categoria;


        gasto.fechaHora =
                request.fechaHora;


        gasto.notas =
                request.notas;


        gasto.grupo =
                grupo;


        gasto.pagador =
                pagador;

    }


    private Grupo obtenerGrupo(
            Long grupoId) {

        Grupo grupo =
                grupoRepository.findById(grupoId);


        if (grupo == null) {

            throw new NotFoundException(
                    "Grupo no encontrado"
            );

        }


        return grupo;

    }


    private Usuario obtenerUsuario(
            Long usuarioId) {

        Usuario usuario =
                usuarioRepository.findById(usuarioId);


        if (usuario == null) {

            throw new NotFoundException(
                    "Usuario no encontrado"
            );

        }


        return usuario;

    }


    private void validarParticipantes(
            CrearGastoRequest request) {

        if (
                request.participantesIds == null
                ||
                request.participantesIds.isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "Debe haber al menos un participante"
            );

        }

    }

}
