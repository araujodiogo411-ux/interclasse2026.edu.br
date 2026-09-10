import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../types';

export function generateOrdersPDF(orders: Order[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const sortedOrders = [...orders].sort((a, b) => a.number - b.number);
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR');
  const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Header Banner Background (Obsidian & Pink accents)
  doc.setFillColor(15, 15, 20);
  doc.rect(0, 0, 210, 38, 'F');

  // Pink aesthetic line
  doc.setFillColor(244, 114, 182);
  doc.rect(0, 37, 210, 1.8, 'F');

  // School / Event Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('INTERCLASSE 2026', 14, 14);

  // Subtitle
  doc.setTextColor(244, 114, 182);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('7° ANO JAPÃO (COREIA DO SUL) • RAPOSA DO ÁRTICO', 14, 21);

  doc.setTextColor(200, 200, 210);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Relatório Oficial de Confecção de Camisas e Numeração', 14, 27);
  doc.text(`Emitido em: ${dateFormatted} às ${timeFormatted}`, 14, 33);

  // Right side badge in header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`${orders.length} / 100`, 196, 17, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(244, 114, 182);
  doc.text('CAMISAS ESCOLHIDAS', 196, 23, { align: 'right' });

  // Summary Cards section
  const startY = 46;
  doc.setDrawColor(220, 220, 230);
  doc.setFillColor(250, 250, 252);

  // Total confirmed card
  doc.roundedRect(14, startY, 58, 18, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 110);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL DE INSCRITOS', 18, startY + 6);
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 25);
  doc.setFont('helvetica', 'bold');
  doc.text(`${orders.length} alunos`, 18, startY + 14);

  // Remaining available card
  doc.roundedRect(76, startY, 58, 18, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 110);
  doc.setFont('helvetica', 'normal');
  doc.text('NÚMEROS DISPONÍVEIS', 80, startY + 6);
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129); // emerald
  doc.setFont('helvetica', 'bold');
  doc.text(`${100 - orders.length} disponíveis`, 80, startY + 14);

  // Class info card
  doc.roundedRect(138, startY, 58, 18, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 110);
  doc.setFont('helvetica', 'normal');
  doc.text('TURMA & TEMA', 142, startY + 6);
  doc.setFontSize(10);
  doc.setTextColor(236, 72, 153);
  doc.setFont('helvetica', 'bold');
  doc.text('7° Ano • Japão/Coreia', 142, startY + 14);

  // Table rows
  const tableData = sortedOrders.map((order, index) => [
    `#${index + 1}`,
    `Nº ${order.number}`,
    order.studentName,
    order.shirtName,
    order.size,
    new Date(order.createdAt).toLocaleDateString('pt-BR'),
  ]);

  autoTable(doc, {
    startY: startY + 24,
    head: [['Item', 'Número', 'Nome do Aluno', 'Nome na Camisa', 'Tamanho', 'Data']],
    body: tableData.length > 0 ? tableData : [['-', '-', 'Nenhuma camisa cadastrada ainda.', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [18, 18, 24],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 14, fontSize: 8 },
      1: { halign: 'center', fontStyle: 'bold', cellWidth: 20, textColor: [236, 72, 153] },
      2: { halign: 'left', fontStyle: 'bold', cellWidth: 58 },
      3: { halign: 'left', cellWidth: 42 },
      4: { halign: 'center', fontStyle: 'bold', cellWidth: 32 },
      5: { halign: 'center', fontSize: 8, cellWidth: 20 },
    },
    alternateRowStyles: {
      fillColor: [249, 250, 252],
    },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 3,
      valign: 'middle',
    },
  });

  // Size breakdown summary at the end
  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 160;

  if (finalY < 250) {
    doc.setDrawColor(230, 230, 235);
    doc.setFillColor(248, 249, 251);
    doc.roundedRect(14, finalY, 182, 22, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 50);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo de Tamanhos de Camisas:', 18, finalY + 6);

    const sizeCounts: Record<string, number> = {};
    orders.forEach((o) => {
      sizeCounts[o.size] = (sizeCounts[o.size] || 0) + 1;
    });

    const sizesSummary = Object.entries(sizeCounts)
      .map(([size, count]) => `${size}: ${count}`)
      .join('  •  ');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 90);
    doc.text(sizesSummary || 'Nenhum tamanho registrado.', 18, finalY + 14, { maxWidth: 174 });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 150);
    doc.text(
      `Interclasse 2026 - 7° Ano Japão (Coreia do Sul) | Raposa do Ártico • Página ${i} de ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Trigger download
  doc.save(`Interclasse_2026_7Ano_Japao_Coreia_Camisas_${dateFormatted.replace(/\//g, '-')}.pdf`);
}
