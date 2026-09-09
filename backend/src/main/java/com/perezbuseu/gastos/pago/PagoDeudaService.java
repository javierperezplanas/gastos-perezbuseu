package com.perezbuseu.gastos.pago;

import com.perezbuseu.gastos.gasto.BalanceService;
import com.perezbuseu.gastos.gasto.dto.BalanceUsuarioResponse;
import com.perezbuseu.gastos.grupo.Grupo;
import com.perezbuseu.gastos.grupo.GrupoRepository;
import com.perezbuseu.gastos.usuario.Usuario;
import com.perezbuseu.gastos.usuario.UsuarioRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@ApplicationScoped
public class PagoDeudaService {


    @Inject
    PagoDeudaRepository pagoDeudaRepository;


    @Inject
    GrupoRepository grupoRepository;


    @Inject
    UsuarioRepository usuarioRepository;


    @Inject
    BalanceService balanceService;


    /*
     * Registrar un pago de deuda.
     */
    @Transactional
    public PagoDeudaResponse registrarPago(
            Long grupoId,
            Long deudorId,
            Long acreedorId,
            BigDecimal importe) {


        Grupo grupo =
                obtenerGrupo(
                        grupoId
                );


        Usuario deudor =
                obtenerUsuario(
                        deudorId
                );


        Usuario acreedor =
                obtenerUsuario(
                        acreedorId
                );


        validarPago(
                deudor,
                acreedor,
                importe
        );


        /*
         * Comprobamos que el importe
         * no sea superior a la deuda
         * pendiente real.
         */
        validarImportePendiente(
                grupoId,
                deudorId,
                acreedorId,
                importe
        );


        PagoDeuda pago =
                new PagoDeuda();


        pago.grupo =
                grupo;


        pago.deudor =
                deudor;


        pago.acreedor =
                acreedor;


        pago.importe =
                importe;


        pago.fechaHora =
                LocalDateTime.now();


        pagoDeudaRepository.persist(
                pago
        );


        return convertirAResponse(
                pago
        );

    }


    /*
     * Obtener todos los pagos
     * de un grupo.
     */
    public List<PagoDeudaResponse> obtenerPagosPorGrupo(
            Long grupoId) {


        obtenerGrupo(
                grupoId
        );


        List<PagoDeuda> pagos =
                pagoDeudaRepository.list(
                        "grupo.id",
                        grupoId
                );


        List<PagoDeudaResponse> response =
                new ArrayList<>();


        for (PagoDeuda pago : pagos) {


            response.add(
                    convertirAResponse(
                            pago
                    )
            );

        }


        return response;

    }


    /*
     * Eliminar un pago de deuda.
     */
    @Transactional
    public void eliminarPago(
            Long pagoId) {


        PagoDeuda pago =
                pagoDeudaRepository.findById(
                        pagoId
                );


        if (pago == null) {

            throw new NotFoundException(
                    "Pago no encontrado"
            );

        }


        pagoDeudaRepository.delete(
                pago
        );

    }


    /*
     * Comprobar que el pago
     * no sea superior a la
     * deuda pendiente.
     */
    private void validarImportePendiente(
            Long grupoId,
            Long deudorId,
            Long acreedorId,
            BigDecimal importe) {


        List<BalanceUsuarioResponse> balances =
                balanceService.obtenerBalances(
                        grupoId
                );


        BalanceUsuarioResponse balanceDeudor =
                null;


        BalanceUsuarioResponse balanceAcreedor =
                null;


        for (BalanceUsuarioResponse balance : balances) {


            if (balance.usuarioId.equals(
                    deudorId
            )) {

                balanceDeudor =
                        balance;

            }


            if (balance.usuarioId.equals(
                    acreedorId
            )) {

                balanceAcreedor =
                        balance;

            }

        }


        if (balanceDeudor == null) {

            throw new BadRequestException(
                    "El deudor no pertenece al grupo"
            );

        }


        if (balanceAcreedor == null) {

            throw new BadRequestException(
                    "El acreedor no pertenece al grupo"
            );

        }


        /*
         * El deudor debe tener
         * saldo negativo.
         */
        if (balanceDeudor.saldo.compareTo(
                BigDecimal.ZERO
        ) >= 0) {

            throw new BadRequestException(
                    "El usuario no tiene ninguna deuda pendiente"
            );

        }


        /*
         * El acreedor debe tener
         * saldo positivo.
         */
        if (balanceAcreedor.saldo.compareTo(
                BigDecimal.ZERO
        ) <= 0) {

            throw new BadRequestException(
                    "El usuario no tiene dinero pendiente de recibir"
            );

        }


        BigDecimal deudaPendiente =
                balanceDeudor.saldo.abs();


        BigDecimal creditoPendiente =
                balanceAcreedor.saldo;


        /*
         * El máximo que se puede pagar
         * es el menor de:
         *
         * - Lo que debe el deudor.
         * - Lo que debe recibir el acreedor.
         */
        BigDecimal importeMaximo;


        if (deudaPendiente.compareTo(
                creditoPendiente
        ) <= 0) {

            importeMaximo =
                    deudaPendiente;

        } else {

            importeMaximo =
                    creditoPendiente;

        }


        if (importe.compareTo(
                importeMaximo
        ) > 0) {

            throw new BadRequestException(
                    "El pago no puede ser superior a "
                            + importeMaximo
                            + " €"
            );

        }

    }


    /*
     * Obtener un grupo.
     */
    private Grupo obtenerGrupo(
            Long grupoId) {


        Grupo grupo =
                grupoRepository.findById(
                        grupoId
                );


        if (grupo == null) {

            throw new NotFoundException(
                    "Grupo no encontrado"
            );

        }


        return grupo;

    }


    /*
     * Obtener un usuario.
     */
    private Usuario obtenerUsuario(
            Long usuarioId) {


        Usuario usuario =
                usuarioRepository.findById(
                        usuarioId
                );


        if (usuario == null) {

            throw new NotFoundException(
                    "Usuario no encontrado"
            );

        }


        return usuario;

    }


    /*
     * Validar un pago.
     */
    private void validarPago(
            Usuario deudor,
            Usuario acreedor,
            BigDecimal importe) {


        if (deudor.id.equals(
                acreedor.id
        )) {

            throw new BadRequestException(
                    "El deudor y el acreedor no pueden ser la misma persona"
            );

        }


        if (
                importe == null
                        ||
                importe.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {

            throw new BadRequestException(
                    "El importe debe ser mayor que cero"
            );

        }

    }


    /*
     * Convertir una entidad PagoDeuda
     * en una respuesta para la API.
     */
    private PagoDeudaResponse convertirAResponse(
            PagoDeuda pago) {


        PagoDeudaResponse response =
                new PagoDeudaResponse();


        response.id =
                pago.id;


        response.grupoId =
                pago.grupo.id;


        response.deudorId =
                pago.deudor.id;


        response.nombreDeudor =
                pago.deudor.nombre;


        response.acreedorId =
                pago.acreedor.id;


        response.nombreAcreedor =
                pago.acreedor.nombre;


        response.importe =
                pago.importe;


        response.fechaHora =
                pago.fechaHora;


        return response;

    }

}
