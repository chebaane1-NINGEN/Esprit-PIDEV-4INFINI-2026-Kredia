# Kredia – AI-Powered Microfinance Platform

## Overview

This project was developed as part of the PIDEV – 4th Year Engineering Program at **Esprit School of Engineering** (Academic Year 2025–2026).

Kredia is a full-stack microfinance platform designed to simplify and modernize the credit management process through intelligent digital services. The platform provides advanced features such as loan simulation, online credit applications, transaction management, AI-powered financial assistance, cloud image storage, and external financial data integration.

The backend is built with Spring Boot and follows a modular and scalable architecture to ensure maintainability, portability, and extensibility.

---

## Features

* User authentication and account management
* Loan simulation and credit application system
* Credit approval and repayment tracking
* Transaction and invoice management
* AI-powered financial assistant using Google Gemini
* Email notification system with Brevo
* Cloud image upload using Cloudinary
* Financial market integration with Alpha Vantage API
* Blockchain integration with Hedera SDK
* Investment and portfolio management
* Complaint and notification management
* Secure REST API architecture

---

## Tech Stack

### Backend

* Java 17
* Spring Boot 3.2.2
* Spring Data JPA
* Maven
* Lombok
* Flyway

### Database

* MySQL

### External Services

* Google Gemini AI
* Brevo API
* Cloudinary
* Alpha Vantage API
* Hedera SDK

### Dev Tools

* Spring DevTools
* Git & GitHub
* Postman

---

## Architecture

The project follows a layered Spring Boot architecture:

* Controller Layer
* Service Layer
* Repository Layer
* Entity Layer

The system is designed using modular principles to facilitate scalability and maintainability. External APIs and third-party services are integrated through dedicated service modules.

---

## Project Structure

```txt
kredia/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/kredia/
│   │   │       └── KrediaApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/
│           └── com/kredia/
│               └── KrediaApplicationTests.java
├── pom.xml
└── README.md
```

---

## Getting Started

### Prerequisites

* Java 17 or higher
* Maven 3.6+
* MySQL Server

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd kredia
```

Compile the project:

```bash
mvn clean install
```

Run the application:

```bash
mvn spring-boot:run
```

The application will start on:

```txt
http://localhost:8080
```

---

## Useful Maven Commands

### Compile the project

```bash
mvn clean compile
```

### Run tests

```bash
mvn test
```

### Generate JAR package

```bash
mvn clean package
```

### Clean the project

```bash
mvn clean
```

---

## Email Configuration (Brevo)

The project uses Brevo for transactional email services.

### Quick Setup

Create environment variables:

```bash
export BREVO_API_KEY="your-api-key"
export MAIL_FROM="noreply@kredia.com"
```

### Documentation

* BREVO_SETUP_GUIDE.md
* EMAIL_NOTIFICATION_SETUP.md
* DATABASE_SETUP.md
* MIGRATIONS_GUIDE.md

---

## Contributors

* Mohamed Youssef Mellouli
* Project Team – PIDEV

---

## Academic Context

Developed at **Esprit School of Engineering – Tunisia**

PIDEV – 4INFINI1 | 2025–2026

This academic project aims to:

* Build a robust Spring Boot architecture
* Integrate modern external APIs and AI services
* Apply software engineering best practices
* Develop scalable and maintainable enterprise applications

---

## Deployment

The project can be deployed using:

* Render
* Railway
* Vercel
* DigitalOcean
* Docker

---

## Acknowledgments

Special thanks to **Esprit School of Engineering**, supervisors, and all contributors who supported the development of this project.
