// lib/pdfFluido.tsx
import { Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 120,
    height: 50,
    objectFit: 'contain',
    marginBottom: 16,
    alignSelf: 'center',
  },
  header: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1E40AF',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#0f172a',
  },
  questionBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    padding: 10,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  answerText: {
    fontSize: 11,
    color: '#4b5563',
    paddingLeft: 8,
    marginTop: 4,
  },
  signatureContainer: {
    marginTop: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  signatureLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#0f172a',
  },
  signatureImage: {
    width: 150,
    height: 50,
    objectFit: 'contain',
  },
});

interface FluidoForm {
  form: Record<string, any>;
  signature?: string; // base64 da assinatura
}

export const FluidoPDF = ({ form, signature }: FluidoForm) => {
  // Lista completa de perguntas com subperguntas
  const perguntas = [
    {
      key: '1',
      label: '1 - Já fez algum reparo em sua transmissão automática?',
      details: [
        { key: '1.1', label: 'Qual tinha sido o problema?' },
        { key: '1.2', label: 'Quantos km desde do último reparo?' },
      ],
    },
    {
      key: '2',
      label: '2 - O veículo apresenta patinações (motor acelera, mas o carro demora a responder)?',
      details: [
        { key: '2.1', label: 'Em qual velocidade?' },
        { key: '2.2', label: 'Em qual condição: subida e(ou) descidas / veículo quente ou frio?' },
      ],
    },
    {
      key: '3',
      label: '3 - O veículo apresenta perda de potência ao sair?',
      details: [
        { key: '3.1', label: 'Em drive (D) ou marcha ré?' },
        { key: '3.2', label: 'Em qual condição: subida e(ou) descidas / veículo quente ou frio?' },
      ],
    },
    {
      key: '4',
      label: '4 -  veículo apresenta trancos ou solavancos em mudanças de marchas?',
      details: [
        { key: '4.1', label: 'Em quais velocidades?' },
        { key: '4.2', label: 'Em qual condição: subida e(ou) descidas / veículo quente ou frio?' },
      ],
    },
    {
      key: '5',
      label: '5 - O veículo apresenta atraso nos engates ao trocar de marcha?',
      details: [
        { key: '5.1', label: 'Em quais velocidades?' },
        { key: '5.2', label: 'Em qual condição: subida e(ou) descidas / veículo quente ou frio?' },
      ],
    },
    {
      key: '6',
      label: '6 - Em algum momento a luz de anomalia da transmissão ou injeção acendeu? (modo de emergência)',
      image: '',
      details: [
        { key: '6.1', label: 'Com qual frequência?' },
        { key: '6.2', label: 'Em qual condição: subida e(ou) descidas / veículo quente ou frio?' },
      ],
    },
    {
      key: '7',
      label: '7 - O veículo apresenta algum sintoma de perda de potência ou falhas de motor?',
      details: [
        { key: '7.1', label: 'Quais?' },
      ],
    },
    {
      key: '8',
      label: '8 - O veículo passou por alguma manutenção recente tais como, serviços mecânicos, elétricos, instalação de acessórios ou outros serviços?',
      details: [
        { key: '8.1', label: 'Quais?' },
      ],
    },
    {
      key: '9',
      label: '9 - Notou alguma vez mudanças de velocidades fora do padrão de normalidade?',
      details: [
        { key: '9.1', label: 'Descreva como ocorreu.' },
        { key: '9.2', label: 'Em qual condição, veículo quente ou frio?' },
      ],
    },
    {
      key: '10',
      label: '10 - Algum problema recente na circulação do fluido do radiador (sistema de arrefecimento) do motor?',
      details: [
        { key: '10.1', label: 'Qual?' },
      ],
    },
    {
      key: '11',
      label: '11 - As mudanças em modo manual estão funcionando dentro da normalidade?',
      details: [
        { key: '11.1', label: 'Qual anormalidade?' },
        { key: '11.2', label: 'Em qual condição: subida e(ou) descidas / veículo quente ou frio?' },
      ],
    },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Logo */}
        <Image src="/logo.png" style={styles.logo} />

        {/* Título */}
        <Text style={styles.header}>Questionário – Troca de Fluido da Transmissão Automática</Text>

        {/* Dados do Cliente */}
        <View style={styles.questionBox}>
          <Text style={styles.sectionHeader}>Informações do Cliente e Veículo</Text>
          <Text style={styles.answerText}>Nome: {form.cliente}</Text>
          <Text style={styles.answerText}>Placa: {form.placa}</Text>
        </View>

        {/* Perguntas */}
        {perguntas.map((q) => (
          <View style={styles.questionBox} key={q.key}>
            <Text style={styles.questionText}>{q.label}</Text>
            <Text style={styles.answerText}>{form[q.key]}</Text>
            {form[q.key] === 'Sim' &&
              q.details.map((d) => (
                <Text style={styles.answerText} key={d.key}>
                  {d.label}: {form[d.key]}
                </Text>
              ))}
          </View>
        ))}

        {/* Observações */}
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>Observações adicionais</Text>
          <Text style={styles.answerText}>{form.observacao}</Text>
        </View>

        {/* Assinatura */}
        {signature && (
          <View style={styles.signatureContainer}>
            <Text style={styles.signatureLabel}>Assinatura do cliente</Text>
            <Image src={signature} style={styles.signatureImage} />
          </View>
        )}
      </Page>
    </Document>
  );
};

// Função para abrir PDF
export async function saveFluidoPDF({ form, signature }: FluidoForm) {
  const blob = await pdf(<FluidoPDF form={form} signature={signature} />).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url);
}
