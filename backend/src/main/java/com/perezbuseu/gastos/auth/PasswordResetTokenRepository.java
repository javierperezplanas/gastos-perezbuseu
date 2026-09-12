package com.perezbuseu.gastos.auth;

import io.quarkus.hibernate.orm.panache.PanacheRepository;

import jakarta.enterprise.context.ApplicationScoped;


@ApplicationScoped
public class PasswordResetTokenRepository
        implements PanacheRepository<PasswordResetToken> {


    public PasswordResetToken buscarPorHash(
            String tokenHash
    ) {

        return find(
                "tokenHash",
                tokenHash
        )
        .firstResult();

    }

}