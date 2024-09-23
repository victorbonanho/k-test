# Test for Kenlo API

## Descrição

- Este é um projeto de API desenvolvido com Node.js e MongoDB (Atlas), seguindo a arquitetura MVC (Model-View-Controller). A API permite o cadastro e login de clientes e a comunicação com o chatGPT ficando armazenado, na mesma collection do cadastro do cliente, o histórico de perguntas e respostas.

- O root da aplicação se encontra no index.ts essa rota com versionamento encaminha para uma rota de instâncias com o serviço de chat e autenticação (apiRoutesV1.ts) e essa encaminha para as suas rotas respectivas. Podendo adicionar mais instâncias no projeto, ficando assim uma API com arquitetura escalável, durável e de compreensível manutenção com o seu padrão MVC.

- Não é necessário rodar um banco de dados local pois estará disponível no MongoDB Atlas.

## Tecnologias Usadas

- **Node.js**: Para a construção da API.
- **Typescript**: Para um código mais acertivo.
- **MongoDB**: Para armazenamento de dados.
- **Docker**: Para containerização e facilidade de deployment.
- **Jest**: Para testes unitários e de integração.
- **CI/CD com Github Actions**: Para deploys contínuos passando pelos testes.

## Arquitetura

- **Model**: Define a estrutura dos dados (neste caso, um cliente).
- **View**: Não se aplica diretamente, pois esta é uma API, mas em um contexto de frontend, representaria a parte visual.
- **Controller**: Lida com a lógica de negócios, processa as requisições e interage com o Model.

## Pré-requisitos

- Node.js (versão 18 ou superior)
- MongoDB Compass (opcional, conectar com MONGODB_URI disponível no .env -> Solicitar)
- Docker (reqcomendado para rodar local)

1. Clone o repositório:

https:

- git clone https://github.com/victorbonanho/k-test.git

ssh:

- git clone git@github.com:victorbonanho/k-test.git
- cd k-test

2. Instale as dependências:

- npm install

3. O arquivo .env ficará INDISPONÍVEL no repositório público pois a api do chatGPT bloqueia o uso em repositórios, para testar localmente anexe o .env enviado por e-mail ou solicite.

## Usando Docker

1. Execute os seguintes comandos para construir e rodar o projeto localmente:

- docker-compose down
- docker-compose up --build

2. A API estará acessível em http://localhost:3000.

## Usando Node.js diretamente

1. npm start ou npm run dev

## Rodando o Teste Unitário

1. npm run test:unit

   Explicação: Rondando o teste com dados mock para testar a integridade da lógica do controle da aplicação.

## Rodando o Teste de Integração e explicação

1. npm run test:integration

   Explicação: Utilizado o mongodb em memória para não afetar o banco de dados real (MongoMemoryServer) fazendo os testes essenciais para o funcionamento da API

## Rodando todos os testes

1. npm run test

## Funcionamento com Postman ou derivados

1. Cadastre um cliente

- https://k-test.onrender.com/api/v1/auth/register
  Body exemplo:
  {
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "123456789",
  "password": "senha123"
  }

2. Faça o login

- https://k-test.onrender.com/api/v1/auth/login
  Body exemplo:
  {
  "email": "joao@example.com",
  "password": "senha123"
  }

3. Copie o token gerado no login e insira no "Authorization" -> "Bearer Token"
   e chame a API para conversar com o chatGPT:

- https://k-test.onrender.com/api/v1/chat/conversation
  Body exemplo:
  {
  "question": "Qual é a capital da França?"
  }

4. Verifique todos os clientes cadastrados ou delete um

- https://k-test.onrender.com/api/v1/manage/clients
- https://k-test.onrender.com/api/v1/manage/clients/:id

## DEPLOY - Aplicação em produção diponível

https://k-test.onrender.com

**Aplicação hospedada no render.com e utilizado docker para melhor compatibilidade com a integração contínua CI/CD**

## CI/CD

Implementação contínua com Github Actions executando os testes unitário e de integração como requisito para o Deploy e colocando as secrets diretamente pelo github. Após o commit na main é feito o CI/CD e ao concluir é efetudao o deploy para o render.com

- Arquivo .github/workflows/ci-cd.yml

## SWAGGER

TODO

## Licença

Este projeto está licenciado sob a MIT License - veja o arquivo LICENSE.md para detalhes.

## Feedback e Contato

- Para dúvidas ou feedback, entre em contato pelo e-mail: [victbonanho@gmail.com].
