package com.perezbuseu.gastos.grupo;

import com.perezbuseu.gastos.gasto.BalanceService;
import com.perezbuseu.gastos.gasto.dto.BalanceUsuarioResponse;
import com.perezbuseu.gastos.gasto.dto.LiquidacionResponse;
import com.perezbuseu.gastos.miembro.MiembroGrupo;
import com.perezbuseu.gastos.miembro.MiembroGrupoRepository;
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
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


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


    /*
     * Listar todos los grupos.
     */
    @GET
    public List<Grupo> listar() {

        return grupoRepository.listAll();

    }


    /*
     * Crear un grupo.
     */
    @POST
    @Transactional
    public Grupo crear(
            Grupo grupo) {

        grupoRepository.persist(
                grupo
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
            @PathParam("id") Long id) {

        Grupo grupo =
                grupoRepository.findById(id);


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
     * Añadir un usuario
     * a un grupo.
     */
    @POST
    @Path("/{id}/miembros/{usuarioId}")
    @Transactional
    public MiembroGrupo añadirMiembro(
            @PathParam("id") Long id,
            @PathParam("usuarioId") Long usuarioId) {

        Grupo grupo =
                grupoRepository.findById(id);


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
     */
    @DELETE
    @Path("/{id}/miembros/{usuarioId}")
    @Transactional
    public void eliminarMiembro(
            @PathParam("id") Long id,
            @PathParam("usuarioId") Long usuarioId) {

        Grupo grupo =
                grupoRepository.findById(id);


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
     * Calcula quién debe pagar a quién.
     */
    @GET
    @Path("/{id}/liquidacion")
    public List<LiquidacionResponse> obtenerLiquidacion(
            @PathParam("id") Long id) {

        Grupo grupo =
                grupoRepository.findById(id);


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


        for (BalanceUsuarioResponse balance : balances) {

            if (balance.saldo.compareTo(
                    BigDecimal.ZERO
            ) < 0) {

                deudores.add(
                        balance
                );

            } else if (balance.saldo.compareTo(
                    BigDecimal.ZERO
            ) > 0) {

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


            if (deuda.compareTo(
                    credito
            ) <= 0) {

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


            if (deudor.saldo.compareTo(
                    BigDecimal.ZERO
            ) == 0) {

                indiceDeudor++;

            }


            if (acreedor.saldo.compareTo(
                    BigDecimal.ZERO
            ) == 0) {

                indiceAcreedor++;

            }

        }


        return liquidaciones;

    }

}
