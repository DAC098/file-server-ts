const renderContents = async (path, contents) => {
    return `
    <!DOCTYPE html>
    <html lang='en'>
        <head>
            <title>file server, path: ${path}</title>
        </head>
        <body>
            ${contents}
        </body>
    </html>`;
};
export default renderContents;
