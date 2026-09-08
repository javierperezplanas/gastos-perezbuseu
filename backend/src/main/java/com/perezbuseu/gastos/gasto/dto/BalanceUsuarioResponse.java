package com.perezbuseu.gastos.gasto.dto;

import java.math.BigDecimal;

public class BalanceUsuarioResponse {

    public Long usuarioId;

    public String nombreUsuario;

    /*
     * Total de dinero que ha pagado
     * esta persona.
     */
    public BigDecimal totalPagado;

    /*
     * Total que le corresponde pagar
     * según los repartos.
     */
    public BigDecimal totalDebe;

    /*
     * Saldo = totalPagado - totalDebe
     *
     * Positivo: ha pagado de más.
     * Negativo: debe dinero.
     */
    public BigDecimal saldo;
}
