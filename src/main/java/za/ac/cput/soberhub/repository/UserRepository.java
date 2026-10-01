package za.ac.cput.soberhub.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import za.ac.cput.soberhub.domain.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByVerificationTokenHash(String verificationTokenHash);
}
