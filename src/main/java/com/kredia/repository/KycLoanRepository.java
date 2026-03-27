package com.kredia.repository;

import com.kredia.entity.credit.KycLoan;
import com.kredia.enums.DocumentTypeLoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KycLoanRepository extends JpaRepository<KycLoan, Long> {

    List<KycLoan> findByCredit_Id(Long id);

    Optional<KycLoan> findByCredit_IdAndDocumentType(Long id, DocumentTypeLoan documentType);

    List<KycLoan> findByUser_Id(Long userId);
}
