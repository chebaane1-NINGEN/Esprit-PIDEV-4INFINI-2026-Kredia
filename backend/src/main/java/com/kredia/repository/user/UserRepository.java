package com.kredia.repository.user;

import com.kredia.entity.user.User;
import com.kredia.entity.user.UserRole;
import com.kredia.entity.user.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByIdAndDeletedFalse(Long id);

    Optional<User> findByEmailAndDeletedFalse(String email);

    Optional<User> findByVerificationToken(String verificationToken);

    boolean existsByEmailAndDeletedFalse(String email);

    boolean existsByEmailAndDeletedFalseAndIdNot(String email, Long id);

    boolean existsByPhoneNumberAndDeletedFalse(String phoneNumber);

    boolean existsByPhoneNumberAndDeletedFalseAndIdNot(String phoneNumber, Long id);

    long countByRoleAndDeletedFalse(UserRole role);

    long countByRoleAndDeletedFalseAndStatus(UserRole role, UserStatus status);

    long countByStatusAndDeletedFalse(UserStatus status);

    long countByDeletedFalse();

    long countByCreatedAtAfterAndDeletedFalse(Instant createdAt);

    @org.springframework.data.jpa.repository.Query(value = "SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count FROM user WHERE deleted = false GROUP BY month ORDER BY month DESC LIMIT 6", nativeQuery = true)
    java.util.List<Object[]> countRegistrationsByMonth();

    Page<User> findAllByRoleAndDeletedFalse(UserRole role, Pageable pageable);

    Page<User> findAllByRoleAndEmailContainingIgnoreCaseAndDeletedFalse(
        UserRole role, String email, Pageable pageable);
    Page<User> findAllByRoleAndStatusAndDeletedFalse(
        UserRole role, UserStatus status, Pageable pageable);
    Page<User> findAllByRoleAndEmailContainingIgnoreCaseAndStatusAndDeletedFalse(
        UserRole role, String email, UserStatus status, Pageable pageable);

    Page<User> findAllByAssignedAgentAndDeletedFalse(User agent, Pageable pageable);

    List<User> findAllByAssignedAgentAndDeletedFalse(User agent);
    List<User> findAllByAssignedAgentAndRoleAndDeletedFalse(User agent, UserRole role);

    // Agent client filters
    Page<User> findAllByAssignedAgentAndRoleAndDeletedFalse(User agent, UserRole role, Pageable pageable);
    Page<User> findAllByAssignedAgentAndRoleAndEmailContainingIgnoreCaseAndDeletedFalse(
        User agent, UserRole role, String email, Pageable pageable);
    Page<User> findAllByAssignedAgentAndRoleAndStatusAndDeletedFalse(
        User agent, UserRole role, UserStatus status, Pageable pageable);
    Page<User> findAllByAssignedAgentAndRoleAndEmailContainingIgnoreCaseAndStatusAndDeletedFalse(
        User agent, UserRole role, String email, UserStatus status, Pageable pageable);
    
    long countByAssignedAgentAndDeletedFalse(User agent);

    // ==================== Time-Based Queries for Analytics ====================
    
    long countByCreatedAtBetweenAndDeletedFalse(Instant startDate, Instant endDate);
    
    List<User> findByCreatedAtBetweenAndDeletedFalse(Instant startDate, Instant endDate);
    
    List<User> findAllByRoleAndDeletedFalse(UserRole role);
}
