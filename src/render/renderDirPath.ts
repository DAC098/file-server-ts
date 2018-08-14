const renderDirPath = (path: string): string => {
    let path_split = path.split(/[\/\\]/);
    let dir_list_html = [];
    let href_appending = '/fs';

    for(let i = 0, len = path_split.length - 1; i < len; ++i) {
        let dir = path_split[i];
        let name = dir.length === 0 ? 'root' : dir;
        
        if(dir.length !== 0)
            href_appending += '/' + dir;

        dir_list_html.push(`<a style='padding-right: 8px;' href='${href_appending}'>${name}</a>`);
    }

    return dir_list_html.join('');
}

export default renderDirPath