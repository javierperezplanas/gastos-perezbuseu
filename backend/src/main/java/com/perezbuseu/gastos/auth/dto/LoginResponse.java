package com.perezbuseu.gastos.auth.dto;


public class LoginResponse {


    public Long id;


    public String nombre;


    public String email;


    public LoginResponse(
            Long id,
            String nombre,
            String email) {

        this.id =
                id;

        this.nombre =
                nombre;

        this.email =
                email;

    }

}
