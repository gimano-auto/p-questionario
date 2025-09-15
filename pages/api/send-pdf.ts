import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

type Data = { message: string }

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { pdfBase64, form } = req.body
    if (!pdfBase64) return res.status(400).send({ message: 'pdfBase64 missing' })

    const base64 = pdfBase64.split(',')[1] || pdfBase64
    const pdfBuffer = Buffer.from(base64, 'base64')

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })

    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL || 'vendasgimano@gmail.com',
      subject: `Questionário - Subs. Fluido Automático - ${form?.placa || ''} - ${new Date().toLocaleDateString('pt-BR')}`,
      text: `Segue em anexo o documento assinado.`,
      attachments: [
        { filename: 'questionario.pdf', content: pdfBuffer, contentType: 'application/pdf' }
      ]
    })

    console.log('Mensagem enviada:', info.messageId)
    return res.status(200).json({ message: 'E-mail enviado' })
  } catch (err: any) {
    console.error(err)
    return res.status(500).send({ message: err?.message || 'Erro ao enviar' })
  }
}
