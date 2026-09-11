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


    @Inject
    ActividadService actividadService;


    /*
     * Lista todos los gastos.
     */
    public List<Gasto> listar() {

        return gastoRepository.listAll();

    }


    /*
     * Lista los gastos
     * de un grupo.
     */
    public List<Gasto> listarPorGrupo(
            Long grupoId
    ) {

        return gastoRepository.list(
                "grupo.id",
                grupoId
        );

    }


    /*
     * Obtiene un gasto por ID.
     */
    public Gasto obtenerPorId(
            Long gastoId
    ) {


        Gasto gasto =
                gastoRepository.findById(
                        gastoId
                );


        if (gasto == null) {

            throw new NotFoundException(
                    "Gasto no encontrado"
            );

        }


        return gasto;

    }


    /*
     * Crea un nuevo gasto.
     */
    @Transactional
    public Gasto crear(
            CrearGastoRequest request
    ) {


        validarParticipantes(
                request
        );


        Grupo grupo =
                obtenerGrupo(
                        request.grupoId
                );


        Usuario pagador =
                obtenerUsuario(
                        request.pagadorId
                );


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


        gastoRepository.persist(
                gasto
        );


        repartoService.crearRepartos(
                gasto,
                request.participantesIds,
                pagador,
                request.tipoDivision
        );


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
     * Actualiza un gasto.
     */
    @Transactional
    public Gasto actualizar(
            Long gastoId,
            CrearGastoRequest request
    ) {


        validarParticipantes(
                request
        );


        Gasto gasto =
                obtenerPorId(
                        gastoId
                );


        Grupo grupo =
                obtenerGrupo(
                        request.grupoId
                );


        Usuario pagador =
                obtenerUsuario(
                        request.pagadorId
                );


        asignarDatos(
                gasto,
                request,
                grupo,
                pagador
        );


        /*
         * Eliminamos los repartos
         * antiguos.
         */
        repartoService.eliminarRepartosDeGasto(
                gasto.id
        );


        /*
         * Creamos los repartos
         * con el nuevo tipo
         * de división.
         */
        repartoService.crearRepartos(
                gasto,
                request.participantesIds,
                pagador,
                request.tipoDivision
        );


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
     * Elimina un gasto.
     */
    @Transactional
    public void eliminar(
            Long gastoId
    ) {


        Gasto gasto =
                obtenerPorId(
                        gastoId
                );


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


        actividadService.registrarActividad(

                grupoId,

                "ELIMINAR_GASTO",

                "Se eliminó el gasto «"
                        + descripcion
                        + "»"

        );

    }


    /*
     * Asigna los datos del request
     * a la entidad Gasto.
     */
    private void asignarDatos(
            Gasto gasto,
            CrearGastoRequest request,
            Grupo grupo,
            Usuario pagador
    ) {


        gasto.descripcion =
                request.descripcion;


        gasto.importe =
                request.importe;


        /*
         * Convertimos el String
         * recibido en el enum Categoria.
         */
        gasto.categoria =
                Categoria.valueOf(
                        request.categoria
                );


        /*
         * Fecha y hora del gasto.
         */
        gasto.fechaHora =
                request.fechaHora;


        /*
         * Actualmente no recibimos
         * notas desde el formulario.
         */
        gasto.notas =
                null;


        /*
         * Forma de reparto.
         *
         * IGUAL
         *
         * TOTAL_A_PAGADOR
         */
        gasto.tipoDivision =
                request.tipoDivision;


        gasto.grupo =
                grupo;


        gasto.pagador =
                pagador;

    }


    /*
     * Obtiene el grupo.
     */
    private Grupo obtenerGrupo(
            Long grupoId
    ) {


        Grupo grupo =
                grupoRepository.findById(
                        grupoId
                );


        if (grupo == null) {

            throw new NotFoundException(
                    "Grupo no encontrado"
            );

        }


        return grupo;

    }


    /*
     * Obtiene un usuario.
     */
    private Usuario obtenerUsuario(
            Long usuarioId
    ) {


        Usuario usuario =
                usuarioRepository.findById(
                        usuarioId
                );


        if (usuario == null) {

            throw new NotFoundException(
                    "Usuario no encontrado"
            );

        }


        return usuario;

    }


    /*
     * Comprueba que existan
     * participantes.
     */
    private void validarParticipantes(
            CrearGastoRequest request
    ) {


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
