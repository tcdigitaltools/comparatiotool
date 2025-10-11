package talentcapitalme.com.comparatio.service;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import talentcapitalme.com.comparatio.entity.User;
import talentcapitalme.com.comparatio.enumeration.UserRole;
import talentcapitalme.com.comparatio.repository.AdjustmentMatrixRepository;
import talentcapitalme.com.comparatio.repository.UserRepository;

import java.util.List;

// Seeds default data on application startup
@Component
@RequiredArgsConstructor
public class SeedService implements CommandLineRunner {

    private final AdjustmentMatrixRepository matrixRepo;
    private final UserRepository userRepo;
    private final MatrixSeederService matrixSeederService;

    @Override
    public void run(String... args) {
        if (matrixRepo.count() > 0) return;
        
        List<User> clientAdmins = userRepo.findByRoleAndActiveTrue(UserRole.CLIENT_ADMIN);
        
        if (clientAdmins.isEmpty()) {
            return;
        }
        
        for (User clientAdmin : clientAdmins) {
            if (!matrixRepo.existsByClientId(clientAdmin.getId())) {
                matrixSeederService.seedDefaultsForClient(clientAdmin.getId());
            }
        }
    }

}
