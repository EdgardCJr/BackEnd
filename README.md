# Técnica de Backend (Node.js com Express)

Esta seção detalha a técnica utilizada para o desenvolvimento do backend com Node.js e Express.

## Setup Inicial:

1. **Clonar o repositório:**
   Clone o repositório AppFIAP para sua máquina local:
   ```bash
   git clone [https://github.com/EdgardCJr/TechChallengIV](https://github.com/EdgardCJr/BackEnd)
   cd backfiap
   ```

2. **Instalar dependências:**
   - Navegue até a pasta do backend (por exemplo, `BackFiap`) e execute:
     ```
     npm install
     ```

3. **Configurar o MongoDB:**
   - Caso não queria utilizar um MongoDB proprio a aplicação ja esta configurada para acessar o MongoDB oficial da aplicação.
     
   - Caso queria utilizar seu MongoDB >
     
   - Certifique-se de ter o MongoDB instalado e em execução.
   - Configure a string de conexão com o seu banco de dados no arquivo `index.js`. Exemplos:
     ```javascript
     mongoose.connect('mongodb://usuario:senha@host:porta/nome_do_banco_de_dados');
     // Ou usando o srv para o Atlas, por exemplo:
     mongoose.connect('mongodb+srv://usuario:senha@cluster.mongodb.net/nome_do_banco_de_dados');
     ```

4. **Iniciar o servidor:**
   - Execute o comando para iniciar o servidor backend:
     ```
     node src/index.js
     ```
     - Ou, se estiver usando `nodemon`:
       ```
       nodemon src/index.js
       ```
   - O servidor estará ouvindo na porta definida (3000 por padrão ou na porta definida na variável de ambiente `PORT`).

## Testando as Rotas:

Você pode usar ferramentas como Postman, Insomnia ou curl para testar as rotas da API. Lembre-se de incluir o token JWT no cabeçalho `Authorization` para rotas que requerem autenticação.

### Exemplo (criando um novo post com Postman):

- **Método:** POST
- **URL:** http://localhost:3000/posts
- **Headers:**
  - `Authorization: Bearer <seu_token_jwt>`
  - `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
      "title": "Título do post",
      "content": "Conteúdo do post",
      "author": "ID do autor"
  }
  ```

## Observações importantes:

- Este guia assume que o backend está em uma pasta chamada `BackFiap` no mesmo nível da pasta do frontend. Ajuste os caminhos conforme a estrutura do seu projeto.
- Certifique-se de substituir os placeholders (como `<seu_token_jwt>`, `usuario`, `senha`, `host`, `porta`, `nome_do_banco_de_dados`) com seus valores reais.

Este README fornece informações essenciais para configurar e utilizar o backend Node.js. Consulte o código-fonte para detalhes da implementação.

