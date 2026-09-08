package com.perezbuseu.gastos.grupo;

import com.perezbuseu.gastos.gasto.Gasto;
import com.perezbuseu.gastos.gasto.GastoRepository;
import com.perezbuseu.gastos.gasto.RepartoGasto;
import com.perezbuseu.gastos.gasto.RepartoGastoRepository;
import com.perezbuseu.gastos.gasto.dto.BalanceUsuarioResponse;
import com.perezbuseu.gastos.gasto.dto.LiquidacionResponse;
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


        List<MiembroGrupo> miembros =
                miembroGrupoRepository.list(
                        "grupo.id",
                        id
                );


        List<BalanceUsuarioResponse> balances =
                new ArrayList<>();


        /*
         * Buscamos los gastos una sola vez.
         */
        List<Gasto> gastos =
                gastoRepository.list(
                        "grupo.id",
                        id
                );


        for (MiembroGrupo miembro : miembros) {

            BalanceUsuarioResponse balance =
                    new BalanceUsuarioResponse();


            balance.usuarioId =
                    miembro.usuario.id;

            balance.nombreUsuario =
                    miembro.usuario.nombre;

            balance.totalPagado =
                    BigDecimal.ZERO;

            balance.totalDebe =
                    BigDecimal.ZERO;


            for (Gasto gasto : gastos) {


                /*
                 * Si fue el pagador,
                 * sumamos el importe completo.
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
                 * Buscamos los repartos
                 * de este gasto.
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
             * Positivo -> le deben dinero.
             * Negativo -> debe dinero.
             */
            balance.saldo =
                    balance.totalPagado.subtract(
                            balance.totalDebe
                    );


            balances.add(balance);
        }


        return balances;
    }


    /*
     * Calcula quién debe pagar a quién.
     */
    @GET
    @Path("/{id}/liquidacion")
    public List<LiquidacionResponse> obtenerLiquidacion(
            @PathParam("id") Long id) {


        /*
         * Comprobamos que existe el grupo.
         */
        Grupo grupo = grupoRepository.findById(id);

        if (grupo == null) {

            throw new NotFoundException(
                    "Grupo no encontrado"
            );
        }


        /*
         * Obtenemos los balances.
         */
        List<BalanceUsuarioResponse> balances =
                obtenerBalance(id);


        /*
         * Listas de deudores y acreedores.
         */
        List<BalanceUsuarioResponse> deudores =
                new ArrayList<>();

        List<BalanceUsuarioResponse> acreedores =
                new ArrayList<>();


        for (BalanceUsuarioResponse balance : balances) {

            if (balance.saldo.compareTo(
                    BigDecimal.ZERO
            ) < 0) {

                deudores.add(balance);

            } else if (balance.saldo.compareTo(
                    BigDecimal.ZERO
            ) > 0) {

                acreedores.add(balance);
            }
        }


        List<LiquidacionResponse> liquidaciones =
                new ArrayList<>();


        int indiceDeudor = 0;
        int indiceAcreedor = 0;


        /*
         * Vamos compensando deudas.
         */
        while (indiceDeudor < deudores.size()
                && indiceAcreedor < acreedores.size()) {


            BalanceUsuarioResponse deudor =
                    deudores.get(indiceDeudor);

            BalanceUsuarioResponse acreedor =
                    acreedores.get(indiceAcreedor);


            /*
             * El saldo del deudor es negativo.
             * Necesitamos su valor absoluto.
             */
            BigDecimal deuda =
                    deudor.saldo.abs();


            BigDecimal credito =
                    acreedor.saldo;


            /*
             * La cantidad a pagar será
             * la menor de las dos.
             */
            BigDecimal importe;


            if (deuda.compareTo(credito) <= 0) {

                importe = deuda;

            } else {

                importe = credito;
            }


            /*
             * Creamos la liquidación.
             */
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


            liquidaciones.add(liquidacion);


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


            /*
             * Si el deudor ya ha pagado
             * toda su deuda, pasamos
             * al siguiente.
             */
            if (deudor.saldo.compareTo(
                    BigDecimal.ZERO
            ) == 0) {

                indiceDeudor++;
            }


            /*
             * Si el acreedor ya ha recibido
             * todo su dinero, pasamos
             * al siguiente.
             */
            if (acreedor.saldo.compareTo(
                    BigDecimal.ZERO
            ) == 0) {

                indiceAcreedor++;
            }
        }


        return liquidaciones;
    }
}
