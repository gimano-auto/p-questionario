import { useRef, useEffect, useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { FluidoPDF } from '../lib/pdfGeneratorFluido'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const drawing = useRef(false)
  const [isClient, setIsClient] = useState(false)
  const [showFluidoDetail, setShowFluidoDetail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => setIsClient(true), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctxRef.current = ctx

    function resize() {
      const data = canvas!.toDataURL()
      canvas!.width = canvas!.offsetWidth
      canvas!.height = canvas!.offsetHeight
      const img = new Image()
      img.src = data
      img.onload = () => ctx!.drawImage(img, 0, 0, canvas!.width, canvas!.height)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  function getPos(e: MouseEvent | TouchEvent) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if (e instanceof TouchEvent) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    const me = e as MouseEvent
    return { x: me.clientX - rect.left, y: me.clientY - rect.top }
  }

  function startDraw(e: any) { drawing.current = true; const pos = getPos(e.nativeEvent); ctxRef.current?.beginPath(); ctxRef.current?.moveTo(pos.x, pos.y) }
  function draw(e: any) { if (!drawing.current) return; const pos = getPos(e.nativeEvent); ctxRef.current?.lineTo(pos.x, pos.y); ctxRef.current?.stroke(); e.preventDefault() }
  function endDraw() { drawing.current = false }
  function clearSig() { const canvas = canvasRef.current; if (!canvas) return; ctxRef.current?.clearRect(0, 0, canvas.width, canvas.height) }

  async function handleSubmit(e: any) {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) { alert('Assine o formulário antes de enviar.'); return }
    const data = ctxRef.current?.getImageData(0, 0, canvas.width, canvas.height)
    const empty = data?.data.every((v) => v === 0)
    if (empty) { alert('Assine o formulário antes de enviar.'); return }

    if (!isClient) return
    setLoading(true)

    const fd = new FormData(e.target)
    const formObj = Object.fromEntries(fd.entries())

    const sigDataUrl = canvas.toDataURL('image/png')

    // Gera PDF com @react-pdf/renderer
    const blob = await pdf(<FluidoPDF form={formObj} signature={sigDataUrl} />).toBlob()
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result
      try {
        const res = await fetch('/api/send-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdfBase64: base64, form: formObj }),
        })
        if (res.ok) {
          setSuccess(true)
          e.target.reset()
          clearSig()
          setShowFluidoDetail(false)
        } else {
          const txt = await res.text()
          alert('Erro ao enviar e-mail: ' + txt)
        }
      } catch (err) { alert('Erro de envio: ' + err) }
      finally { setLoading(false) }
    }
    reader.readAsDataURL(blob)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100 relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-semibold">Enviando formulário...</p>
          <p className="mt-2 text-sm">Não feche a página até que o envio seja concluído.</p>
        </div>
      )}
      {success && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center space-y-4">
            <p className="text-green-700 font-semibold text-lg">✅ Questionário enviado com sucesso!</p>
            <button onClick={() => setSuccess(false)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Fechar</button>
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full bg-white p-8 rounded-2xl shadow-lg opacity-90">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
          📋 Questionário – Troca de Fluido da Transmissão Automática
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-gray-700">Seu nome completo *</label>
              <input name="cliente" required className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2 rounded-md" />
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Placa do veículo *</label>
              <input name="placa" required className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2 rounded-md" />
            </div>
          </div>

          {/* Perguntas principais */}
          {[
            { key: 'trancos', text: 'O veículo apresenta trancos ou solavancos nas trocas de marcha?', options: ['Sim', 'Não', 'Às vezes'] },
            { key: 'demora', text: 'Sente que a transmissão está demorando para trocar de marcha?', options: ['Sim', 'Não', 'Às vezes'] },
            { key: 'patina', text: 'O câmbio patina?', options: ['Sim', 'Não', 'Às vezes'] },
            { key: 'ruidos', text: 'Há ruídos anormais?', options: ['Sim', 'Não', 'Às vezes'] },
            { key: 'vibracao', text: 'Já percebeu vibração?', options: ['Sim', 'Não', 'Às vezes'] },
            { key: 'modoSeguranca', text: 'Modo de segurança?', options: ['Sim', 'Não'] },
            { key: 'vazamento', text: 'Há vazamentos?', options: ['Sim', 'Não', 'Não sei'] },
            { key: 'luzPainel', text: 'Luz de avaria?', options: ['Sim', 'Não'] },
            { key: 'fluido', text: 'O fluido já foi trocado anteriormente?', options: ['Sim', 'Não', 'Nunca'] }
          ].map(q => (
            <div key={q.key} className="bg-gray-50 p-4 rounded-lg border">
              <p className="font-medium text-gray-700">{q.text} *</p>
              <div className="mt-2 flex gap-6">
                {q.options.map(opt => (
                  <label key={opt}>
                    <input type="radio" name={q.key} value={opt} required onChange={() => { if (q.key === 'fluido') setShowFluidoDetail(opt === 'Sim') }} /> {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {showFluidoDetail && (
            <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
              <div>
                <label className="block font-medium text-gray-700">Quantos km o veículo tinha na última troca? *</label>
                <input type="number" name="kmUltimaTroca" required className="w-full border p-2 rounded-md mt-1" />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Quando foi aproximadamente essa troca? *</label>
                <input type="month" name="dataUltimaTroca" required className="w-full border p-2 rounded-md mt-1" />
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg border">
            <label className="block font-medium text-gray-700">Deseja relatar algum outro sintoma ou observação? *</label>
            <textarea name="observacao" required className="w-full border border-gray-300 rounded-md p-2 mt-2"></textarea>
          </div>

          {/* Assinatura */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Assinatura do Cliente *</label>
            <div className="border rounded-md bg-gray-50 relative">
              <canvas
                ref={canvasRef}
                className="w-full h-48 rounded-md cursor-crosshair touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={(e) => { e.preventDefault(); startDraw(e) }}
                onTouchMove={(e) => { e.preventDefault(); draw(e) }}
                onTouchEnd={(e) => { e.preventDefault(); endDraw() }}
              />
              <div className="absolute bottom-2 right-2 flex gap-2">
                <button type="button" onClick={clearSig} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Limpar</button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 font-semibold">Finalizar e Enviar</button>
          </div>
        </form>
      </div>
    </div>
  )
}