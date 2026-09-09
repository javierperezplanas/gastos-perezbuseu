package com.perezbuseu.gastos.usuario;

import jakarta.inject.Inject;

import jakarta.transaction.Transactional;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;

import jakarta.ws.rs.core.MediaType;

import java.util.List;


@Path("/api/usuarios")
@Produces(MediaType.APPLICATION_JSON)
public class UsuarioResource {


    @Inject
    UsuarioRepository usuarioRepository;


    /*
     * Listar todos los usuarios.
     */
    @GET
    public List<Usuario> listar() {


        return usuarioRepository.listAll();

    }


    /*
     * Buscar un usuario
     * por su email.
     */
    @GET
    @Path("/email/{email}")
    public Usuario buscarPorEmail(
            @PathParam("email")
            String email
    ) {


        Usuario usuario =
                usuarioRepository.buscarPorEmail(
                        email
                );


        if (usuario == null) {


            throw new NotFoundException(
                    "Usuario no encontrado"
            );

        }


        return usuario;

    }


    /*
     * Crear un usuario.
     */
    @POST
    @Consumes(
            MediaType.APPLICATION_JSON
    )
    @Transactional
    public Usuario crear(
            Usuario usuario
    ) {


        usuarioRepository.persist(
                usuario
        );


        return usuario;

    }

}
