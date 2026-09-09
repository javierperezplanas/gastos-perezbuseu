package com.perezbuseu.gastos.gasto;


import com.perezbuseu.gastos.gasto.dto.BalanceUsuarioResponse;
import com.perezbuseu.gastos.gasto.dto.LiquidacionResponse;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;


@ApplicationScoped
public class LiquidacionService {


    @Inject
    BalanceService balanceService;


    public List<LiquidacionResponse> obtenerLiquidacion(
            Long grupoId) {


        List<BalanceUsuarioResponse> balances =
                balanceService.obtenerBalances(
                        grupoId
                );


        List<BalanceUsuarioResponse> deudores =
                new ArrayList<>();


        List<BalanceUsuarioResponse> acreedores =
                new ArrayList<>();


        for (BalanceUsuarioResponse balance : balances) {


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

}
