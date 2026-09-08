package com.perezbuseu.gastos.grupo;

import com.perezbuseu.gastos.gasto.Gasto;
import com.perezbuseu.gastos.gasto.GastoRepository;
import com.perezbuseu.gastos.gasto.RepartoGasto;
import com.perezbuseu.gastos.gasto.RepartoGastoRepository;
import com.perezbuseu.gastos.gasto.dto.BalanceUsuarioResponse;
import com.perezbuseu.gastos.miembro.MiembroGrupo;
import com.perezbuseu.gastos.miembro.MiembroGrupoRepository;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.math.BigDecimal;
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
    GastoRepository gastoRepository;

    @Inject
    RepartoGastoRepository repartoGastoRepository;


    @GET
    public List<Grupo> listar() {

        return grupoRepository.listAll();
    }


    @POST
    @Transactional
    public Grupo crear(Grupo grupo) {

        grupoRepository.persist(grupo);

        return grupo;
    }


    /*
     * Obtiene el balance de todos
     * los miembros de un grupo.
     */
    @GET
    @Path("/{id}/balance")
    public List<BalanceUsuarioResponse> obtenerBalance(
            @PathParam("id") Long id) {


        Grupo grupo = grupoRepository.findById(id);


        if (grupo == null) {

            throw new NotFoundException(
                    "Grupo no encontrado"
            );
        }


        /*
         * Buscamos los miembros
         * pertenecientes al grupo.
         */
        List<MiembroGrupo> miembros =
                miembroGrupoRepository.list(
                        "grupo.id",
                        id
                );


        List<BalanceUsuarioResponse> balances =
                new ArrayList<>();


        /*
         * Calculamos el balance
         * de cada miembro.
         */
        for (MiembroGrupo miembro : miembros) {


            BalanceUsuarioResponse balance =
                    new BalanceUsuarioResponse();


            balance.usuarioId =
                    miembro.usuario.id;

            balance.nombreUsuario =
                    miembro.usuario.nombre;


            /*
             * Inicializamos los importes.
             */
            balance.totalPagado =
                    BigDecimal.ZERO;

            balance.totalDebe =
                    BigDecimal.ZERO;


            /*
             * Buscamos los gastos
             * del grupo.
             */
            List<Gasto> gastos =
                    gastoRepository.list(
                            "grupo.id",
                            id
                    );


            /*
             * Recorremos todos
             * los gastos.
             */
            for (Gasto gasto : gastos) {


                /*
                 * Si este usuario
                 * fue el pagador,
                 * sumamos el importe
                 * completo del gasto.
                 */
                if (gasto.pagador != null
                        && gasto.pagador.id.equals(
                                miembro.usuario.id
                        )) {

                    balance.totalPagado =
                            balance.totalPagado.add(
                                    gasto.importe
                            );
                }


                /*
                 * Buscamos cuánto
                 * le corresponde pagar
                 * en este gasto.
                 */
                List<RepartoGasto> repartos =
                        repartoGastoRepository.list(
                                "gasto.id",
                                gasto.id
                        );


                for (RepartoGasto reparto : repartos) {


                    if (reparto.usuario.id.equals(
                            miembro.usuario.id
                    )) {

                        balance.totalDebe =
                                balance.totalDebe.add(
                                        reparto.importe
                                );
                    }
                }
            }


            /*
             * Saldo:
             *
             * Positivo -> ha pagado más
             * Negativo -> debe dinero
             */
            balance.saldo =
                    balance.totalPagado.subtract(
                            balance.totalDebe
                    );


            balances.add(balance);
        }


        return balances;
    }
}
