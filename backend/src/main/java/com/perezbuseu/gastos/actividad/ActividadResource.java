package com.perezbuseu.gastos.actividad;

import java.util.List;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;

import jakarta.ws.rs.Produces;

import jakarta.ws.rs.core.MediaType;


@Path("/api/actividades")
@Produces(MediaType.APPLICATION_JSON)
public class ActividadResource {


    private final ActividadService actividadService;


    public ActividadResource(
            ActividadService actividadService
    ) {

        this.actividadService =
        actividadService;

    }


    /*
     * Obtener las actividades
     * de un grupo.
     */
    @GET
    @Path("/grupo/{grupoId}")
    public List<Actividad>
    obtenerActividades(

            @PathParam("grupoId")
            Long grupoId

    ) {

        return actividadService
                .obtenerPorGrupo(
                        grupoId
                );

    }

}
