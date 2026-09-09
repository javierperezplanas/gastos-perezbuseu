package com.perezbuseu.gastos.pago;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.MediaType;

import java.util.List;


@Path("/api/pagos")
@Consumes(MediaType.APPLICATION_JSON)
public class PagoDeudaResource {


    @Inject
    PagoDeudaService pagoDeudaService;


    @POST
    public PagoDeudaResponse registrarPago(
            RegistrarPagoRequest request) {


        return pagoDeudaService.registrarPago(
                request.grupoId,
                request.deudorId,
                request.acreedorId,
                request.importe
        );

    }


    @GET
    @Path("/grupo/{grupoId}")
    public List<PagoDeudaResponse> obtenerPagosPorGrupo(
            @PathParam("grupoId") Long grupoId) {


        return pagoDeudaService.obtenerPagosPorGrupo(
                grupoId
        );

    }

}
