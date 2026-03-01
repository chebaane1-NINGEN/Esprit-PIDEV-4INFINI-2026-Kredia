package com.kredia.service;

import com.kredia.entity.credit.Credit;
import com.kredia.entity.credit.Echeance;
import com.kredia.entity.credit.KycLoan;
import com.kredia.repository.CreditRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class CreditExcelExportService {

    private final CreditRepository creditRepository;

    @Autowired
    public CreditExcelExportService(CreditRepository creditRepository) {
        this.creditRepository = creditRepository;
    }

    public byte[] generateCreditExcel(Long creditId) throws IOException {
        Credit credit = creditRepository.findById(creditId)
                .orElseThrow(() -> new RuntimeException("Crédit non trouvé : " + creditId));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Style Header
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Sheet 1: Informations Crédit
            createCreditInfoSheet(workbook, credit, headerStyle);

            // Sheet 2: Échéancier
            createEcheancierSheet(workbook, credit.getEcheances(), headerStyle);

            // Sheet 3: Documents KYC
            createKycLoanSheet(workbook, credit.getKycLoanDocuments(), headerStyle);

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private void createCreditInfoSheet(Workbook workbook, Credit credit, CellStyle headerStyle) {
        Sheet sheet = workbook.createSheet("Informations Crédit");
        int rowIdx = 0;

        String[][] creditData = {
                { "ID Crédit", String.valueOf(credit.getCreditId()) },
                { "Montant", credit.getAmount() != null ? credit.getAmount().toString() : "" },
                { "Taux d'intérêt (%)", credit.getInterestRate() != null ? credit.getInterestRate().toString() : "" },
                { "Date de début", credit.getStartDate() != null ? credit.getStartDate().toString() : "" },
                { "Date de fin", credit.getEndDate() != null ? credit.getEndDate().toString() : "" },
                { "Durée (mois)", credit.getTermMonths() != null ? String.valueOf(credit.getTermMonths()) : "" },
                { "Type de remboursement", credit.getRepaymentType() != null ? credit.getRepaymentType().name() : "" },
                { "Mensualité", credit.getMonthlyPayment() != null ? credit.getMonthlyPayment().toString() : "" },
                { "Statut", credit.getStatus() != null ? credit.getStatus().name() : "" },
                { "Iincome", credit.getIncome() != null ? credit.getIncome().toString() : "" },
                { "ependents", credit.getDependents() != null ? String.valueOf(credit.getDependents()) : "" },
                { "Date de création", credit.getCreatedAt() != null ? credit.getCreatedAt().toString() : "" }
        };

        for (String[] data : creditData) {
            Row row = sheet.createRow(rowIdx++);
            Cell cellLabel = row.createCell(0);
            cellLabel.setCellValue(data[0]);
            cellLabel.setCellStyle(headerStyle);

            Cell cellValue = row.createCell(1);
            cellValue.setCellValue(data[1]);
        }
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void createEcheancierSheet(Workbook workbook, List<Echeance> echeances, CellStyle headerStyle) {
        Sheet sheet = workbook.createSheet("Échéancier");

        // Header
        Row headerRow = sheet.createRow(0);
        String[] columns = { "Numéro", "Date", "Capital Début", "Mensualité", "Amortissement", "Intérêt",
                "Solde Restant", "Statut", "Montant Payé", "Date de Paiement" };
        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data
        int rowIdx = 1;
        if (echeances != null) {
            for (Echeance e : echeances) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(e.getEcheanceNumber() != null ? e.getEcheanceNumber() : 0);
                row.createCell(1).setCellValue(e.getDueDate() != null ? e.getDueDate().toString() : "");
                row.createCell(2).setCellValue(e.getCapitalDebut() != null ? e.getCapitalDebut().doubleValue() : 0.0);
                row.createCell(3).setCellValue(e.getAmountDue() != null ? e.getAmountDue().doubleValue() : 0.0);
                row.createCell(4).setCellValue(e.getPrincipalDue() != null ? e.getPrincipalDue().doubleValue() : 0.0);
                row.createCell(5).setCellValue(e.getInterestDue() != null ? e.getInterestDue().doubleValue() : 0.0);
                row.createCell(6)
                        .setCellValue(e.getRemainingBalance() != null ? e.getRemainingBalance().doubleValue() : 0.0);
                row.createCell(7).setCellValue(e.getStatus() != null ? e.getStatus().name() : "");
                row.createCell(8).setCellValue(e.getAmountPaid() != null ? e.getAmountPaid().doubleValue() : 0.0);
                row.createCell(9).setCellValue(e.getPaidAt() != null ? e.getPaidAt().toString() : "");
            }
        }

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createKycLoanSheet(Workbook workbook, List<KycLoan> kycLoans, CellStyle headerStyle) {
        Sheet sheet = workbook.createSheet("Documents KYC");

        // Header
        Row headerRow = sheet.createRow(0);
        String[] columns = { "ID Document", "Type", "Chemin d'accès", "Statut", "Date de soumission" };
        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data
        int rowIdx = 1;
        if (kycLoans != null) {
            for (KycLoan kyc : kycLoans) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(kyc.getKycLoanId() != null ? String.valueOf(kyc.getKycLoanId()) : "");
                row.createCell(1).setCellValue(kyc.getDocumentType() != null ? kyc.getDocumentType().name() : "");
                row.createCell(2).setCellValue(kyc.getDocumentPath() != null ? kyc.getDocumentPath() : "");
                row.createCell(3).setCellValue(kyc.getVerifiedStatus() != null ? kyc.getVerifiedStatus().name() : "");
                row.createCell(4).setCellValue(kyc.getSubmittedAt() != null ? kyc.getSubmittedAt().toString() : "");
            }
        }

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
}
