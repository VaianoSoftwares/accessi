export default (() => (id: string) => {
  const table = document.getElementById(id);
  if (table === null) return;

  const html = table.outerHTML;

  window.Buffer = window.Buffer || require("buffer/").Buffer;

  window.open(
    `data:application/vnd.ms-excel;base64,${window.Buffer.from(html).toString(
      "base64"
    )}`
  );
})();
