package com.perezbuseu.gastos.grupo;


import com.perezbuseu.gastos.gasto.BalanceService;
import com.perezbuseu.gastos.gasto.Gasto;
import com.perezbuseu.gastos.gasto.GastoRepository;
import com.perezbuseu.gastos.gasto.RepartoGastoRepository;

import com.perezbuseu.gastos.gasto.dto.BalanceUsuarioResponse;
import com.perezbuseu.gastos.gasto.dto.LiquidacionResponse;

import com.perezbuseu.gastos.grupo.dto.CrearGrupoRequest;

import com.perezbuseu.gastos.miembro.MiembroGrupo;
import com.perezbuseu.gastos.miembro.MiembroGrupoRepository;

import com.perezbuseu.gastos.pago.PagoDeudaRepository;

import com.perezbuseu.gastos.usuario.Usuario;
import com.perezbuseu.gastos.usuario.UsuarioRepository;


import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;

import jakarta.ws.rs.core.MediaType;


import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;


import java.io.IOException;

import java.math.BigDecimal;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;


/*
 * Gestión de grupos.
 */
@Path("/api/grupos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GrupoResource {


    @Inject
    GrupoRepository grupoRepository;


    @Inject
    MiembroGrupoRepository miembroGrupoRepository;


    @Inject
    UsuarioRepository usuarioRepository;


    @Inject
    BalanceService balanceService;


    @Inject
    GastoRepository gastoRepository;


    @Inject
    RepartoGastoRepository repartoGastoRepository;


    @Inject
    PagoDeudaRepository pagoDeudaRepository;


    /*
     * Listar todos los grupos.
     */
    @GET
    public List<Grupo> listar() {


        return grupoRepository.listAll();

    }


    /*
     * Listar los grupos
     * de un usuario.
     */
    @GET
    @Path("/usuario/{usuarioId}")
    public List<Grupo> listarPorUsuario(
            @PathParam("usuarioId")
            Long usuarioId
    ) {


        List<MiembroGrupo> miembros =
                miembroGrupoRepository.list(
                        "usuario.id",
                        usuarioId
                );


        List<Grupo> grupos =
                new ArrayList<>();


        for (
                MiembroGrupo miembro
                : miembros
        ) {


            grupos.add(
                    miembro.grupo
            );

        }


        return grupos;

    }


    /*
     * Crear un grupo.
     *
     * El usuario que crea el grupo
     * se añade automáticamente como
     * miembro del mismo.
     */
    @POST
    @Transactional
    public Grupo crear(
            CrearGrupoRequest datos
    ) {


        /*
         * Buscamos al usuario
         * que crea el grupo.
         */
        Usuario usuario =
                usuarioRepository.findById(
                        datos.usuarioId
                );


        if (usuario == null) {


            throw new NotFoundException(
                    "Usuario no encontrado"
            );

        }


        /*
         * Creamos el grupo.
         */
        Grupo grupo =
                new Grupo();


        grupo.nombre =
                datos.nombre;


        grupo.descripcion =
                datos.descripcion;


        /*
         * Guardamos el grupo.
         */
        grupoRepository.persist(
                grupo
        );


        /*
         * Añadimos automáticamente
         * al creador como miembro.
         */
        MiembroGrupo miembro =
                new MiembroGrupo();


        miembro.grupo =
                grupo;


        miembro.usuario =
                usuario;


        miembro.fechaAlta =
                LocalDateTime.now();


        miembroGrupoRepository.persist(
                miembro
        );


        return grupo;

    }


    /*
     * Obtener los miembros
     * de un grupo.
     */
    @GET
    @Path("/{id}/miembros")
    public List<MiembroGrupo> obtenerMiembros(
            @PathParam("id")
            Long id
    ) {


        Grupo grupo =
                grupoRepository.findById(
                        id
                );


        if (grupo == null) {


            throw new NotFoundException(
                    "Grupo no encontrado"
            );

        }


        return miembroGrupoRepository.list(
                "grupo.id",
                id
        );

    }


    /*
     * Obtener un grupo
     * por su ID.
     */
    @GET
    @Path("/{id}")
    public Grupo obtenerPorId(
            @PathParam("id")
            Long id
    ) {


        Grupo grupo =
                grupoRepository.findById(
                        id
                );


        if (grupo == null) {


            throw new NotFoundException(
                    "Grupo no encontrado"
            );

        }


        return grupo;

    }


    /*
     * Añadir un usuario
     * a un grupo.
     */
    @POST
    @Path("/{id}/miembros/{usuarioId}")
    @Transactional
    public MiembroGrupo añadirMiembro(
            @PathParam("id")
            Long id,

            @PathParam("usuarioId")
            Long usuarioId
    ) {


        Grupo grupo =
                grupoRepository.findById(
                        id
                );


        if (grupo == null) {


            throw new NotFoundException(
                    "Grupo no encontrado"
            );

        }


        Usuario usuario =
                usuarioRepository.findById(
                        usuarioId
                );


        if (usuario == null) {


            throw new NotFoundException(
                    "Usuario no encontrado"
            );

        }


        /*
         * Comprobamos si el usuario
         * ya pertenece al grupo.
         */
        MiembroGrupo miembroExistente =
                miembroGrupoRepository.find(
                        "grupo.id = ?1 and usuario.id = ?2",
                        id,
                        usuarioId
                ).firstResult();


        if (miembroExistente != null) {


            throw new BadRequestException(
                    "El usuario ya pertenece al grupo"
            );

        }


        MiembroGrupo miembro =
                new MiembroGrupo();


        miembro.grupo =
                grupo;


        miembro.usuario =
                usuario;


        miembro.fechaAlta =
                LocalDateTime.now();


        miembroGrupoRepository.persist(
                miembro
        );


        return miembro;

    }


    /*
     * Eliminar un usuario
     * de un grupo.
     *
     * Solo se elimina la relación
     * MiembroGrupo.
     *
     * El usuario permanece en
     * la base de datos.
     */
    @DELETE
    @Path("/{id}/miembros/{usuarioId}")
    @Transactional
    public void eliminarMiembro(
            @PathParam("id")
            Long id,

            @PathParam("usuarioId")
            Long usuarioId
    ) {


        Grupo grupo =
                grupoRepository.findById(
                        id
                );


        if (grupo == null) {


            throw new NotFoundException(
                    "Grupo no encontrado"
            );

        }


        MiembroGrupo miembro =
                miembroGrupoRepository.find(
                        "grupo.id = ?1 and usuario.id = ?2",
                        id,
                        usuarioId
                ).firstResult();


        if (miembro == null) {


            throw new NotFoundException(
                    "El usuario no pertenece al grupo"
            );

        }


        miembroGrupoRepository.delete(
                miembro
        );

    }


    /*
     * Eliminar un grupo.
     *
     * Se eliminan:
     *
     * - Repartos de los gastos.
     * - Gastos del grupo.
     * - Pagos del grupo.
     * - Relaciones de miembros.
     * - El grupo.
     *
     * Los usuarios NO se eliminan.
     */
    @DELETE
    @Path("/{id}")
    @Transactional
    public void eliminarGrupo(
            @PathParam("id")
            Long id
    ) {


        /*
         * Comprobamos que el grupo
         * exista.
         */
        Grupo grupo =
                grupoRepository.findById(
                        id
                );


        if (grupo == null) {


            throw new NotFoundException(
                    "Grupo no encontrado"
            );

        }


        /*
         * Obtenemos todos los gastos
         * del grupo.
         */
        List<Gasto> gastos =
                gastoRepository.list(
                        "grupo.id",
                        id
                );


        /*
         * Eliminamos primero
         * los repartos de cada gasto.
         */
        for (
                Gasto gasto
                : gastos
        ) {


            repartoGastoRepository.delete(
                    "gasto.id",
                    gasto.id
            );

        }


        /*
         * Eliminamos los gastos
         * del grupo.
         */
        gastoRepository.delete(
                "grupo.id",
                id
        );


        /*
         * Eliminamos los pagos
         * asociados al grupo.
         */
        pagoDeudaRepository.delete(
                "grupo.id",
                id
        );


        /*
         * Eliminamos las relaciones
         * de los miembros del grupo.
         *
         * NO se eliminan usuarios.
         */
        miembroGrupoRepository.delete(
                "grupo.id",
                id
        );


        /*
         * Finalmente eliminamos
         * el grupo.
         */
        grupoRepository.delete(
                grupo
        );

    }


    /*
     * Calcula quién debe pagar a quién.
     */
    @GET
    @Path("/{id}/liquidacion")
    public List<LiquidacionResponse> obtenerLiquidacion(
            @PathParam("id")
            Long id
    ) {


        Grupo grupo =
                grupoRepository.findById(
                        id
                );


        if (grupo == null) {


            throw new NotFoundException(
                    "Grupo no encontrado"
            );

        }


        /*
         * Usamos BalanceService para que
         * los balances tengan en cuenta
         * los pagos realizados.
         */
        List<BalanceUsuarioResponse> balances =
                balanceService.obtenerBalances(
                        id
                );


        List<BalanceUsuarioResponse> deudores =
                new ArrayList<>();


        List<BalanceUsuarioResponse> acreedores =
                new ArrayList<>();


        for (
                BalanceUsuarioResponse balance
                : balances
        ) {


            if (
                    balance.saldo.compareTo(
                            BigDecimal.ZERO
                    ) < 0
            ) {


                deudores.add(
                        balance
                );


            } else if (
                    balance.saldo.compareTo(
                            BigDecimal.ZERO
                    ) > 0
            ) {


                acreedores.add(
                        balance
                );

            }

        }


        List<LiquidacionResponse> liquidaciones =
                new ArrayList<>();


        int indiceDeudor = 0;


        int indiceAcreedor = 0;


        /*
         * Vamos compensando deudas.
         */
        while (
                indiceDeudor < deudores.size()
                        &&
                indiceAcreedor < acreedores.size()
        ) {


            BalanceUsuarioResponse deudor =
                    deudores.get(
                            indiceDeudor
                    );


            BalanceUsuarioResponse acreedor =
                    acreedores.get(
                            indiceAcreedor
                    );


            BigDecimal deuda =
                    deudor.saldo.abs();


            BigDecimal credito =
                    acreedor.saldo;


            BigDecimal importe;


            if (
                    deuda.compareTo(
                            credito
                    ) <= 0
            ) {


                importe =
                        deuda;


            } else {


                importe =
                        credito;

            }


            LiquidacionResponse liquidacion =
                    new LiquidacionResponse();


            liquidacion.deudorId =
                    deudor.usuarioId;


            liquidacion.nombreDeudor =
                    deudor.nombreUsuario;


            liquidacion.acreedorId =
                    acreedor.usuarioId;


            liquidacion.nombreAcreedor =
                    acreedor.nombreUsuario;


            liquidacion.importe =
                    importe;


            liquidaciones.add(
                    liquidacion
            );


            /*
             * Actualizamos los saldos.
             */
            deudor.saldo =
                    deudor.saldo.add(
                            importe
                    );


            acreedor.saldo =
                    acreedor.saldo.subtract(
                            importe
                    );


            if (
                    deudor.saldo.compareTo(
                            BigDecimal.ZERO
                    ) == 0
            ) {


                indiceDeudor++;

            }


            if (
                    acreedor.saldo.compareTo(
                            BigDecimal.ZERO
                    ) == 0
            ) {


                indiceAcreedor++;

            }

        }


        return liquidaciones;

    }


    /*
     * Editar un grupo.
     */
    @PUT
    @Path("/{id}")
    @Transactional
    public Grupo editar(
            @PathParam("id")
            Long id,

            Grupo datosGrupo
    ) {


        Grupo grupo =
                grupoRepository.findById(
                        id
                );


        if (grupo == null) {


            throw new NotFoundException(
                    "Grupo no encontrado"
            );

        }


        grupo.nombre =
                datosGrupo.nombre;


        grupo.descripcion =
                datosGrupo.descripcion;


        return grupo;

    }


    /*
     * Subir la foto
     * de un grupo.
     */
    @POST
    @Path("/{id}/foto")
    @Consumes(
            MediaType.MULTIPART_FORM_DATA
    )
    @Transactional
    public Grupo subirFoto(

            @PathParam("id")
            Long id,

            @RestForm("foto")
            FileUpload foto

    ) throws IOException {


        Grupo grupo =
                grupoRepository.findById(
                        id
                );


        if (grupo == null) {


            throw new NotFoundException(
                    "Grupo no encontrado"
            );

        }


        if (foto == null) {


            throw new BadRequestException(
                    "No se ha recibido ninguna imagen"
            );

        }


        /*
         * Comprobamos que sea
         * una imagen.
         */
        if (
                foto.contentType() == null
                        ||
                !foto.contentType()
                        .startsWith(
                                "image/"
                        )
        ) {


            throw new BadRequestException(
                    "El archivo debe ser una imagen"
            );

        }


        /*
         * Directorio donde guardamos
         * las fotos.
         */
        java.nio.file.Path directorio =
                Paths.get(
                        "uploads/grupos"
                );


        Files.createDirectories(
                directorio
        );


        /*
         * Obtenemos la extensión
         * original.
         */
        String nombreOriginal =
                foto.fileName();


        String extension =
                "";


        int ultimoPunto =
                nombreOriginal.lastIndexOf(
                        '.'
                );


        if (ultimoPunto >= 0) {


            extension =
                    nombreOriginal.substring(
                            ultimoPunto
                    );

        }


        /*
         * Nombre único para evitar
         * conflictos.
         */
        String nombreArchivo =
                "grupo-"
                        + id
                        + "-"
                        + System.currentTimeMillis()
                        + extension;


        java.nio.file.Path destino =
                directorio.resolve(
                        nombreArchivo
                );


        /*
         * Movemos el archivo temporal
         * a su ubicación definitiva.
         */
        Files.move(

                foto.uploadedFile(),

                destino,

                StandardCopyOption.REPLACE_EXISTING

        );


        /*
         * Guardamos la ruta
         * en el grupo.
         */
        grupo.foto =
                "/uploads/grupos/"
                        + nombreArchivo;


        return grupo;

    }

}
