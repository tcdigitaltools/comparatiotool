package talentcapitalme.com.comparatio.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import talentcapitalme.com.comparatio.entity.User;
import talentcapitalme.com.comparatio.enumeration.UserRole;
import talentcapitalme.com.comparatio.repository.UserRepository;

/**
 * Initializes the default admin user on application startup.
 * Only creates the admin user if it doesn't already exist.
 * This ensures passwords are never overwritten on restart.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Order(1) // Run before other CommandLineRunners
public class AdminUserConfig implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "admin@talentcapital.com";
    private static final String ADMIN_USERNAME = "admin";
    private static final String DEFAULT_PASSWORD = "admin";

    @Override
    public void run(String... args) {
        try {
            // Check if admin user already exists
            boolean adminExists = userRepository.findByEmail(ADMIN_EMAIL).isPresent();
            
            if (adminExists) {
                log.info("✅ Admin user already exists: {}", ADMIN_EMAIL);
                log.info("ℹ️  Skipping admin user creation - existing user will be preserved");
                return;
            }

            // Check if admin user exists by username (in case email was changed)
            boolean adminByUsernameExists = userRepository.findByUsername(ADMIN_USERNAME).isPresent();
            if (adminByUsernameExists) {
                log.info("✅ Admin user with username '{}' already exists", ADMIN_USERNAME);
                log.info("ℹ️  Skipping admin user creation - existing user will be preserved");
                return;
            }

            // Create new admin user only if it doesn't exist
            log.info("🔧 Creating default admin user: {}", ADMIN_EMAIL);
            
            User admin = new User();
            admin.setEmail(ADMIN_EMAIL);
            admin.setUsername(ADMIN_USERNAME);
            admin.setFullName("Talent Capital Administrator");
            admin.setPasswordHash(passwordEncoder.encode(DEFAULT_PASSWORD));
            admin.setRole(UserRole.SUPER_ADMIN);
            admin.setName("Talent Capital");
            admin.setIndustry("Technology");
            admin.setActive(true);

            User savedAdmin = userRepository.save(admin);
            
            log.info("✅ Default admin user created successfully");
            log.info("   Email: {}", savedAdmin.getEmail());
            log.info("   Username: {}", savedAdmin.getUsername());
            log.info("   Role: {}", savedAdmin.getRole());
            log.warn("⚠️  SECURITY: Please change the default password '{}' after first login!", DEFAULT_PASSWORD);
            
        } catch (Exception e) {
            log.error("❌ Error during admin user initialization", e);
            // Don't throw exception - allow application to continue
            // If admin user creation fails, it can be created manually via API
        }
    }
}
