package com.perezbuseu.gastos.gasto;

import com.perezbuseu.gastos.usuario.Usuario;
import com.perezbuseu.gastos.usuario.UsuarioRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;


@ApplicationScoped
public class RepartoService {


    @Inject
    RepartoGastoRepository repartoGastoRepository;


    @Inject
    UsuarioRepository usuarioRepository;


    /*
     * Crea los repartos de un gasto
     * entre los participantes.
     */
    @Transactional
    public void crearRepartos(
            Gasto gasto,
            List<Long> participantesIds,
            Usuario pagador) {


        if (participantesIds == null
                || participantesIds.isEmpty()) {

            throw new IllegalArgumentException(
                    "Debe haber al menos un participante"
            );

        }


        List<Usuario> participantes =
                obtenerParticipantes(
                        participantesIds
                );


        int numeroParticipantes =
                participantes.size();


        /*
         * Trabajamos en céntimos para
         * evitar problemas de decimales.
         */
        int totalCentimos =
                gasto.importe
                        .movePointRight(2)
                        .intValueExact();


        /*
         * Caso de un único participante.
         */
        if (numeroParticipantes == 1) {

            guardarReparto(
                    gasto,
                    participantes.get(0),
                    totalCentimos
            );

            return;

        }


        int centimosBase =
                totalCentimos
                        / numeroParticipantes;


        int restoCentimos =
                totalCentimos
                        % numeroParticipantes;


        /*
         * Si la división es exacta,
         * todos pagan lo mismo.
         */
        if (restoCentimos == 0) {

            for (Usuario usuario : participantes) {

                guardarReparto(
                        gasto,
                        usuario,
                        centimosBase
                );

            }

            return;

        }


        /*
         * Si hay resto:
         *
         * Los participantes que no son
         * el pagador reciben el redondeo
         * hacia arriba.
         *
         * El pagador recibe el resto.
         */
        int centimosOtros =

                BigDecimal.valueOf(
                        totalCentimos
                )
                .divide(
                        BigDecimal.valueOf(
                                numeroParticipantes
                        ),
                        0,
                        RoundingMode.CEILING
                )
                .intValue();


        int numeroOtros =
                numeroParticipantes - 1;


        int centimosPagador =

                totalCentimos
                        - (
                                centimosOtros
                                        * numeroOtros
                        );


        for (Usuario usuario : participantes) {


            if (usuario.id.equals(
                    pagador.id
            )) {

                guardarReparto(
                        gasto,
                        usuario,
                        centimosPagador
                );

            } else {

                guardarReparto(
                        gasto,
                        usuario,
                        centimosOtros
                );

            }

        }

    }


    /*
     * Elimina todos los repartos
     * de un gasto.
     */
    @Transactional
    public void eliminarRepartosDeGasto(
            Long gastoId) {


        repartoGastoRepository.delete(
                "gasto.id",
                gastoId
        );

    }


    /*
     * Busca y devuelve los usuarios
     * participantes.
     */
    private List<Usuario> obtenerParticipantes(
            List<Long> participantesIds) {


        List<Usuario> participantes =
                new ArrayList<>();


        for (Long usuarioId : participantesIds) {


            Usuario usuario =
                    usuarioRepository.findById(
                            usuarioId
                    );


            if (usuario == null) {

                throw new IllegalArgumentException(
                        "Usuario no encontrado: "
                                + usuarioId
                );

            }


            participantes.add(
                    usuario
            );

        }


        return participantes;

    }


    /*
     * Guarda un reparto.
     */
    private void guardarReparto(
            Gasto gasto,
            Usuario usuario,
            int centimos) {


        BigDecimal importe =

                BigDecimal.valueOf(
                        centimos
                )
                .movePointLeft(2)
                .setScale(2);


        RepartoGasto reparto =
                new RepartoGasto();


        reparto.gasto =
                gasto;

        reparto.usuario =
                usuario;

        reparto.importe =
                importe;


        repartoGastoRepository.persist(
                reparto
        );

    }


}
