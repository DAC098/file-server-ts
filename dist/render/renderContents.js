;
const renderContents = async (path, contents, resources = []) => {
    let res_list = "";
    for (let item of resources) {
        if (item.type === "script") {
            res_list += `<script type="application/javascript" src="${item.link}"></script>\n`;
        }
        else if (item.type === 'stylesheet') {
            res_list += `<link rel="stylesheet" type="text/css" href="${item.link}">\n`;
        }
    }
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <title>file server, path: ${path}</title>
            <script type="application/javascript" src="/assets/main.js"></script>
            ${res_list}
        </head>
        <body>
            ${contents}
        </body>
    </html>`;
};
export default renderContents;
