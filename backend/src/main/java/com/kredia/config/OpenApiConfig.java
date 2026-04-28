package com.kredia.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @org.springframework.beans.factory.annotation.Value("${app.backend.url}")
    private String backendUrl;

    @Bean
    public GroupedOpenApi userModuleApi() {
        return GroupedOpenApi.builder()
                .group("user-module")
                .packagesToScan("com.kredia.controller")
                .pathsToMatch("/api/user/**")
                .build();
    }

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .addServersItem(new Server().url(backendUrl))
                .info(new io.swagger.v3.oas.models.info.Info()
                        .title("Kredia API")
                        .version("1.0.0")
                        .description("Kredia Banking Platform API Documentation"));
    }
}
