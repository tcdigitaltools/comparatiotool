package talentcapitalme.com.comparatio.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import talentcapitalme.com.comparatio.entity.User;
import talentcapitalme.com.comparatio.enumeration.UserRole;
import talentcapitalme.com.comparatio.exception.NotFoundException;
import talentcapitalme.com.comparatio.exception.ValidationException;
import talentcapitalme.com.comparatio.repository.AdjustmentMatrixRepository;
import talentcapitalme.com.comparatio.repository.UserRepository;

import java.util.List;

// Manages CLIENT_ADMIN users and their associated data
@Service
@RequiredArgsConstructor
public class UserManagementService implements IUserManagementService {

    private final UserRepository userRepository;
    private final AdjustmentMatrixRepository matrixRepository;
    private final MatrixSeederService matrixSeederService;

    public List<User> getAllClientAdmins() {
        return userRepository.findByRole(UserRole.CLIENT_ADMIN);
    }

    public User getClientAdminById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        
        if (user.getRole() != UserRole.CLIENT_ADMIN) {
            throw new NotFoundException("User with id " + id + " is not a CLIENT_ADMIN");
        }
        
        return user;
    }

    public User createClientAdmin(User user) {
        if (userRepository.existsByName(user.getName())) {
            throw new ValidationException("CLIENT_ADMIN with name '" + user.getName() + "' already exists");
        }

        user.setRole(UserRole.CLIENT_ADMIN);
        user.setActive(true);
        
        User savedUser = userRepository.save(user);
        matrixSeederService.seedDefaultsForClient(savedUser.getId());

        return savedUser;
    }

    public User updateClientAdmin(String id, User userUpdate) {
        User existingUser = getClientAdminById(id);

        if (userUpdate.getName() != null) {
            if (!userUpdate.getName().equals(existingUser.getName()) && 
                userRepository.existsByName(userUpdate.getName())) {
                throw new ValidationException("CLIENT_ADMIN with name '" + userUpdate.getName() + "' already exists");
            }
            existingUser.setName(userUpdate.getName());
        }
        
        if (userUpdate.getActive() != null) {
            existingUser.setActive(userUpdate.getActive());
        }

        return userRepository.save(existingUser);
    }

    public void deleteClientAdmin(String id) {
        getClientAdminById(id);
        matrixRepository.deleteByClientId(id);
        userRepository.deleteById(id);
    }

    public User activateClientAdmin(String id) {
        User user = getClientAdminById(id);
        user.setActive(true);
        return userRepository.save(user);
    }

    public User deactivateClientAdmin(String id) {
        User user = getClientAdminById(id);
        user.setActive(false);
        return userRepository.save(user);
    }

    public List<User> getActiveClientAdmins() {
        return userRepository.findByRoleAndActiveTrue(UserRole.CLIENT_ADMIN);
    }
}
