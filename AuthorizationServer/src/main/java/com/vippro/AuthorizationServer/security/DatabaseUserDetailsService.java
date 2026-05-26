package com.vippro.AuthorizationServer.security;

import com.vippro.AuthorizationServer.model.User;
import com.vippro.AuthorizationServer.repository.UsersRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {
    private final UsersRepository usersRepository;

    public DatabaseUserDetailsService(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = usersRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new SecurityUsers(user);
    }
}
