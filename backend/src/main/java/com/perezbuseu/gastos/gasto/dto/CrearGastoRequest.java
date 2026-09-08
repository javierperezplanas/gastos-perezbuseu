package com.perezbuseu.gastos.gasto.dto;

import com.perezbuseu.gastos.gasto.Categoria;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CrearGastoRequest {

    public String descripcion;

    public BigDecimal importe;

    public Categoria categoria;

    public LocalDateTime fechaHora;

    public String notas;

    public Long grupoId;

    public Long pagadorId;

    public List<Long> participantesIds;
}
