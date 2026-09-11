package com.perezbuseu.gastos.gasto.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


public class GastoDetalleResponse {


    public Long id;


    public String descripcion;


    public BigDecimal importe;


    public String categoria;


    public LocalDateTime fechaHora;


    public String notas;


    /*
     * Forma de reparto.
     *
     * IGUAL
     *
     * TOTAL_A_PAGADOR
     */
    public String tipoDivision;


    public Long grupoId;


    public String nombreGrupo;


    public Long pagadorId;


    public String nombrePagador;


    public List<RepartoResponse> repartos;


}
