package com.kredia.repository;

import com.kredia.entity.support.Reclamation;
import com.kredia.enums.ReclamationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {
    List<Reclamation> findByUserUserId(Long userId);
    List<Reclamation> findByStatus(ReclamationStatus status);
}
