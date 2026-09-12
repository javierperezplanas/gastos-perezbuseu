package com.perezbuseu.gastos.auth;

import com.perezbuseu.gastos.auth.dto.LoginRequest;
import com.perezbuseu.gastos.auth.dto.LoginResponse;
import com.perezbuseu.gastos.auth.dto.RegisterRequest;
import com.perezbuseu.gastos.auth.dto.RestablecerPasswordRequest;
import com.perezbuseu.gastos.auth.dto.SolicitarResetPasswordRequest;

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
            LoginRequest request
    ) {

        return authService.login(
                request
        );

    }


    @POST
    @Path("/register")
    public LoginResponse register(
            RegisterRequest request
    ) {

        return authService.register(
                request
        );

    }


    @POST
    @Path("/forgot-password")
    public void forgotPassword(
            SolicitarResetPasswordRequest request
    ) {

        authService.solicitarResetPassword(
                request.email
        );

    }


    @POST
    @Path("/reset-password")
    public void resetPassword(
            RestablecerPasswordRequest request
    ) {

        authService.restablecerPassword(
                request.token,
                request.password
        );

    }

}