package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.DiningTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiningTableRepository extends JpaRepository<DiningTable, String> {
    Optional<DiningTable> findByName(String name);
    List<DiningTable> findAllByOrderByFloorAscIdAsc();
    List<DiningTable> findByFloorOrderByIdAsc(Integer floor);
}
