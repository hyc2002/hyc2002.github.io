const fs = require('fs');
const { marked } = require('marked');
const bibtexParser = require('bibtex-parse');
const inquirer = require('inquirer');

// 询问用户是否添加头像  
inquirer.prompt([
    {
        type: 'confirm',
        name: 'addAvatar',
        message: '是否要要添加头像?',
        default: true
    },
    {
        type: 'list',
        name: 'theme',
        message: '请选择主题:',
        choices: ['Github', 'Dark(暗夜黑)', 'Condensed(淀紫)', 'Cyanosis(绀蓝)'],
        default: 'Github'
    }
])
    .then(config => {
        output(config);

    });
async function output(config) {

    // 读取 Markdown 文件
    const markdownContent = fs.readFileSync('data/example.md', 'utf8');

    // 读取 BibTeX 文件
    const bibtexContent = fs.readFileSync('data/references.bib', 'utf8');

    const theme = fs.readFileSync(`theme/${config.theme.replace(/\(.*?\)/g, '')}.css`, 'utf8');

    const avatar = `<style>
/* 圆形头像样式 */
.avatar {
    display: block;
    margin-right: 50px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: url('avatar.jpg') no-repeat center center;
    background-size: cover;
    border: 2px solid #fff;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}
</style>
<div class="avatar"></div> <!-- 这里插入圆形头像 -->
`

    // 使用 bibtex-parse 解析 BibTeX 文件
    const bibEntries = bibtexParser.parse(bibtexContent);

    // 创建一个函数来将 BibTeX 引用转换为 Markdown 格式
    function bibtexToMarkdown(citeKey) {
        const entry = bibEntries.find(entry => entry.key === citeKey);
        if (entry) {
            // 假设我们仅返回引用键作为占位符
            // 在实际应用中，你可能希望返回更详细的信息，如作者、年份等
            // console.log(entry)
            // return `[@${citeKey}]`;

            return render(entry)

        } else {
            // 如果找不到引用，则添加问号
            return `[@?${citeKey}?]`;
        }
    }

    // 替换 Markdown 中的 BibTeX 引用
    const processedMarkdown = markdownContent.replace(/@\{(.*?)\}/g, (match, citeKey) => {
        return bibtexToMarkdown(citeKey);
    });


    function render(entry) {
        // `**${entry.fields[0].value}**\n`

        function getValue(key, left = '', right = '') {
            const field = entry.fields.find(v => v.name === key)
            if (field) {
                return left + field.value + right
            } else {
                return ''
            }
        }

        // return '- ' + entry.fields.map(v => `${v.value} `).join() + '\n'
        return `- ${getValue('author')}, ${getValue('year', '(', ').')}  ${getValue('title')}, ${getValue('journal', '*', '*,')} ${getValue('volume', '', ', ')}${getValue('pages', '', '.')}\n`


    }

    // 输出处理后的 Markdown 内容
    // console.log(processedMarkdown);

    // 如果你需要生成 HTML，可以使用一个 Markdown 转 HTML 的库，如 marked
    const htmlContent = marked(processedMarkdown);

    let output = `<style>${theme}</style>`
    if (config.addAvatar) {
        output += avatar
    }
    output += htmlContent


    fs.writeFileSync('output.html', output, 'utf8')

}

