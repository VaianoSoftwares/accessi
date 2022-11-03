export default (() => (id: string) => {
  const table = document.querySelector(`div#${id} table`);
  if (table === null) return;

  const html = table.outerHTML;
  window.open(
    `data:application/vnd.ms-excel;base64,${Buffer.from(html).toString(
      "base64"
    )}`
  );
})();
