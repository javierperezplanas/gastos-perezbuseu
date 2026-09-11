package com.perezbuseu.gastos.gasto;

import com.perezbuseu.gastos.grupo.Grupo;
import com.perezbuseu.gastos.usuario.Usuario;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
public class Gasto {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    public Long id;


    public String descripcion;


    public BigDecimal importe;


    @Enumerated(EnumType.STRING)
    public Categoria categoria;


    public LocalDateTime fechaHora;


    public String notas;


    /*
     * Forma en la que se
     * divide el gasto.
     *
     * IGUAL
     *
     * TOTAL_A_PAGADOR
     */
    public String tipoDivision;


    @ManyToOne
    public Grupo grupo;


    @ManyToOne
    public Usuario pagador;


    @ManyToOne
    public Usuario creadoPor;


    public LocalDateTime fechaCreacion;

}
