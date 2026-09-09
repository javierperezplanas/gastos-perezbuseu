package com.perezbuseu.gastos.gasto;

import com.perezbuseu.gastos.gasto.dto.CrearGastoRequest;
import com.perezbuseu.gastos.gasto.dto.GastoDetalleResponse;
import com.perezbuseu.gastos.gasto.dto.RepartoResponse;
import com.perezbuseu.gastos.grupo.Grupo;
import com.perezbuseu.gastos.grupo.GrupoRepository;
import com.perezbuseu.gastos.usuario.Usuario;
import com.perezbuseu.gastos.usuario.UsuarioRepository;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.MediaType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Path("/api/gastos")
@Consumes(MediaType.APPLICATION_JSON)
public class GastoResource {


    @Inject
    GastoRepository gastoRepository;


    @Inject
    RepartoGastoRepository repartoGastoRepository;


    @Inject
    GrupoRepository grupoRepository;


    @Inject
    UsuarioRepository usuarioRepository;


    /*
     * Listar todos los gastos.
     */
    @GET
    public List<Gasto> listar() {

        return gastoRepository.listAll();
    }


    /*
     * Listar los gastos de un grupo.
     */
    @GET
    @Path("/grupo/{grupoId}")
    public List<Gasto> listarPorGrupo(
            @PathParam("grupoId") Long grupoId) {

        return gastoRepository.list(
                "grupo.id",
                grupoId
        );
    }


    /*
     * Obtener un gasto concreto
     * junto con todos sus repartos.
     */
    @GET
    @Path("/{id}")
    public GastoDetalleResponse obtenerPorId(
            @PathParam("id") Long id) {


        Gasto gasto =
                gastoRepository.findById(id);


        if (gasto == null) {

            throw new NotFoundException(
                    "Gasto no encontrado"
            );
        }


        GastoDetalleResponse response =
                new GastoDetalleResponse();


        response.id =
                gasto.id;

        response.descripcion =
                gasto.descripcion;

        response.importe =
                gasto.importe;


        if (gasto.categoria != null) {

            response.categoria =
                    gasto.categoria.name();
        }


        response.fechaHora =
                gasto.fechaHora;

        response.notas =
                gasto.notas;


        if (gasto.grupo != null) {

            response.grupoId =
                    gasto.grupo.id;

            response.nombreGrupo =
                    gasto.grupo.nombre;
        }


        if (gasto.pagador != null) {

            response.pagadorId =
                    gasto.pagador.id;

            response.nombrePagador =
                    gasto.pagador.nombre;
        }


        List<RepartoGasto> repartos =
                repartoGastoRepository.list(
                        "gasto.id",
                        id
                );


        response.repartos =
                new ArrayList<>();


        for (RepartoGasto reparto : repartos) {

            RepartoResponse repartoResponse =
                    new RepartoResponse();


            repartoResponse.usuarioId =
                    reparto.usuario.id;

            repartoResponse.nombreUsuario =
                    reparto.usuario.nombre;

            repartoResponse.importe =
                    reparto.importe;


            response.repartos.add(
                    repartoResponse
            );
        }


        return response;
    }


    /*
     * Crear un gasto.
     */
    @POST
    @Transactional
    public Gasto crear(
            CrearGastoRequest request) {


        Grupo grupo =
                grupoRepository.findById(
                        request.grupoId
                );


        Usuario pagador =
                usuarioRepository.findById(
                        request.pagadorId
                );


        validarDatos(
                request,
                grupo,
                pagador
        );


        Gasto gasto =
                new Gasto();


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

        gasto.creadoPor =
                pagador;

        gasto.fechaCreacion =
                LocalDateTime.now();


        gastoRepository.persist(
                gasto
        );


        crearRepartos(
                gasto,
                request.participantesIds,
                pagador
        );


        return gasto;
    }


    /*
     * Actualizar un gasto.
     *
     * Se eliminan los repartos antiguos
     * y se calculan de nuevo.
     */
    @PUT
    @Path("/{id}")
    @Transactional
    public Gasto actualizar(
            @PathParam("id") Long id,
            CrearGastoRequest request) {


        Gasto gasto =
                gastoRepository.findById(id);


        if (gasto == null) {

            throw new NotFoundException(
                    "Gasto no encontrado"
            );
        }


        Grupo grupo =
                grupoRepository.findById(
                        request.grupoId
                );


        Usuario pagador =
                usuarioRepository.findById(
                        request.pagadorId
                );


        validarDatos(
                request,
                grupo,
                pagador
        );


        /*
         * Actualizamos los datos.
         */
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


        /*
         * Eliminamos los repartos
         * antiguos.
         */
        repartoGastoRepository.delete(
                "gasto.id",
                gasto.id
        );


        /*
         * Creamos los repartos
         * nuevamente.
         */
        crearRepartos(
                gasto,
                request.participantesIds,
                pagador
        );


        return gasto;
    }


    /*
     * Eliminar un gasto y todos
     * sus repartos asociados.
     */
    @DELETE
    @Path("/{id}")
    @Transactional
    public void eliminar(
            @PathParam("id") Long id) {


        Gasto gasto =
                gastoRepository.findById(id);


        if (gasto == null) {

            throw new NotFoundException(
                    "Gasto no encontrado"
            );
        }


        /*
         * Primero eliminamos
         * los repartos.
         */
        repartoGastoRepository.delete(
                "gasto.id",
                id
        );


        /*
         * Después eliminamos
         * el gasto.
         */
        gastoRepository.delete(
                gasto
        );
    }


    /*
     * Validación común para
     * crear y actualizar gastos.
     */
    private void validarDatos(
            CrearGastoRequest request,
            Grupo grupo,
            Usuario pagador) {


        if (grupo == null) {

            throw new IllegalArgumentException(
                    "Grupo no encontrado"
            );
        }


        if (pagador == null) {

            throw new IllegalArgumentException(
                    "Pagador no encontrado"
            );
        }


        if (request.participantesIds == null
                || request.participantesIds.isEmpty()) {

            throw new IllegalArgumentException(
                    "Debe haber al menos un participante"
            );
        }
    }


    /*
     * Crear los repartos
     * de un gasto.
     */
    private void crearRepartos(
            Gasto gasto,
            List<Long> participantesIds,
            Usuario pagador) {


        List<Usuario> participantes =
                new ArrayList<>();


        for (Long usuarioId : participantesIds) {

            Usuario usuario =
                    usuarioRepository.findById(
                            usuarioId
                    );


            if (usuario == null) {

                throw new IllegalArgumentException(
                        "Usuario no encontrado: "
                                + usuarioId
                );
            }


            participantes.add(
                    usuario
            );
        }


        int numeroParticipantes =
                participantes.size();


        /*
         * Trabajamos en céntimos.
         */
        int totalCentimos =
                gasto.importe
                        .movePointRight(2)
                        .intValueExact();


        int centimosBase =
                totalCentimos
                        / numeroParticipantes;


        int restoCentimos =
                totalCentimos
                        % numeroParticipantes;


        /*
         * Un solo participante.
         */
        if (numeroParticipantes == 1) {

            guardarReparto(
                    gasto,
                    participantes.get(0),
                    totalCentimos
            );

            return;
        }


        /*
         * División exacta.
         */
        if (restoCentimos == 0) {

            for (Usuario usuario : participantes) {

                guardarReparto(
                        gasto,
                        usuario,
                        centimosBase
                );
            }

            return;
        }


        /*
         * División con resto.
         *
         * Los que no son pagador
         * reciben el redondeo hacia arriba.
         *
         * El pagador paga el resto.
         */
        int centimosOtros =

                BigDecimal.valueOf(
                                totalCentimos
                        )
                        .divide(
                                BigDecimal.valueOf(
                                        numeroParticipantes
                                ),
                                0,
                                RoundingMode.CEILING
                        )
                        .intValue();


        int numeroOtros =
                numeroParticipantes - 1;


        int centimosPagador =

                totalCentimos
                        - (
                                centimosOtros
                                        * numeroOtros
                        );


        for (Usuario usuario : participantes) {

            if (usuario.id.equals(
                    pagador.id
            )) {

                guardarReparto(
                        gasto,
                        usuario,
                        centimosPagador
                );

            } else {

                guardarReparto(
                        gasto,
                        usuario,
                        centimosOtros
                );
            }
        }
    }


    /*
     * Guardar un reparto.
     */
    private void guardarReparto(
            Gasto gasto,
            Usuario usuario,
            int centimos) {


        BigDecimal importe =

                BigDecimal.valueOf(
                                centimos
                        )
                        .movePointLeft(2)
                        .setScale(2);


        RepartoGasto reparto =
                new RepartoGasto();


        reparto.gasto =
                gasto;

        reparto.usuario =
                usuario;

        reparto.importe =
                importe;


        repartoGastoRepository.persist(
                reparto
        );
    }

}
