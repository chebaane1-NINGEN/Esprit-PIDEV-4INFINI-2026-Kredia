package com.kredia.repository;

import com.kredia.entity.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Set;

public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    List<UserActivity> findByTargetIdOrderByTimestampAsc(Long targetId);

    List<UserActivity> findByTargetIdInOrderByTimestampAsc(Set<Long> targetIds);
}
