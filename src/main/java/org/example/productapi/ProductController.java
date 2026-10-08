package org.example.productapi;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
public class ProductController {

    @GetMapping("/api/hello")
    public String hello() {
        return "Hello from taitran + Docker!";
    }

}