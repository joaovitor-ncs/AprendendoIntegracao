Sistema criado com Intuito de ensinar de forma prático, como se aciona API de plataformas

<img width="1466" height="919" alt="image" src="https://github.com/user-attachments/assets/ad5a1940-a3fb-4ffe-b558-56d62efd9220" />
<img width="1412" height="915" alt="image" src="https://github.com/user-attachments/assets/47e792d4-f059-4cda-981e-e53426294254" />

Instalação:
1. Necessário instalar o NODE com NPM, segue link para facilidade:
https://nodejs.org/pt/download

2. No terminal, utilize:
 
2.1. Para instalar as dependencias:

   -npm install
   
   2.2. Para de fato rodar:
   
   -npm run dev
   
   OU
   
-npm run dev -- --host 0.0.0.0

Observação: O comando npm run dev -- --host 0.0.0.0 vai disponibilizar o sistema em todas as interfaces do computador, para que seja possível acessar de outros computadores na mesma rede

Sobre o Sistema:

1. O recurso é semelhante ao Postman
2. Pendente a conexão com banco de dados, atualmente, quando reseta a página, todos os dados e botões configurados são deletados
3. Caso necessário validação de Proxy, sugiro utilizar o Beeceptor como apoio
   Proxy do Beeceptor:
   <img width="1593" height="839" alt="image" src="https://github.com/user-attachments/assets/f2b6d084-3cd5-4adf-8c31-36992e61d281" />
   <img width="1685" height="888" alt="image" src="https://github.com/user-attachments/assets/3780ff6c-bc33-4936-8b91-35afa27a7dbc" />
4. No campo de destaque, insira o endpoint base da plataforma que gostaria de testar
5. No sistema, insira o endpoint do Beeceptor:
   <img width="1420" height="920" alt="image" src="https://github.com/user-attachments/assets/9ae6decc-57bc-4b7b-9d82-cea09f3d679b" />
6. Desse modo, utilizaremos o Proxy do Beeceptor, e ele funcionará como uma ponte para conexão
