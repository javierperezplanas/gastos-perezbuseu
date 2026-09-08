package com.perezbuseu.gastos.miembro;

import com.perezbuseu.gastos.grupo.Grupo;
import com.perezbuseu.gastos.grupo.GrupoRepository;
import com.perezbuseu.gastos.usuario.Usuario;
import com.perezbuseu.gastos.usuario.UsuarioRepository;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.time.LocalDateTime;
import java.util.List;

@Path("/api/grupos")
@Produces(MediaType.APPLICATION_JSON)
public class MiembroGrupoResource {

    @Inject
    MiembroGrupoRepository miembroGrupoRepository;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    GrupoRepository grupoRepository;

    @GET
    @Path("/{grupoId}/miembros")
    public List<MiembroGrupo> listarMiembros(
            @PathParam("grupoId") Long grupoId) {

        return miembroGrupoRepository.list("grupo.id", grupoId);
    }

    @POST
    @Path("/{grupoId}/miembros/{usuarioId}")
    @Transactional
    public MiembroGrupo añadirMiembro(
            @PathParam("grupoId") Long grupoId,
            @PathParam("usuarioId") Long usuarioId) {

        Grupo grupo = grupoRepository.findById(grupoId);

        Usuario usuario = usuarioRepository.findById(usuarioId);

        if (grupo == null) {
            throw new IllegalArgumentException("Grupo no encontrado");
        }

        if (usuario == null) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }

        MiembroGrupo miembro = new MiembroGrupo();

        miembro.grupo = grupo;
        miembro.usuario = usuario;
        miembro.fechaAlta = LocalDateTime.now();

        miembroGrupoRepository.persist(miembro);

        return miembro;
    }
}
