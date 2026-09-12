package com.perezbuseu.gastos.google;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Response;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;


@Path("/api/google/oauth")
public class GoogleOAuthResource {

    @ConfigProperty(
            name = "google.gmail.client-id"
    )
    String clientId;


    @ConfigProperty(
            name = "google.gmail.redirect-uri"
    )
    String redirectUri;


    @GET
    @Path("/login")
    public Response login() {

        String scope =
                "https://www.googleapis.com/auth/gmail.send";


        String authorizationUrl =
                "https://accounts.google.com/o/oauth2/v2/auth"
                + "?client_id="
                + URLEncoder.encode(
                        clientId,
                        StandardCharsets.UTF_8
                )
                + "&redirect_uri="
                + URLEncoder.encode(
                        redirectUri,
                        StandardCharsets.UTF_8
                )
                + "&response_type=code"
                + "&scope="
                + URLEncoder.encode(
                        scope,
                        StandardCharsets.UTF_8
                )
                + "&access_type=offline"
                + "&prompt=consent";


        return Response
                .seeOther(
                        java.net.URI.create(
                                authorizationUrl
                        )
                )
                .build();

    }
    @GET
    @Path("/callback")
    public Response callback(
            @QueryParam("code") String code,
            @QueryParam("error") String error
    ) {

        if (error != null) {

            return Response
                    .status(Response.Status.BAD_REQUEST)
                    .entity(
                            "Error de Google: " + error
                    )
                    .build();

        }


        if (code == null) {

            return Response
                    .status(Response.Status.BAD_REQUEST)
                    .entity(
                            "No se recibió el código de autorización"
                    )
                    .build();

        }


        System.out.println(
                "Código OAuth recibido: " + code
        );


        return Response
                .ok(
                        "Autorización correcta. Código recibido."
                )
                .build();

    }
}
