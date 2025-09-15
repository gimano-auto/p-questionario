import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

type Data = { message: string }

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { pdfBase64, form } = req.body
    if (!pdfBase64) return res.status(400).json({ message: 'PDF não enviado' })

    const base64 = pdfBase64.split(',')[1] || pdfBase64
    const pdfBuffer = Buffer.from(base64, 'base64')

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: `Questionário - Fluido Automático - ${form?.placa || ''} - ${new Date().toLocaleDateString('pt-BR')}`,
      text: 'Segue em anexo o documento assinado.',
      attachments: [{ filename: 'questionario.pdf', content: pdfBuffer }],
    })

    res.status(200).json({ message: 'E-mail enviado' })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ message: err?.message || 'Erro ao enviar' })
  }
}
