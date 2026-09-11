package com.perezbuseu.gastos.gasto;

import com.perezbuseu.gastos.gasto.dto.GastoDetalleResponse;
import com.perezbuseu.gastos.gasto.dto.RepartoResponse;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.List;


@ApplicationScoped
public class GastoDetalleService {


    @Inject
    GastoService gastoService;


    @Inject
    RepartoGastoRepository repartoGastoRepository;


    public GastoDetalleResponse obtenerDetalle(
            Long gastoId
    ) {


        Gasto gasto =
                gastoService.obtenerPorId(
                        gastoId
                );


        GastoDetalleResponse response =
                new GastoDetalleResponse();


        asignarDatosGasto(
                response,
                gasto
        );


        asignarRepartos(
                response,
                gastoId
        );


        return response;

    }


    private void asignarDatosGasto(
            GastoDetalleResponse response,
            Gasto gasto
    ) {


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


        /*
         * Forma de reparto.
         */
        response.tipoDivision =
                gasto.tipoDivision;


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

    }


    private void asignarRepartos(
            GastoDetalleResponse response,
            Long gastoId
    ) {


        List<RepartoGasto> repartos =
                repartoGastoRepository.list(
                        "gasto.id",
                        gastoId
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

    }

}
