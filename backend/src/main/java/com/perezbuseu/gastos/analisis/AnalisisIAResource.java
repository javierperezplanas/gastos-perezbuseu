package com.perezbuseu.gastos.analisis;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/analisis-ia")
@Produces(MediaType.APPLICATION_JSON)
public class AnalisisIAResource {

    @Inject
    AnalisisIAService analisisIAService;

    @GET
    @Path("/grupo/{grupoId}")
    public Response analizarGastos(
            @PathParam("grupoId") Long grupoId) {

        try {

            String analisis =
                    analisisIAService.analizarGastos(grupoId);

            return Response.ok(
                    new AnalisisIAResponse(analisis)
            ).build();

        } catch (Exception e) {

            return Response.status(
                    Response.Status.INTERNAL_SERVER_ERROR
            ).entity(
                    new AnalisisIAResponse(
                            "Error al realizar el análisis: "
                                    + e.getMessage()
                    )
            ).build();
        }
    }

    @POST
    @Path("/grupo/{grupoId}/pregunta")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response responderPregunta(
            @PathParam("grupoId") Long grupoId,
            PreguntaIARequest request) {

        try {

            String respuesta =
                    analisisIAService.responderPregunta(
                            grupoId,
                            request.pregunta
                    );

            return Response.ok(
                    new AnalisisIAResponse(respuesta)
            ).build();

        } catch (Exception e) {

            return Response.status(
                    Response.Status.INTERNAL_SERVER_ERROR
            ).entity(
                    new AnalisisIAResponse(
                            "Error al responder la pregunta: "
                                    + e.getMessage()
                    )
            ).build();
        }
    }

    public static class PreguntaIARequest {

        public String pregunta;

        public PreguntaIARequest() {
        }
    }

    public static class AnalisisIAResponse {

        public String analisis;

        public AnalisisIAResponse() {
        }

        public AnalisisIAResponse(String analisis) {
            this.analisis = analisis;
        }
    }
}