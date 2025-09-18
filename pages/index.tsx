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
      key: '1',
      text: '1 - Já fez algum reparo em sua transmissão automática?',
      sub: [
        { key: '1.1', label: 'Qual tinha sido o problema?' },
        { key: '1.2', label: 'Quantos km desde do ultimo reparo?' },
      ],
    },
    {
      key: '2',
      text: '2 - O veículo apresenta patinações (motor acelera, mas o carro demora a responder)?',
      sub: [
        { key: '2.1', label: 'Em qual velocidade?' },
        { key: '2.2', label: 'Em qual condição: subida e(ou) decidas \ veiculo quente ou frio?' },
      ],
    },
    {
      key: '3',
      text: '3 - O veículo apresenta perda de potência ao sair?',
      sub: [
        { key: '3.1', label: 'Em drive (D) ou marcha ré?' },
        { key: '3.2', label: 'Em qual condição: subida e(ou) decidas \ veiculo quente ou frio?' },
      ],
    },
    {
      key: '4',
      text: '4 - O veículo apresenta trancos ou solavancos em mudanças de marchas?',
      sub: [
        { key: '4.1', label: 'Em quais velocidades?' },
        { key: '4.2', label: 'Em qual condição: subida e(ou) decidas \ veiculo quente ou frio?' },
      ],
    },
    {
      key: '5',
      text: '5 - O veículo apresenta atraso nos engates ao trocar de marcha?',
      sub: [
        { key: '5.1', label: 'Em quais velocidades?' },
        { key: '5.2', label: 'Em qual condição: subida e(ou) decidas \ veiculo quente ou frio?' },
      ],
    },
    {
      key: '6',
      text: '6 - Em algum momento a luz de anomalia da transmissão ou injeção acendeu? (modo de emergência)',
      image: './luz_anomalia.png',
      sub: [
        { key: '6.1', label: 'Com qual frequência?' },
        { key: '6.2', label: 'Em qual condição: subida e(ou) decidas \ veiculo quente ou frio?' },
      ],
    },
    {
      key: '7',
      text: '7 - O veículo apresenta algum sintoma de perda de potência ou falhas de motor?',
      sub: [
        { key: '7.1', label: 'Quais?' },
      ],
    },
    {
      key: '8',
      text: '8 - O veículo passou por alguma manutenção recente tais como, serviços mecânicos, elétricos, instalação de acessórios ou outros serviços?',
      sub: [
        { key: '8.1', label: 'Quais?' },
      ],
    },
    {
      key: '9',
      text: '9 - Notou alguma vez mudanças de velocidades fora do padrão de normalidade?',
      sub: [
        { key: '9.1', label: 'Descreva como ocorreu.' },
        { key: '9.2', label: 'Em qual condição, veiculo quente ou frio?' },
      ],
    },
    {
      key: '10',
      text: '10 - Algum problema recente na circulação fluido do radiador (sistema de arrefecimento) do motor ?',
      sub: [
        { key: '10.1', label: 'Qual?' },
      ],
    },
    {
      key: '11',
      text: '11 - As mudanças em modo manual estão funcionando dentro da normalidade?',
      sub: [
        { key: '11.1', label: 'Qual anormalidade?' },
        { key: '11.2', label: 'Em qual condição: subida e(ou) decidas \ veiculo quente ou frio?' },
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
              <div className="flex items-center gap-4 flex-col sm:flex-row">
                <p className="font-medium text-gray-700">{q.text} *</p>
                {q.image && (
                  <div className='w-2/6 sm:w-1/6 flex justify-center'>
                    <img
                      src={q.image}
                      alt="Imagem ilustrativa"
                      className="w-1/2 object-contain border rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="mt-2 flex gap-6">
                <label>
                  <input
                    type="radio"
                    name={q.key}
                    value="Não"
                    required
                    onChange={() =>
                      setShowDetail((prev) => ({
                        ...prev,
                        [q.key]: q.key === '11' ? true : false, // Inverte para key 11
                      }))
                    }
                  />{' '}
                  Não
                </label>
                <label>
                  <input
                    type="radio"
                    name={q.key}
                    value="Sim"
                    required
                    onChange={() =>
                      setShowDetail((prev) => ({
                        ...prev,
                        [q.key]: q.key === '11' ? false : true, // Inverte para key 11
                      }))
                    }
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
