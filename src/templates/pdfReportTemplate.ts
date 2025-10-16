export interface PDFTemplateData {
  salas: any[];
  salasAtivas: any[];
  salasInativas: any[];
  salasStats: {
    total: number;
    limpas: number;
    pendentes: number;
    sujas: number;
    emLimpeza: number;
    inativas: number;
    percentualLimpas: number;
  };
  user: any;
}

export const generatePDFTemplate = (data: PDFTemplateData): string => {
  const { salas, salasAtivas, salasInativas, salasStats } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório Geral de Salas - SENAC</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
          color: #1f2937;
        }
        .senac-logo {
          width: 160px;
          height: 160px;
          object-fit: contain;
          margin-bottom: 10px;
        }
        .header {
          background: #1e40af;
          color: white;
          text-align: center;
          padding: 30px 20px 30px 20px;
          margin-bottom: 0;
        }
        .header h1 {
          color: white;
          font-size: 24px;
          margin: 0 0 5px 0;
          font-weight: bold;
        }
        .header h2 {
          color: #e2e8f0;
          font-size: 16px;
          margin: 0 0 10px 0;
          font-weight: normal;
        }
        .header .date {
          color: #cbd5e1;
          font-size: 12px;
          margin: 0;
        }
        .content {
          padding: 20px;
        }
        .info-section {
          margin-bottom: 20px;
        }
        .info-section h3 {
          color: #1f2937;
          font-size: 18px;
          margin: 0;
          font-weight: 600;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        .stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
          background-color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .table th {
          background: #1e40af;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        .table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-limpa {
          background-color: #dcfce7;
          color: #166534;
        }
        .status-suja {
          background-color: #fef2f2;
          color: #dc2626;
        }
        .status-pendente {
          background-color: #fef3c7;
          color: #d97706;
        }
        .status-limpeza-pendente {
          background-color: #fef3c7;
          color: #f59e0b;
          font-weight: bold;
        }
        .status-em-limpeza {
          background-color: #dbeafe;
          color: #2563eb;
        }
        .status-inativa {
          background-color: #f3f4f6;
          color: #6b7280;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }
        .summary {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .summary h4 {
          color: #1f2937;
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          padding: 4px 0;
        }
        .summary-value {
          font-weight: 600;
          color: #1f2937;
        }
        .icon {
          display: inline-block;
          width: 16px;
          height: 16px;
          margin-right: 6px;
          vertical-align: middle;
        }
        .section-title {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img class="senac-logo" src="https://portaldaautopeca.com.br/wp-content/uploads/2023/12/senac.png" alt="Senac Logo branco" />
        <h1>Relatório Geral de Salas</h1>
        <h2>Sistema de Zeladoria SENAC</h2>
        <p class="date">Gerado em: ${new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>

      <div class="content">

      <div class="info-section">
        <div class="section-title">
          <svg class="icon" viewBox="0 0 24 24" fill="#1f2937">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
          <h3>Resumo Executivo</h3>
        </div>
        <div class="summary">
          <h4>Estatísticas Gerais</h4>
          <div class="summary-item">
            <span>Total de Salas Cadastradas:</span>
            <span class="summary-value">${salas.length}</span>
          </div>
          <div class="summary-item">
            <span>Salas Ativas:</span>
            <span class="summary-value">${salasAtivas.length}</span>
          </div>
          <div class="summary-item">
            <span>Salas Inativas:</span>
            <span class="summary-value">${salasInativas.length}</span>
          </div>
          <div class="summary-item">
            <span>Eficiência de Limpeza:</span>
            <span class="summary-value">${salasStats.percentualLimpas}%</span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="section-title">
          <svg class="icon" viewBox="0 0 24 24" fill="#1f2937">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
          <h3>Estatísticas por Status</h3>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${salasStats.limpas}</div>
            <div class="stat-label">Salas Limpas</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${salasStats.pendentes}</div>
            <div class="stat-label">Pendentes</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${salasStats.sujas}</div>
            <div class="stat-label">Sujas</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${salasStats.emLimpeza}</div>
            <div class="stat-label">Em Limpeza</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="section-title">
          <svg class="icon" viewBox="0 0 24 24" fill="#1f2937">
            <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
          </svg>
          <h3>Detalhamento das Salas</h3>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Sala</th>
              <th>Status</th>
              <th>Última Limpeza</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            ${salas.map(sala => `
              <tr>
                <td><strong>${sala.nome_numero}</strong></td>
                <td>
                  <span class="status-badge ${sala.status_limpeza === 'Limpeza Pendente' ? 'status-limpeza-pendente' : `status-${sala.status_limpeza?.toLowerCase().replace(' ', '-') || 'inativa'}`}">
                    ${sala.status_limpeza || 'Inativa'}
                  </span>
                </td>
                <td>${sala.ultima_limpeza_data_hora ? new Date(sala.ultima_limpeza_data_hora).toLocaleDateString('pt-BR') : 'N/A'}</td>
                <td>${sala.detalhes_suja?.observacoes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      </div>

      <div class="footer">
        <p>Relatório gerado automaticamente pelo Sistema de Zeladoria SENAC</p>
        <p>Para mais informações, acesse o aplicativo móvel</p>
      </div>
    </body>
    </html>
  `;
};
