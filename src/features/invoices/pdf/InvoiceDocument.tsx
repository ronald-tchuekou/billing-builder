/* eslint-disable jsx-a11y/alt-text */
import * as React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { InvoiceWithRelations } from "@/types";

const COLORS = {
  black: "#0f1115",
  text: "#0f1115",
  muted: "#6b7280",
  border: "#e5e7eb",
  zebra: "#f8fafc",
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    color: COLORS.text,
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: { fontSize: 36, fontWeight: 700 },
  headerMeta: { textAlign: "right", fontSize: 10, lineHeight: 1.5 },
  divider: { borderBottomWidth: 1, borderBottomColor: COLORS.border, marginVertical: 16 },
  partiesRow: { flexDirection: "row", justifyContent: "space-between", gap: 24 },
  partyBlock: { flex: 1 },
  partyLabel: { fontSize: 10, fontWeight: 700, marginBottom: 4 },
  partyName: { fontWeight: 700, fontSize: 12, marginBottom: 2 },
  partyLine: { color: COLORS.muted, marginBottom: 2 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginTop: 24, marginBottom: 8 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.black,
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cellDesc: { flex: 3 },
  cellNum: { flex: 1, textAlign: "right" },
  totalsBlock: { marginTop: 16, alignItems: "flex-end" },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 280,
    paddingVertical: 4,
  },
  totalsLabel: { color: COLORS.muted },
  remainingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 280,
    backgroundColor: COLORS.black,
    color: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  remainingLabel: { fontWeight: 700, fontSize: 12 },
  remainingAmount: { fontWeight: 700, fontSize: 12 },
  bankRow: {
    flexDirection: "row",
    backgroundColor: COLORS.zebra,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  bankRowAlt: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 10 },
  bankLabel: { flex: 1, fontWeight: 700 },
  bankValue: { flex: 2 },
  footer: {
    marginTop: 32,
    fontSize: 9,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 1.5,
  },
});

function fmt(n: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(n);
}

function fmtDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export interface InvoiceDocumentProps {
  invoice: InvoiceWithRelations;
}

export function InvoiceDocument({ invoice }: InvoiceDocumentProps) {
  const billed = invoice.items.reduce((s, it) => s + Number(it.amount), 0);
  const paid = invoice.payments.reduce((s, p) => s + Number(p.amount), 0);
  const remaining = Math.max(0, billed - paid);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>FACTURE</Text>
          <View style={styles.headerMeta}>
            <Text>
              <Text style={{ fontWeight: 700 }}>N° :</Text> {invoice.number}
            </Text>
            <Text>
              <Text style={{ fontWeight: 700 }}>Date :</Text> {fmtDate(invoice.issueDate)}
            </Text>
            <Text>
              <Text style={{ fontWeight: 700 }}>Échéance :</Text> {invoice.dueInDays} jours
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.partiesRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>ÉMETTEUR</Text>
            <Text style={styles.partyName}>{invoice.issuerName ?? "—"}</Text>
            {invoice.issuerAddress
              ? invoice.issuerAddress.split("\n").map((line, i) => (
                  <Text key={i} style={styles.partyLine}>
                    {line}
                  </Text>
                ))
              : null}
            {invoice.issuerSiret ? (
              <Text style={styles.partyLine}>SIRET : {invoice.issuerSiret}</Text>
            ) : null}
            {invoice.issuerVat ? (
              <Text style={styles.partyLine}>TVA : {invoice.issuerVat}</Text>
            ) : null}
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>FACTURÉ À</Text>
            <Text style={styles.partyName}>{invoice.client.name}</Text>
            {invoice.client.contactName ? (
              <Text style={styles.partyLine}>
                À l&apos;attention de {invoice.client.contactName}
              </Text>
            ) : null}
            {invoice.client.address
              ? invoice.client.address.split("\n").map((line, i) => (
                  <Text key={i} style={styles.partyLine}>
                    {line}
                  </Text>
                ))
              : null}
            {invoice.client.vatNumber ? (
              <Text style={styles.partyLine}>TVA : {invoice.client.vatNumber}</Text>
            ) : null}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Détail des prestations</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.cellDesc}>Prestation</Text>
          <Text style={styles.cellNum}>Prix U. / Jour</Text>
          <Text style={styles.cellNum}>Quantité</Text>
          <Text style={styles.cellNum}>Montant</Text>
        </View>
        {invoice.items.map((it) => (
          <View key={it.id} style={styles.tableRow}>
            <Text style={styles.cellDesc}>{it.description}</Text>
            <Text style={styles.cellNum}>
              {Number(it.unitPrice) === 0 ? "—" : fmt(Number(it.unitPrice), invoice.currency)}
            </Text>
            <Text style={styles.cellNum}>
              {Number(it.quantity) === 0 ? "—" : `${Number(it.quantity)} ${it.unitLabel}`}
            </Text>
            <Text style={styles.cellNum}>{fmt(Number(it.amount), invoice.currency)}</Text>
          </View>
        ))}

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total des prestations</Text>
            <Text>{fmt(billed, invoice.currency)}</Text>
          </View>
          {paid > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Acompte(s) reçu(s)</Text>
              <Text>− {fmt(paid, invoice.currency)}</Text>
            </View>
          )}
          <View style={styles.remainingRow}>
            <Text style={styles.remainingLabel}>MONTANT RESTANT À PAYER</Text>
            <Text style={styles.remainingAmount}>{fmt(remaining, invoice.currency)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Coordonnées bancaires pour le règlement</Text>
        <BankRow label="Banque" value={invoice.issuerBank ?? "—"} zebra />
        <BankRow label="Bénéficiaire" value={invoice.issuerName ?? "—"} />
        <BankRow label="IBAN" value={invoice.issuerIban ?? "—"} zebra />
        <BankRow label="BIC / SWIFT" value={invoice.issuerBic ?? "—"} />
        {invoice.issuerBankAddress ? (
          <BankRow label="Adresse de la banque" value={invoice.issuerBankAddress} zebra />
        ) : null}

        <Text style={styles.footer}>
          Merci d&apos;indiquer le numéro de facture en référence du virement.{"\n"}
          Pour toute question concernant cette facture, n&apos;hésitez pas à me contacter.
        </Text>
      </Page>
    </Document>
  );
}

function BankRow({ label, value, zebra }: { label: string; value: string; zebra?: boolean }) {
  return (
    <View style={zebra ? styles.bankRow : styles.bankRowAlt}>
      <Text style={styles.bankLabel}>{label}</Text>
      <Text style={styles.bankValue}>{value}</Text>
    </View>
  );
}
