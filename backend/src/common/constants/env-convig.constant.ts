// This file defines constants for environment configuration in the application
// If the environment variable is not set, a default value is used
export const {
  // Application configuration
  BACKEND_PORT: backend_port = 3000,
  PROXY_URI: proxy_uri = 'http://localhost:4000',
  LITELLM_MASTER_KEY: litellm_api_key,

  // JWT configuration
  JWT_SECRET:
    jwt_secret = 'f248ccfe9f7cd4160305d5558402784868fe5c3345d223f8b13fa709ec15301360cfc41d9557c326d52c8179cde6b31c29f2f5bc1b7764520354e9b18f0a5533',
  JWT_REFRESH_SECRET:
    jwt_refresh_secret = '6ab61ca570a97ee9dab458c38fe8162604d6d9c4a242c8e0f26bacbd4316c4c5dd6abeec8a267093120cfe899a5a9e3ba7a9d1fe4a8a303b8ee210d794366329',

  // Database configuration
  DATABASE_HOST: database_host = 'localhost',
  DATABASE_PORT: database_port = '5432',
  DATABASE_USERNAME: database_username = 'postgres',
  DATABASE_PASSWORD: database_password = 'admin',
  DATABASE_NAME: database_name = 'chatwords',

  // Default user credentials
  DEFAULT_ADMIN_USERNAME: default_admin_username = 'admin',
  DEFAULT_ADMIN_EMAIL: default_admin_email = 'admin@admin.com',
  DEFAULT_ADMIN_PASSWORD: default_admin_password = 'admin',

  // LLM Provider API Keys
  AMAZON_BEDROCK_ACCESS_KEY_ID: amazon_bedrock_access_key_id,
  AMAZON_BEDROCK_SECRET_ACCESS_KEY: amazon_bedrock_secret_access_key,
  ANTHROPIC_API_KEY: anthropic_api_key,
  ASSEMBLYAI_API_KEY: assemblyai_api_key,
  AZURE_API_BASE_URL: azure_api_base_url,
  AZURE_API_KEY: azure_api_key,
  COHERE_API_KEY: cohere_api_key,
  CEREBRAS_API_KEY: cerebras_api_key,
  DATABRICKS_API_KEY: databricks_api_key,
  DEEPGRAM_API_KEY: deepgram_api_key,
  DEEPSEEK_API_KEY: deepseek_api_key,
  ELEVENLABS_API_KEY: elevenlabs_api_key,
  FIREWORKS_API_KEY: fireworks_api_key,
  GOOGLE_API_KEY: google_api_key,
  GROQ_API_KEY: groq_api_key,
  MISTRAL_API_KEY: mistral_api_key,
  OLLAMA_API_BASE_URL: ollama_api_base_url,
  OPENAI_API_KEY: openai_api_key,
  OPENROUTER_API_KEY: openrouter_api_key,
  PERPLEXITY_API_KEY: perplexity_api_key,
  SAMBANOVA_API_KEY: sambanova_api_key,
  TOGETHERAI_API_KEY: togetherai_api_key,
  TRITON_API_BASE_URL: triton_api_base_url,
  TRITON_API_KEY: triton_api_key,
  XAI_API_KEY: xai_api_key,

  // LLM Models (JSON string)
  MODELS: models_env = '[]',
} = process.env;
