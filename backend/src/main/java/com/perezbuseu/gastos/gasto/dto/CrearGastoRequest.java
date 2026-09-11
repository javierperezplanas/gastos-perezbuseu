package com.perezbuseu.gastos.gasto.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


public class CrearGastoRequest {


    public String descripcion;


    public BigDecimal importe;


    /*
     * Se recibe como String desde
     * el frontend.
     *
     * Ejemplo:
     * ALIMENTOS
     * RESTAURANTES
     * GENERAL
     * OTROS
     */
    public String categoria;


    /*
     * Fecha y hora del gasto.
     */
    public LocalDateTime fechaHora;


    /*
     * Notas opcionales.
     */
    public String notas;


    public Long grupoId;


    public Long pagadorId;


    public List<Long> participantesIds;


    /*
     * Tipo de división.
     *
     * IGUAL:
     * Todos los participantes
     * dividen el gasto.
     *
     * TOTAL_A_PAGADOR:
     * El pagador adelanta el dinero
     * y los demás participantes
     * asumen el gasto.
     */
    public String tipoDivision;


}
