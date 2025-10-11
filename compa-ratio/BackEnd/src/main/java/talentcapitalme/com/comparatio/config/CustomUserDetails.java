package talentcapitalme.com.comparatio.config;



import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import talentcapitalme.com.comparatio.entity.User;

import java.util.Collection;

public class CustomUserDetails implements UserDetails {
    private final User user;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(User user, Collection<? extends GrantedAuthority> authorities) {
        this.user = user;
        this.authorities = authorities;
    }

    public String getId() {
        return user.getId();
    }
    
    public String getClientName() {
        return user.getName();
    }
    
    public Boolean getClientActive() {
        return user.getActive();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        // Check if user is active (for CLIENT_ADMIN users) or if it's a SUPER_ADMIN
        if (user.getRole() == talentcapitalme.com.comparatio.enumeration.UserRole.CLIENT_ADMIN) {
            return user.getActive() != null && user.getActive();
        }
        // SUPER_ADMIN is always enabled
        return true;
    }
}