package com.perezbuseu.gastos.auth;

import com.perezbuseu.gastos.auth.dto.LoginRequest;
import com.perezbuseu.gastos.auth.dto.LoginResponse;
import com.perezbuseu.gastos.auth.dto.RegisterRequest;

import com.perezbuseu.gastos.usuario.Usuario;
import com.perezbuseu.gastos.usuario.UsuarioRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotAuthorizedException;


@ApplicationScoped
public class AuthService {


    @Inject
    UsuarioRepository usuarioRepository;


    /*
     * Iniciar sesión.
     */
    public LoginResponse login(
            LoginRequest request
    ) {


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


    /*
     * Registrar un nuevo usuario.
     */
    @Transactional
    public LoginResponse register(
            RegisterRequest request
    ) {


        /*
         * Comprobamos que todos los
         * campos estén informados.
         */
        if (
                request.nombre == null
                ||
                request.nombre.trim().isEmpty()
        ) {

            throw new BadRequestException(
                    "El nombre es obligatorio"
            );

        }


        if (
                request.email == null
                ||
                request.email.trim().isEmpty()
        ) {

            throw new BadRequestException(
                    "El email es obligatorio"
            );

        }


        if (
                request.password == null
                ||
                request.password.trim().isEmpty()
        ) {

            throw new BadRequestException(
                    "La contraseña es obligatoria"
            );

        }


        /*
         * Comprobamos si ya existe
         * un usuario con ese email.
         */
        Usuario usuarioExistente =
                usuarioRepository.buscarPorEmail(
                        request.email
                                .trim()
                                .toLowerCase()
                );


        if (usuarioExistente != null) {

            throw new BadRequestException(
                    "Ya existe un usuario con ese email"
            );

        }


        /*
         * Creamos el usuario.
         */
        Usuario usuario =
                new Usuario();


        usuario.nombre =
                request.nombre.trim();


        usuario.email =
                request.email
                        .trim()
                        .toLowerCase();


        usuario.password =
                request.password;


        /*
         * Guardamos el usuario.
         */
        usuarioRepository.persist(
                usuario
        );


        /*
         * Devolvemos los datos
         * para iniciar sesión
         * automáticamente.
         */
        return new LoginResponse(
                usuario.id,
                usuario.nombre,
                usuario.email
        );

    }

}
