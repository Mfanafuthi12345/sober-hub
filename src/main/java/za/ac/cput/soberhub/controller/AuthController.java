package za.ac.cput.soberhub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mail.MailException;
import org.springframework.web.bind.annotation.*;
import za.ac.cput.soberhub.service.VerificationEmailService;
import za.ac.cput.soberhub.domain.User;
import za.ac.cput.soberhub.dto.AuthResponse;
import za.ac.cput.soberhub.dto.LoginRequest;
import za.ac.cput.soberhub.dto.RegisterRequest;
import za.ac.cput.soberhub.repository.UserRepository;
import za.ac.cput.soberhub.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final VerificationEmailService verificationEmailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          VerificationEmailService verificationEmailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.verificationEmailService = verificationEmailService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest req) {
        if (req.getEmail() == null || req.getPassword() == null
                || req.getFirstName() == null || req.getLastName() == null
                || req.getFirstName().isBlank() || req.getLastName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "First name, last name, email, and password are required."));
        }
        String email = req.getEmail().trim().toLowerCase(Locale.ROOT);
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Enter a valid email address."));
        }
        if (req.getPassword().length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters."));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already in use."));
        }
        User user = new User();
        user.setFirstName(req.getFirstName().trim());
        user.setLastName(req.getLastName().trim());
        user.setEmail(email);
        user.setPhone(req.getPhone());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole("member");
        String token = createVerificationToken(user);
        userRepository.save(user);
        try {
            verificationEmailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), token);
        } catch (MailException | IllegalStateException e) {
            logger.error("Could not send verification email to {}", user.getEmail(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Your account was created, but the verification email could not be sent. Check the mail configuration and request another verification email."
            ));
        }
        return ResponseEntity.ok(Map.of("message", "Account created. Check your email for a verification link."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        }
        User user = userRepository.findByEmail(req.getEmail().trim().toLowerCase(Locale.ROOT)).orElse(null);
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password."));
        }
        if (!user.isEmailVerified()) {
            return ResponseEntity.status(403).body(Map.of(
                    "code", "EMAIL_NOT_VERIFIED",
                    "error", "Verify your email before logging in. You can request a new verification email."
            ));
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(
                token, user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getRole(), user.getMembershipStatus()
        ));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Verification link is invalid."));
        }
        User user = userRepository.findByVerificationTokenHash(hashToken(token)).orElse(null);
        if (user == null || user.getVerificationTokenExpiresAt() == null
                || user.getVerificationTokenExpiresAt().isBefore(Instant.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "This verification link is invalid or expired. Request a new one."));
        }
        user.setEmailVerified(true);
        user.setVerificationTokenHash(null);
        user.setVerificationTokenExpiresAt(null);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Email verified. You can now log in."));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }
        User user = userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT)).orElse(null);
        if (user == null || user.isEmailVerified()) {
            return ResponseEntity.ok(Map.of("message", "If the account needs verification, a new email will be sent."));
        }

        String token = createVerificationToken(user);
        userRepository.save(user);
        try {
            verificationEmailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), token);
        } catch (MailException | IllegalStateException e) {
            logger.error("Could not resend verification email to {}", user.getEmail(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Verification email could not be sent. Check the mail configuration and try again."));
        }
        return ResponseEntity.ok(Map.of("message", "A new verification email has been sent."));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (!passwordEncoder.matches(body.get("currentPassword"), user.getPasswordHash())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect."));
        }
        user.setPasswordHash(passwordEncoder.encode(body.get("newPassword")));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    private String createVerificationToken(User user) {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String token = HexFormat.of().formatHex(bytes);
        user.setVerificationTokenHash(hashToken(token));
        user.setVerificationTokenExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        return token;
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is unavailable.", e);
        }
    }
}
