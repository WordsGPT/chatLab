# ChatWords

This project is a robust and scalable platform for the management and automation of experiments with **Large Language Models (LLMs)**. It allows users to create, parameterize, and run tests in a structured, efficient, and reproducible manner.

The tool is an expansion of the base project **ChatWords**, with the goal of being more accessible to users without programming knowledge. Experiments are defined with custom variables and prompts, and the results are logged in a database, facilitating the analysis and optimization of the models.

## Architecture
The platform follows a modular architecture:
- Angular frontend.
- NestJS backend with PostgreSQL.
- LiteLLM proxy for LLM provider abstraction.

## Use Case Diagram
The use case diagram provides an overview of the main functionalities of the system and how different actors interact with it.  
This type of diagram helps to identify the objectives users can achieve through the application, as well as the relationships between the different use cases and the actors involved.

The main actors of the application are the **User** and the **Administrator**.  
In the diagram, the **Administrator** inherits from the **User**, since they share the same use cases but add three additional functionalities exclusive to their role.  
As for the secondary actors, only the **LLM models** are included, which intervene during the execution of experiments by being queried to generate the corresponding responses.

## Domain Model Diagram
The domain model represents a conceptual view of the main elements of the system.  
Its purpose is to describe the key entities, their attributes, and the relationships among them, without focusing on technical implementation or persistence details.

In this application, the domain model reflects the ecosystem where **users**, **experiments**, **prompts**, and **queries** interact with different **LLM providers and models**.  
This model serves as the foundation for the logical architecture, the database design, and the implementation of the use cases.

### Key Entities
- **User**: represents the people who interact with the system. A user can create experiments, queries, and prompts.  
- **Experiment**: the core of the application, defined by the user and composed of prompts and variables. Each experiment can generate multiple queries and run on different LLM models.  
- **Query**: represents each execution of an experiment in a specific context. A query belongs to a single experiment and is created by a user.  
- **Prompt**: textual statements that are part of experiments, generating responses when queries are executed. Prompts can be reused across experiments.  
- **Variable**: configurable parameters that customize the execution of experiments.  
- **LLM Model**: represents the language models used in experiments. Each model belongs to a specific provider and can be reused.  
- **Provider**: groups the LLM models offered by the same company or service (e.g., OpenAI, Anthropic).  

### Relationships
- A **User** can create multiple **Experiments**, **Queries**, and **Prompts**.  
- An **Experiment** has one or many **Prompts** and **Variables**, and can be linked to multiple **Queries**. Each experiment belongs to one **User**.  
- **Prompts** belong to a single **User**, but can be reused across multiple **Experiments**.  
- A **Query** belongs to one **User** and one **Experiment**.  
- A **Variable** always belongs to a single **Experiment**.  
- A **Provider** can offer multiple **LLM Models**, which can be associated with different **Experiments**.  

## Requirements

Before getting started, make sure you have the following installed:

### System
- **Node.js** >= v20.17.0
- **Docker** >= v24.0.6
- **Docker Compose** >= v2.23.0
- **PostgreSQL** >= v17

### Frontend
- **Angular** >= v19.2

### Backend
- **NestJS** >= v11.0.7
