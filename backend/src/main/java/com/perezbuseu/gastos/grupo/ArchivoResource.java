package com.perezbuseu.gastos.grupo;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

import java.io.IOException;
import java.nio.file.Files;


@Path("/uploads/grupos")
public class ArchivoResource {


    /*
     * Devuelve una foto
     * de un grupo.
     */
    @GET
    @Path("/{nombreArchivo}")
    public Response obtenerFoto(
            @PathParam("nombreArchivo")
            String nombreArchivo
    ) throws IOException {


        /*
         * Evitamos que se puedan
         * solicitar rutas externas.
         */
        if (
                nombreArchivo.contains("/")
                ||
                nombreArchivo.contains("\\")
        ) {

            throw new NotFoundException();

        }


        java.nio.file.Path ruta =
                java.nio.file.Paths.get(
                        "uploads",
                        "grupos",
                        nombreArchivo
                );


        /*
         * Comprobamos que existe.
         */
        if (
                !Files.exists(ruta)
        ) {

            throw new NotFoundException(
                    "Imagen no encontrada"
            );

        }


        /*
         * Detectamos el tipo
         * de archivo.
         */
        String tipoContenido =
                Files.probeContentType(
                        ruta
                );


        /*
         * Si no podemos detectarlo,
         * usamos un tipo genérico.
         */
        if (
                tipoContenido == null
        ) {

            tipoContenido =
                    "application/octet-stream";

        }


        /*
         * Devolvemos la imagen.
         */
        return Response
                .ok(
                        Files.readAllBytes(
                                ruta
                        )
                )
                .type(
                        tipoContenido
                )
                .build();

    }

}
