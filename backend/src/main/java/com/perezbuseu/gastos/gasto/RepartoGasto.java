package com.perezbuseu.gastos.gasto;

import com.perezbuseu.gastos.usuario.Usuario;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.math.BigDecimal;

@Entity
public class RepartoGasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    public Gasto gasto;

    @ManyToOne
    public Usuario usuario;

    public BigDecimal importe;
}
