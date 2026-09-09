package com.perezbuseu.gastos.usuario;

import io.quarkus.hibernate.orm.panache.PanacheRepository;

import jakarta.enterprise.context.ApplicationScoped;


@ApplicationScoped
public class UsuarioRepository
        implements PanacheRepository<Usuario> {


    public Usuario buscarPorEmail(
            String email) {

        return find(
                "email",
                email
        )
        .firstResult();

    }

}
