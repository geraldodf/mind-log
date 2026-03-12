package com.mindlog.infra.security;

import com.mindlog.data.models.User;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

@Getter
@Setter
public class CustomUser extends org.springframework.security.core.userdetails.User {

    private Long id;
    private String name;

    public CustomUser(Long id, String username, String name, String password, Boolean isEnabled, boolean accountNonExpired, boolean credentialsNonExpired, boolean accountNonLocked, Collection<? extends GrantedAuthority> authorities) {
        super(username, password, isEnabled, accountNonExpired, credentialsNonExpired, accountNonLocked, authorities);
        this.id = id;
        this.name = name;
    }

    public CustomUser(User user, boolean accountNonExpired, boolean credentialsNonExpired, boolean accountNonLocked) {
        super(user.getUsername(), user.getPassword() != null ? user.getPassword() : "", user.isEnabled(), accountNonExpired, credentialsNonExpired, accountNonLocked, user.getAuthorities());
        this.id = user.getId();
        this.name = user.getName();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
