package com.perezbuseu.gastos.grupo;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/grupos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GrupoResource {

    @Inject
    GrupoRepository grupoRepository;

    @GET
    public List<Grupo> listar() {
        return grupoRepository.listAll();
    }

    @POST
    @Transactional
    public Grupo crear(Grupo grupo) {
        grupoRepository.persist(grupo);

        return grupo;
    }
}
