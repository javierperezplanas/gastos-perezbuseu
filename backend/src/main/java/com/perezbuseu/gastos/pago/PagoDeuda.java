package com.perezbuseu.gastos.pago;

import com.perezbuseu.gastos.grupo.Grupo;
import com.perezbuseu.gastos.usuario.Usuario;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
public class PagoDeuda {


    @Id
    @GeneratedValue(
        strategy = GenerationType.IDENTITY
    )
    public Long id;


    @ManyToOne
    public Grupo grupo;


    /*
     * Persona que debía dinero
     * y realiza el pago.
     */
    @ManyToOne
    public Usuario deudor;


    /*
     * Persona que recibe
     * el dinero.
     */
    @ManyToOne
    public Usuario acreedor;


    public BigDecimal importe;


    public LocalDateTime fechaHora;

}
