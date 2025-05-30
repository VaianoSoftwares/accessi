function extractDate(date: Date) {
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

function extractTime(date: Date) {
  return `${date.getHours().toString().padStart(2, "0")}:${(
    date.getMinutes() + 1
  )
    .toString()
    .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

export default function printPrestitoReport<T extends Record<string, any>>(
  array: T[]
) {
  if (array.length === 0) {
    console.error("No data available");
    return;
  }

  let fullDateIn = new Date(array[0]["data_in"]);
  if (isNaN(fullDateIn.getTime())) {
    fullDateIn = new Date();
  }
  const dateIn = extractDate(fullDateIn);
  const timeIn = extractTime(fullDateIn);

  const name = array[0]["nome"] || "";
  const surname = array[0]["cognome"] || "";
  const ragSoc = array[0]["ditta"] || "";

  const rows = array
    .map(
      (obj) => `<tr>
        <td>${name}</td><td>${surname}</td><td>${ragSoc}</td><td>${dateIn}</td><td>${timeIn}</td>
        <td>${obj["chiave"] || ""}</td><td></td><td></td><td></td><td></td>
    </tr>`
    )
    .join("");

  const htmlTable = `
    <table border="1" style="border-collapse: collapse; width: 100%;">
        <thead><tr><th>CONSEGNA CHIAVI N.P.G-FI</th></tr></thead>
        <tbody>
            <tr>
                <th>NOME</th><th>COGNOME</th><th>COGNOME</th>DITTA/DIPENDENTE</th><th>DATA CONSEGNA</th><th>ORA CONSEGNA</th>
                <th>CHIAVE N°</th><th>FIRMA CONSEGNA</th><th>FIRMA RESTITUZIONE</th><th>DATA RESTITUZIONE</th><th>ORA RESTITUZIONE</th>
            </tr>
            ${rows}
        </tbody>
    </table>
  `;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    console.error("Couldn't open print prestito report window");
    return;
  }

  printWindow.document.write(`
    <html>
    <head>
      <title>Stampa Tabella</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        table th, table td { padding: 8px; text-align: left; }
      </style>
    </head>
    <body>
      ${htmlTable}
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          }
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
