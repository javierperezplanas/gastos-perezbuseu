package com.perezbuseu.gastos.auth;

import com.perezbuseu.gastos.auth.dto.LoginRequest;
import com.perezbuseu.gastos.auth.dto.LoginResponse;

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


    @POST
    @Path("/login")
    public LoginResponse login(
            LoginRequest request) {

        return authService.login(
                request
        );

    }

}
