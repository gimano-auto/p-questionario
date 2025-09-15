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
    { key: 'manutencaoPrev', label: 'Já fez alguma manutenção preventiva em sua transmissão automática?', details: [
      { key: 'qualManutencao', label: 'Qual manutenção?' },
      { key: 'kmUltimaManutencao', label: 'Quantos km desde a última manutenção?' },
    ]},
    { key: 'sintoma', label: 'O veículo apresenta ou apresentou algum sintoma aparente?', details: [
      { key: 'qualSintoma', label: 'Qual sintoma?' },
      { key: 'condicaoSintoma', label: 'Em qual condição?' },
    ]},
    { key: 'patinacao', label: 'O veículo apresenta patinações?', details: [
      { key: 'velocidadePatina', label: 'Em qual velocidade?' },
      { key: 'condicaoPatina', label: 'Em qual condição?' },
    ]},
    { key: 'perdaPotencia', label: 'O veículo apresenta perda de potência ao sair?', details: [
      { key: 'driveRe', label: 'Em drive ou marcha ré?' },
      { key: 'condicaoPerda', label: 'Em qual condição?' },
    ]},
    { key: 'trancos', label: 'O veículo apresenta trancos ou solavancos em mudanças de marchas?', details: [
      { key: 'velocidadeTrancos', label: 'Em quais velocidades?' },
      { key: 'condicaoTrancos', label: 'Em qual condição?' },
    ]},
    { key: 'atrasoEngate', label: 'O veículo apresenta atraso nos engates ao trocar de marcha?', details: [
      { key: 'velocidadeAtraso', label: 'Em quais velocidades?' },
      { key: 'condicaoAtraso', label: 'Em qual condição?' },
    ]},
    { key: 'luzEmergencia', label: 'Em algum momento a luz de anomalia da transmissão ou injeção acendeu? (modo de emergência)', details: [
      { key: 'frequenciaLuz', label: 'Com qual frequência?' },
      { key: 'condicaoLuz', label: 'Em qual condição?' },
    ]},
    { key: 'perdaMotor', label: 'O veículo apresenta algum sintoma de perda de potência ou falhas de motor?', details: [
      { key: 'qualPerdaMotor', label: 'Quais?' },
    ]},
    { key: 'manutRecente', label: 'O veículo passou por alguma manutenção recente tais como serviços mecânicos, elétricos, instalação de acessórios ou outros serviços?', details: [
      { key: 'qualManutRecente', label: 'Quais?' },
    ]},
    { key: 'mudancasVelocidade', label: 'Notou alguma vez mudanças de velocidades fora do padrão de normalidade?', details: [
      { key: 'qualAnormalidade', label: 'Qual anormalidade?' },
      { key: 'condicaoAnormalidade', label: 'Em qual condição?' },
    ]},
    { key: 'problemaArrefecimento', label: 'Algum problema recente no sistema de arrefecimento do motor?', details: [
      { key: 'qualArrefecimento', label: 'Qual?' },
    ]},
    { key: 'modoManual', label: 'As mudanças em modo manual estão funcionando dentro da normalidade?', details: [
      { key: 'qualModoManual', label: 'Qual anormalidade?' },
      { key: 'condicaoModoManual', label: 'Em qual condição?' },
    ]},
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
