package com.perezbuseu.gastos.actividad;

import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;


@ApplicationScoped
public class ActividadService {


    private final ActividadRepository actividadRepository;


    public ActividadService(
            ActividadRepository actividadRepository
    ) {

        this.actividadRepository =
        actividadRepository;

    }


    /*
     * Registrar una nueva actividad.
     */
    @Transactional
    public void registrarActividad(

            Long grupoId,

            String tipo,

            String descripcion

    ) {

        Actividad actividad =
        new Actividad();

        actividad.grupoId =
        grupoId;

        actividad.tipo =
        tipo;

        actividad.descripcion =
        descripcion;


        actividadRepository.persist(
                actividad
        );

    }


    /*
     * Obtener las actividades
     * de un grupo.
     */
    public List<Actividad>
    obtenerPorGrupo(

            Long grupoId

    ) {

        return actividadRepository
                .list(
                        "grupoId = ?1 order by fechaHora desc",
                        grupoId
                );

    }

}
