package com.perezbuseu.gastos.auth;

import com.perezbuseu.gastos.auth.dto.LoginRequest;
import com.perezbuseu.gastos.auth.dto.LoginResponse;
import com.perezbuseu.gastos.auth.dto.RegisterRequest;

import jakarta.inject.Inject;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;

import jakarta.ws.rs.core.MediaType;


@Path("/api/auth")
@Consumes(
        MediaType.APPLICATION_JSON
)
@Produces(
        MediaType.APPLICATION_JSON
)
public class AuthResource {


    @Inject
    AuthService authService;


    /*
     * Iniciar sesión.
     */
    @POST
    @Path("/login")
    public LoginResponse login(
            LoginRequest request
    ) {

        return authService.login(
                request
        );

    }


    /*
     * Registrar un nuevo usuario.
     */
    @POST
    @Path("/register")
    public LoginResponse register(
            RegisterRequest request
    ) {

        return authService.register(
                request
        );

    }

}
