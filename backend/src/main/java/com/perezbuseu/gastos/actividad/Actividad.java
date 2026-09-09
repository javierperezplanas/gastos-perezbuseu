package com.perezbuseu.gastos.actividad;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


@Entity
@Table(name = "actividades")
public class Actividad {


    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    public Long id;


    /*
     * Grupo al que pertenece
     * esta actividad.
     */
    public Long grupoId;


    /*
     * Tipo de actividad.
     *
     * Ejemplos:
     * CREAR_GASTO
     * EDITAR_GASTO
     * ELIMINAR_GASTO
     * REGISTRAR_PAGO
     */
    public String tipo;


    /*
     * Texto descriptivo
     * de la actividad.
     */
    public String descripcion;


    /*
     * Fecha y hora
     * en que ocurrió.
     */
    public LocalDateTime fechaHora =
            LocalDateTime.now();

}
