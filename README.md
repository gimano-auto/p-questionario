# Questionário – Troca de Fluido (Next.js + TypeScript + Tailwind)


## O que está aqui
Projeto simples com front (form + canvas assinatura + geração de PDF via jsPDF) e rota API `/api/send-pdf` que envia o PDF por e-mail usando SMTP (nodemailer).


## Variáveis de ambiente (ex: em Vercel)
- SMTP_HOST (ex: smtp.gmail.com)
- SMTP_PORT (ex: 587)
- SMTP_USER (usuário SMTP / e-mail)
- SMTP_PASS (senha / app password)
- FROM_EMAIL (opcional)
- TO_EMAIL (opcional - padrão: vendasgimano@gmail.com)


> No Vercel: vá em Project Settings → Environment Variables e adicione essas variáveis.


## Deploy no Vercel
1. Faça push do repositório no GitHub.
2. Crie novo projeto no Vercel apontando para o repo.
3. Adicione as variáveis de ambiente citadas.
4. Deploy — o endpoint `/api/send-pdf` irá rodar como Serverless Function.


## Observações
- Para usar Gmail como SMTP precisa de "App password" (conta com 2FA) ou usar um provedor de e-mail (SendGrid, Mailgun etc.).
- Se preferir evitar SMTP, troque o código para usar a API do SendGrid (ou outro) com chave de API.