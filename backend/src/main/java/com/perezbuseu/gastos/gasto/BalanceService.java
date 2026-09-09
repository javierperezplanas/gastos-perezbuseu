package com.perezbuseu.gastos.gasto;

import com.perezbuseu.gastos.gasto.dto.BalanceUsuarioResponse;
import com.perezbuseu.gastos.miembro.MiembroGrupo;
import com.perezbuseu.gastos.miembro.MiembroGrupoRepository;
import com.perezbuseu.gastos.pago.PagoDeuda;
import com.perezbuseu.gastos.pago.PagoDeudaRepository;
import com.perezbuseu.gastos.usuario.Usuario;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;


@ApplicationScoped
public class BalanceService {


    @Inject
    MiembroGrupoRepository miembroGrupoRepository;


    @Inject
    GastoRepository gastoRepository;


    @Inject
    RepartoGastoRepository repartoGastoRepository;


    @Inject
    PagoDeudaRepository pagoDeudaRepository;


    public List<BalanceUsuarioResponse> obtenerBalances(
            Long grupoId) {


        List<MiembroGrupo> miembros =
                miembroGrupoRepository.list(
                        "grupo.id",
                        grupoId
                );


        List<BalanceUsuarioResponse> balances =
                new ArrayList<>();


        for (MiembroGrupo miembro : miembros) {


            Usuario usuario =
                    miembro.usuario;


            BigDecimal totalPagado =
                    calcularTotalPagado(
                            grupoId,
                            usuario.id
                    );


            BigDecimal totalDebe =
                    calcularTotalDebe(
                            grupoId,
                            usuario.id
                    );


            BigDecimal pagosRealizados =
                    calcularPagosRealizados(
                            grupoId,
                            usuario.id
                    );


            BigDecimal pagosRecibidos =
                    calcularPagosRecibidos(
                            grupoId,
                            usuario.id
                    );


            BalanceUsuarioResponse balance =
                    new BalanceUsuarioResponse();


            balance.usuarioId =
                    usuario.id;


            balance.nombreUsuario =
                    usuario.nombre;


            balance.totalPagado =
                    totalPagado;


            balance.totalDebe =
                    totalDebe;


            balance.saldo =
                    totalPagado
                            .subtract(totalDebe)
                            .add(pagosRealizados)
                            .subtract(pagosRecibidos);


            balances.add(
                    balance
            );

        }


        return balances;

    }


    private BigDecimal calcularTotalPagado(
            Long grupoId,
            Long usuarioId) {


        List<Gasto> gastos =
                gastoRepository.list(
                        "grupo.id = ?1 and pagador.id = ?2",
                        grupoId,
                        usuarioId
                );


        BigDecimal total =
                BigDecimal.ZERO;


        for (Gasto gasto : gastos) {


            total =
                    total.add(
                            gasto.importe
                    );

        }


        return total;

    }


    private BigDecimal calcularTotalDebe(
            Long grupoId,
            Long usuarioId) {


        List<RepartoGasto> repartos =
                repartoGastoRepository.list(
                        "gasto.grupo.id = ?1 and usuario.id = ?2",
                        grupoId,
                        usuarioId
                );


        BigDecimal total =
                BigDecimal.ZERO;


        for (RepartoGasto reparto : repartos) {


            total =
                    total.add(
                            reparto.importe
                    );

        }


        return total;

    }


    private BigDecimal calcularPagosRealizados(
            Long grupoId,
            Long usuarioId) {


        List<PagoDeuda> pagos =
                pagoDeudaRepository.list(
                        "grupo.id = ?1 and deudor.id = ?2",
                        grupoId,
                        usuarioId
                );


        BigDecimal total =
                BigDecimal.ZERO;


        for (PagoDeuda pago : pagos) {


            total =
                    total.add(
                            pago.importe
                    );

        }


        return total;

    }


    private BigDecimal calcularPagosRecibidos(
            Long grupoId,
            Long usuarioId) {


        List<PagoDeuda> pagos =
                pagoDeudaRepository.list(
                        "grupo.id = ?1 and acreedor.id = ?2",
                        grupoId,
                        usuarioId
                );


        BigDecimal total =
                BigDecimal.ZERO;


        for (PagoDeuda pago : pagos) {


            total =
                    total.add(
                            pago.importe
                    );

        }


        return total;

    }

}
