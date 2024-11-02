# Bookstore Database Project

## Project Overview

This project involves the design, implementation, and querying of a bookstore database using Supabase. It includes the creation of a relational database, a RESTful API endpoint using Supabase Edge Functions, and advanced SQL queries.


## Table of Contents

- [1. Database Design](#1-database-design)
- [2. RESTful API Endpoint](#2-restful-api-endpoint)
- [3. API Demonstration](#5-api-demonstration)
- [4. Design Choices](#6-design-choices)


## 1. Database Design

### Tables

#### Books Table
- `book_id`: Primary key, unique identifier for each book.
- `title`: Title of the book.
- `author_id`: Foreign key referencing the `author_id` in the Authors table.
- `price`: Price of the book.
- `publish_date`: Date when the book was published.

#### Authors Table
- `author_id`: Primary key, unique identifier for each author.
- `name`: Name of the author.
- `phone`: Phone of the author.
- `country`: Country of the author.

#### Countries Table
- `country_id`: Primary key, unique identifier for each country.
- `title`: Title of the country.
- `code`: code of the country.

### Foreign Key Constraints
- The `author_id` in the Books table is a foreign key that references the `author_id` in the Authors table, ensuring referential integrity.
- The `country_id` in the Authors table is a foreign key that references the `country_id` in the Countries table, ensuring referential integrity.


## 2. RESTful API Endpoint

### Endpoint
- **GET /books**
  - **Query Parameters**:
    - `action` (require): getBooks
        - `author_id` (optional): Filter books by the specific author.
        - `sort` (optional): Sort books by `publish_date`.
        - `page` (optional): Pagination parameter to fetch specific pages of results.
        - `limit` (optional): Limit the number of results returned.
    - `action` (require): getBooksWithAuthors
        - `year` (optional): Filter `publish_date` by a year.

- **GET /authors**
  - **Query Parameters**:
    - `action` (require): getAuthorsWithMoreThan5Books
    - `action` (require): getAverageBookPriceByCountry

### Error Handling
The API includes error handling to return appropriate HTTP status codes for various scenarios (e.g., 400 for bad requests, 404 for not found, 401 for unauthorized access).

### Security
This API is secured using Supabase authentication, ensuring that only authenticated users can access the endpoint.

## 3. API Demonstration

You can test the API using Postman. A collection is provided in the `postman` folder. Import the collection to Postman to test the `/books`, `/authors` endpoint with various query parameters.

## 4. Design Choices

- **Relational Database**: Chose a relational database for structured data representation and to maintain relationships between books and authors.
- **Supabase Edge Functions**: Used for easily deploying serverless functions and handling API requests while ensuring scalability and performance.
- **Security**: Implemented authentication to protect the API and ensure only authorized users can access the data.
