package com.smartcampus.smartcampus.repository;

import com.smartcampus.smartcampus.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BuildingRepository extends JpaRepository<Building, Long> {

    Optional<Building> findByName(String name);

    boolean existsByName(String name);
}
