package com.perezbuseu.gastos.auth;

import com.perezbuseu.gastos.usuario.Usuario;

import jakarta.persistence.Entity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import jakarta.persistence.Id;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;


@Entity
public class PasswordResetToken {


    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    public Long id;


    @ManyToOne
    @JoinColumn(
            name = "usuario_id",
            nullable = false
    )
    public Usuario usuario;


    public String tokenHash;


    public LocalDateTime expiresAt;


    public LocalDateTime usedAt;

}