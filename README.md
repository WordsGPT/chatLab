# ChatWords

This repository contains the source code for a robust and scalable platform that automates the management and execution of experiments with Large Language Models. It is an expansion of the ChatWords project, designed for users without programming knowledge to easily define, run, and analyze LLM tests.

## Description

This project is a robust and scalable platform for the management and automation of experiments with **Large Language Models (LLMs)**. It allows users to create, parameterize, and run tests in a structured, efficient, and reproducible manner.

The tool is an expansion of the base project **ChatWords**, with the goal of being more accessible to users without programming knowledge. Experiments are defined with custom variables and prompts, and the results are logged in a database, facilitating the analysis and optimization of the models.

### Architecture
The platform follows a modular architecture:
- Angular frontend  
- NestJS backend with PostgreSQL  
- LiteLLM proxy for LLM provider abstraction


