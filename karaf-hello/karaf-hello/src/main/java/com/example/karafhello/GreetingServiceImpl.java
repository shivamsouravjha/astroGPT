package com.example.karafhello;

public class GreetingServiceImpl implements GreetingService {
    @Override
    public String getGreeting() {
        return "Hello from Karaf!";
    }
}
