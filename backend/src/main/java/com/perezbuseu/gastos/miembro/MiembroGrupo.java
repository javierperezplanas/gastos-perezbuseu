package com.perezbuseu.gastos.miembro;

import com.perezbuseu.gastos.grupo.Grupo;
import com.perezbuseu.gastos.usuario.Usuario;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;

@Entity
public class MiembroGrupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    public Usuario usuario;

    @ManyToOne
    public Grupo grupo;

    public LocalDateTime fechaAlta;
}
