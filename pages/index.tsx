import { useRef, useEffect, useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { FluidoPDF } from '../lib/pdfGeneratorFluido'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const drawing = useRef(false)
  const [isClient, setIsClient] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showDetail, setShowDetail] = useState<{ [key: string]: boolean }>({})

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
    if (e instanceof TouchEvent)
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    const me = e as MouseEvent
    return { x: me.clientX - rect.left, y: me.clientY - rect.top }
  }

  function startDraw(e: any) {
    drawing.current = true
    const pos = getPos(e.nativeEvent)
    ctxRef.current?.beginPath()
    ctxRef.current?.moveTo(pos.x, pos.y)
  }

  function draw(e: any) {
    if (!drawing.current) return
    const pos = getPos(e.nativeEvent)
    ctxRef.current?.lineTo(pos.x, pos.y)
    ctxRef.current?.stroke()
    e.preventDefault()
  }

  function endDraw() {
    drawing.current = false
  }

  function clearSig() {
    const canvas = canvasRef.current
    if (!canvas) return
    ctxRef.current?.clearRect(0, 0, canvas.width, canvas.height)
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return alert('Assine o formulário antes de enviar.')
    const data = ctxRef.current?.getImageData(0, 0, canvas.width, canvas.height)
    if (data?.data.every((v) => v === 0)) return alert('Assine o formulário antes de enviar.')

    setLoading(true)
    const fd = new FormData(e.target)
    const formObj = Object.fromEntries(fd.entries())
    const sigDataUrl = canvas.toDataURL('image/png')

    // Gera PDF e converte em Base64
    const blob = await pdf(<FluidoPDF form={formObj} signature={sigDataUrl} />).toBlob()
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = async () => {
      const base64PDF = reader.result as string

      try {
        const res = await fetch('/api/send-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdfBase64: base64PDF, form: formObj }),
        })

        if (res.ok) {
          setSuccess(true)
          e.target.reset()
          clearSig()
          setShowDetail({})
        } else {
          const txt = await res.text()
          alert('Erro ao enviar e-mail: ' + txt)
        }
      } catch (err) {
        alert('Erro de envio: ' + err)
      } finally {
        setLoading(false)
      }
    }
  }

  const perguntas = [
    {
      key: 'manutencaoPrev',
      text: 'Já fez alguma manutenção preventiva em sua transmissão automática?',
      sub: [
        { key: 'qualManutencao', label: 'Qual manutenção?' },
        { key: 'kmUltimaManutencao', label: 'Quantos km desde a última manutenção?' },
      ],
    },
    {
      key: 'sintoma',
      text: 'O veículo apresenta ou apresentou algum sintoma aparente?',
      sub: [
        { key: 'qualSintoma', label: 'Qual sintoma?' },
        { key: 'condicaoSintoma', label: 'Em qual condição?' },
      ],
    },
    {
      key: 'patinacao',
      text: 'O veículo apresenta patinações?',
      sub: [
        { key: 'velocidadePatina', label: 'Em qual velocidade?' },
        { key: 'condicaoPatina', label: 'Em qual condição?' },
      ],
    },
    {
      key: 'perdaPotencia',
      text: 'O veículo apresenta perda de potência ao sair?',
      sub: [
        { key: 'driveRe', label: 'Em drive ou marcha ré?' },
        { key: 'condicaoPerda', label: 'Em qual condição?' },
      ],
    },
    {
      key: 'trancos',
      text: 'O veículo apresenta trancos ou solavancos em mudanças de marchas?',
      sub: [
        { key: 'velocidadeTrancos', label: 'Em quais velocidades?' },
        { key: 'condicaoTrancos', label: 'Em qual condição?' },
      ],
    },
    {
      key: 'atrasoEngate',
      text: 'O veículo apresenta atraso nos engates ao trocar de marcha?',
      sub: [
        { key: 'velocidadeAtraso', label: 'Em quais velocidades?' },
        { key: 'condicaoAtraso', label: 'Em qual condição?' },
      ],
    },
    {
      key: 'luzEmergencia',
      text: 'Em algum momento a luz de anomalia da transmissão ou injeção acendeu? (modo de emergência)',
      sub: [
        { key: 'frequenciaLuz', label: 'Com qual frequência?' },
        { key: 'condicaoLuz', label: 'Em qual condição?' },
      ],
    },
    {
      key: 'perdaMotor',
      text: 'O veículo apresenta algum sintoma de perda de potência ou falhas de motor?',
      sub: [
        { key: 'qualPerdaMotor', label: 'Quais?' },
      ],
    },
    {
      key: 'manutRecente',
      text: 'O veículo passou por alguma manutenção recente tais como, serviços mecânicos, elétricos, instalação de acessórios ou outros serviços?',
      sub: [
        { key: 'qualManutRecente', label: 'Quais?' },
      ],
    },
    {
      key: 'mudancasVelocidade',
      text: 'Notou alguma vez mudanças de velocidades fora do padrão de normalidade?',
      sub: [
        { key: 'qualAnormalidade', label: 'Qual anormalidade?' },
        { key: 'condicaoAnormalidade', label: 'Em qual condição?' },
      ],
    },
    {
      key: 'problemaArrefecimento',
      text: 'Algum problema recente no sistema de arrefecimento do motor?',
      sub: [
        { key: 'qualArrefecimento', label: 'Qual?' },
      ],
    },
    {
      key: 'modoManual',
      text: 'As mudanças em modo manual estão funcionando dentro da normalidade?',
      sub: [
        { key: 'qualModoManual', label: 'Qual anormalidade?' },
        { key: 'condicaoModoManual', label: 'Em qual condição?' },
      ],
    },
  ]

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
            <button
              onClick={() => setSuccess(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full bg-white p-8 rounded-2xl shadow-lg opacity-90">
        <div className="w-full flex justify-center my-4">
          <img src="./logo.png" alt="Logo da oficina" className="w-1/5" />
        </div>
        <div className="text-gray-800 mb-6 border-b pb-3 text-center">
          <h1 className="text-2xl font-bold mb-2">Questionário</h1>
          <h2 className="text-lg">Troca de Fluido da Transmissão Automática</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-gray-700">Seu nome completo *</label>
              <input
                name="cliente"
                required
                className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Placa do veículo *</label>
              <input
                name="placa"
                required
                maxLength={7}
                placeholder="AAA1234"
                className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2 rounded-md"
                style={{ textTransform: 'uppercase' }}
                pattern="^[A-Z]{3}[0-9A-Z]{4}$"
                title="A placa deve começar com 3 letras e conter pelo menos 3 números"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  target.value = target.value.toUpperCase()
                }}
              />
            </div>
          </div>

          {perguntas.map((q) => (
            <div key={q.key} className="bg-gray-50 p-4 rounded-lg border">
              <p className="font-medium text-gray-700">{q.text} *</p>
              <div className="mt-2 flex gap-6">
                <label>
                  <input
                    type="radio"
                    name={q.key}
                    value="Não"
                    required
                    onChange={() => setShowDetail((prev) => ({ ...prev, [q.key]: false }))}
                  />{' '}
                  Não
                </label>
                <label>
                  <input
                    type="radio"
                    name={q.key}
                    value="Sim"
                    required
                    onChange={() => setShowDetail((prev) => ({ ...prev, [q.key]: true }))}
                  />{' '}
                  Sim
                </label>
              </div>

              {q.sub && showDetail[q.key] && (
                <div className="mt-2 space-y-2">
                  {q.sub.map((s) => (
                    <div key={s.key}>
                      <label className="block font-medium text-gray-700">{s.label} *</label>
                      <input
                        type="text"
                        name={s.key}
                        required
                        className="w-full border p-2 rounded-md mt-1"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="bg-gray-50 p-4 rounded-lg border">
            <label className="block font-medium text-gray-700 mb-2">
              Deseja relatar algum outro sintoma ou observação? *
            </label>
            <textarea
              name="observacao"
              required
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            ></textarea>
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
                <button
                  type="button"
                  onClick={clearSig}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 font-semibold"
            >
              Finalizar e Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
