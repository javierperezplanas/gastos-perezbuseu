package com.perezbuseu.gastos.pago;

import java.math.BigDecimal;
import java.time.LocalDateTime;


public class PagoDeudaResponse {


    public Long id;


    public Long grupoId;


    public Long deudorId;

    public String nombreDeudor;


    public Long acreedorId;

    public String nombreAcreedor;


    public BigDecimal importe;


    public LocalDateTime fechaHora;

}
