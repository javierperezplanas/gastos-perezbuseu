package com.perezbuseu.gastos.gasto;

import io.quarkus.hibernate.orm.panache.PanacheRepository;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GastoRepository implements PanacheRepository<Gasto> {
}
