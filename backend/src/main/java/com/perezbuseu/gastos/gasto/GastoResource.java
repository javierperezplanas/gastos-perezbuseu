package com.perezbuseu.gastos.gasto;

import com.perezbuseu.gastos.gasto.dto.BalanceUsuarioResponse;
import com.perezbuseu.gastos.gasto.dto.CrearGastoRequest;
import com.perezbuseu.gastos.gasto.dto.GastoDetalleResponse;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.MediaType;

import java.util.List;


@Path("/api/gastos")
@Consumes(MediaType.APPLICATION_JSON)
public class GastoResource {


    @Inject
    GastoService gastoService;


    @Inject
    BalanceService balanceService;


    @Inject
    GastoDetalleService gastoDetalleService;


    @GET
    public List<Gasto> listar() {

        return gastoService.listar();

    }


    @GET
    @Path("/grupo/{grupoId}")
    public List<Gasto> listarPorGrupo(
            @PathParam("grupoId") Long grupoId) {

        return gastoService.listarPorGrupo(
                grupoId
        );

    }


    @POST
    public Gasto crear(
            CrearGastoRequest request) {

        return gastoService.crear(
                request
        );

    }


    @GET
    @Path("/{id}")
    public GastoDetalleResponse obtenerPorId(
            @PathParam("id") Long id) {

        return gastoDetalleService.obtenerDetalle(
                id
        );

    }


    @PUT
    @Path("/{id}")
    public Gasto actualizar(
            @PathParam("id") Long id,
            CrearGastoRequest request) {

        return gastoService.actualizar(
                id,
                request
        );

    }


    @DELETE
    @Path("/{id}")
    public void eliminar(
            @PathParam("id") Long id) {

        gastoService.eliminar(
                id
        );

    }


    @GET
    @Path("/grupo/{grupoId}/balances")
    public List<BalanceUsuarioResponse> obtenerBalances(
            @PathParam("grupoId") Long grupoId) {

        return balanceService.obtenerBalances(
                grupoId
        );

    }

}
