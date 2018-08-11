const renderContents = async (path: string ,contents: string): Promise<string> => {
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
}

export default renderContents;