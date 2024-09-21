# Fullstack Test API

## Descrição

Este é um projeto de API desenvolvido com Node.js e MongoDB, seguindo a arquitetura MVC (Model-View-Controller). A API permite a criação, leitura, atualização e deleção (CRUD) de clientes.

## Arquitetura

- **Model**: Define a estrutura dos dados (neste caso, um cliente).
- **View**: Não se aplica diretamente, pois esta é uma API, mas em um contexto de frontend, representaria a parte visual.
- **Controller**: Lida com a lógica de negócios, processa as requisições e interage com o Model.

## Estrutura do Projeto

/src ├── controllers │ └── clientController.ts ├── models │ └── clientModel.ts ├── routes │ └── clientRoutes.ts └── index.ts

## Pré-requisitos

- Node.js (versão 18 ou superior)
- MongoDB Atlas para o banco de dados
- Docker (opcional)

1. Clone o repositório:

- git clone <URL_DO_REPOSITORIO>
- cd <NOME_DO_REPOSITORIO>

2. Instale as dependências:

- npm install

3. Crie um arquivo .env na raiz do projeto se não houver e adicione a seguinte variável de ambiente:
   MONGODB_URI=mongodb+srv://kowalski:dogLove!2124@testfullstackkenlo.lb8y6.mongodb.net/fullstackTest?retryWrites=true&w=majority&appName=Testfullstackkenlo

## Usando Docker

1. Execute o seguinte comando para construir e rodar o projeto:

- docker-compose up --build

2. A API estará acessível em http://localhost:3000.

## Usando Node.js diretamente

1. npm start

## Endpoints

POST /clients: Cria um novo cliente.
GET /clients: Retorna todos os clientes.
GET /clients/:id: Retorna um cliente específico pelo ID.
PUT /clients/:id: Atualiza um cliente específico pelo ID.
DELETE /clients/:id: Deleta um cliente específico pelo ID.

**Sinta-se à vontade para ajustar qualquer parte conforme necessário! Se precisar de mais alguma coisa, é só avisar.**
