package com.perezbuseu.gastos.pago;

import com.perezbuseu.gastos.grupo.Grupo;
import com.perezbuseu.gastos.grupo.GrupoRepository;
import com.perezbuseu.gastos.usuario.Usuario;
import com.perezbuseu.gastos.usuario.UsuarioRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
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


    private void validarPago(
            Usuario deudor,
            Usuario acreedor,
            BigDecimal importe) {


        if (deudor.id.equals(
                acreedor.id
        )) {

            throw new IllegalArgumentException(
                    "El deudor y el acreedor no pueden ser la misma persona"
            );

        }


        if (importe == null
                || importe.compareTo(
                        BigDecimal.ZERO
                ) <= 0) {

            throw new IllegalArgumentException(
                    "El importe debe ser mayor que cero"
            );

        }

    }


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
