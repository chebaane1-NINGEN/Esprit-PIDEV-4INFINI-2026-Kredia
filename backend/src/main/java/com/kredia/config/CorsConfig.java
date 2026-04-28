package com.kredia.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        // Allow both localhost and 127.0.0.1 with any port for development
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:[*]", 
            "http://127.0.0.1:[*]",
            "http://localhost:51070",
            "http://localhost:4200"
        ));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Actor-Id", "X-Requested-With", "Accept", "Origin"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        config.setExposedHeaders(List.of("Authorization", "X-Actor-Id"));
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("http://localhost:[*]", "http://127.0.0.1:[*]")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "X-Actor-Id")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
