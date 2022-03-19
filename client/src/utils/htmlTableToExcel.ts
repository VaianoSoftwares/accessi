const htmlTableToExcel = (id: string) => {
    const table = document.getElementById(id) as HTMLTableElement;
    const html = table.outerHTML;
    window.open(
      `data:application/vnd.ms-excel;base64,${Buffer.from(html).toString(
        "base64"
      )}`
    );
};

export default htmlTableToExcel;