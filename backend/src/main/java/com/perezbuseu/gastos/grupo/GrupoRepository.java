package com.perezbuseu.gastos.grupo;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GrupoRepository implements PanacheRepository<Grupo> {

}
