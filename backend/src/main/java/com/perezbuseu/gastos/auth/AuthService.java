package com.perezbuseu.gastos.auth;

import com.perezbuseu.gastos.auth.dto.LoginRequest;
import com.perezbuseu.gastos.auth.dto.LoginResponse;

import com.perezbuseu.gastos.usuario.Usuario;
import com.perezbuseu.gastos.usuario.UsuarioRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import jakarta.ws.rs.NotAuthorizedException;


@ApplicationScoped
public class AuthService {


    @Inject
    UsuarioRepository usuarioRepository;


    public LoginResponse login(
            LoginRequest request) {


        Usuario usuario =
                usuarioRepository.buscarPorEmail(
                        request.email
                );


        if (usuario == null) {

            throw new NotAuthorizedException(
                    "Email o contraseña incorrectos"
            );

        }


        if (
                !usuario.password.equals(
                        request.password
                )
        ) {

            throw new NotAuthorizedException(
                    "Email o contraseña incorrectos"
            );

        }


        return new LoginResponse(
                usuario.id,
                usuario.nombre,
                usuario.email
        );

    }

}
