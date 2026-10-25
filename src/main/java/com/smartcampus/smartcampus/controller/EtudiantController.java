package com.smartcampus.smartcampus.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/etudiant")
public class EtudiantController {

    @GetMapping("/test")
    public String testEtudiantAccess() {
        return "Accès autorisé : ETUDIANT";
    }
}