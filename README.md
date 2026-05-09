# Kredia – AI-Powered Microfinance Platform

## Overview

This project was developed as part of the PIDEV – 4th Year Engineering Program at **Esprit School of Engineering** (Academic Year 2025–2026).

Kredia is a full-stack microfinance platform that modernizes credit management through intelligent digital services. It enables users to simulate loans, apply for credits online, track repayments, manage transactions, and interact with AI-powered financial tools. The platform also includes an administrative dashboard for risk analysis and credit management.

The system is composed of a **Spring Boot backend** and an **Angular frontend**, designed with a modular and scalable architecture.

---

## Features

* Credit simulation system
* Online loan application workflow
* Credit approval and repayment tracking
* Transaction and invoice management
* AI-powered financial assistant (Gemini API)
* Email notifications (Brevo)
* Cloud image storage (Cloudinary)
* Financial market data integration (Alpha Vantage)
* Blockchain integration (Hedera SDK)
* Investment and portfolio management
* Admin dashboard with risk analysis
* Secure authentication system
* RESTful API communication

---

## Tech Stack

### Frontend

* Angular 21
* TypeScript
* RxJS
* SCSS
* Angular Forms & Router

### Backend

* Java 17
* Spring Boot 3.2.2
* Spring Data JPA
* Spring Security
* Maven
* Lombok
* Flyway
* MySQL

---

## Architecture

The system follows a layered full-stack architecture:

### Frontend Architecture

* Components Layer
* Services Layer
* Routing Module
* Shared Modules
* Reactive State Management (RxJS)

### Backend Architecture

* Controller Layer (REST APIs)
* Service Layer (Business Logic)
* Repository Layer (Data Access)
* Entity Layer (Database Models)

### Global Architecture

* REST API communication between frontend and backend
* Modular and scalable design
* External API integrations (AI, finance, blockchain)
* Secure and maintainable structure

---

## Contributors

Presented by the Unity Nexus team:

- Mouhamed Ali Abidi  
- Mohamed Youssef Mellouli  
- Mohamed Aziz Ayed  
- Haroun Chebbane  
- Ghassen Hamdi  

---

## Academic Context

Developed at **Esprit School of Engineering – Tunisia**

PIDEV – 4INFINI1 | Academic Year 2025–2026

This project aims to:

* Build a scalable full-stack architecture
* Integrate AI and financial technologies
* Apply software engineering best practices
* Develop enterprise-level web applications

---

## Getting Started

### Prerequisites

* Node.js 18+
* Angular CLI
* Java 17+
* Maven 3.6+
* MySQL

---

### Backend Setup

```bash
git clone <repository-url>
cd kredia
mvn clean install
mvn spring-boot:run
```

Backend runs at:

```txt
http://localhost:8080
```

---

### Frontend Setup

```bash
cd front
npm install
npm start
```

Frontend runs at:

```txt
http://localhost:4200
```

---

## Acknowledgments

Special thanks to **Esprit School of Engineering**, supervisors, and all contributors who supported the development of this project.
