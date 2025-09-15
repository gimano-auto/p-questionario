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

export const FluidoPDF = ({ form, signature }: FluidoForm) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Logo */}
      <Image src="/logo.png" style={styles.logo} />

      {/* Título */}
      <Text style={styles.header}>
        Questionário – Troca de Fluido da Transmissão Automática
      </Text>

      {/* Dados do Cliente */}
      <View style={styles.questionBox}>
        <Text style={styles.sectionHeader}>Informações do Cliente e Veículo</Text>
        <Text style={styles.answerText}>Nome: {form.cliente}</Text>
        <Text style={styles.answerText}>Placa: {form.placa}</Text>
      </View>

      {/* Perguntas principais */}
      {[
        { key: 'trancos', label: 'O veículo apresenta trancos ou solavancos nas trocas de marcha?' },
        { key: 'demora', label: 'Sente que a transmissão está demorando para trocar de marcha?' },
        { key: 'patina', label: 'O câmbio patina (motor acelera, mas o carro demora a responder)?' },
        { key: 'ruidos', label: 'Há ruídos anormais durante a troca de marcha?' },
        { key: 'vibracao', label: 'Já percebeu vibração ou trepidação quando o carro arranca ou muda de marcha?' },
        { key: 'modoSeguranca', label: 'O veículo já apagou ou entrou em modo de segurança?' },
        { key: 'vazamento', label: 'Há vazamentos de óleo da transmissão?' },
        { key: 'luzPainel', label: 'Já acendeu no painel a luz de avaria da transmissão?' },
        { key: 'fluido', label: 'O fluido já foi trocado anteriormente?' },
      ].map(q => (
        <View style={styles.questionBox} key={q.key}>
          <Text style={styles.questionText}>{q.label}</Text>
          <Text style={styles.answerText}>{form[q.key]}</Text>

          {/* Subperguntas condicionais */}
          {q.key === 'fluido' && form.fluido === 'Sim' && (
            <>
              <Text style={styles.answerText}>KM na última troca: {form.kmUltimaTroca}</Text>
              <Text style={styles.answerText}>Data da última troca: {form.dataUltimaTroca}</Text>
            </>
          )}
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

// Função para abrir PDF
export async function saveFluidoPDF({ form, signature }: FluidoForm) {
  const blob = await pdf(<FluidoPDF form={form} signature={signature} />).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url);
}
