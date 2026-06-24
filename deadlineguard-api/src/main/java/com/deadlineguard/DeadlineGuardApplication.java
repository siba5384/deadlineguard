package com.deadlineguard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DeadlineGuardApplication {
    public static void main(String[] args) {
        SpringApplication.run(DeadlineGuardApplication.class, args);
    }
}
