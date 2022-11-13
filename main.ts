import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";
import fs from "fs-extra";
import os from "os";


function reg_exp_escape(raw_str: string): string {
    return raw_str.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
}


interface Block {
    get_content(): string
}


class CommonBlock implements Block {
    private content: string

    constructor(content: string) {
        this.content = content;
    }

    public get_content(): string{
        return this.content;
    }
}


class ImageBlock implements Block{
    private src: string
    private alt: string
    private title: string

    constructor(src: string, alt: string, title: string) {
        this.src = src;
        this.alt = alt;
        this.title = title;
    }

    public get_content(): string {
        return `![${this.alt}](${this.src}` + (this.title ? ` "${this.title}" `: "") + `)`;
    }
}


class MarkdownFiles {
    md: MarkdownIt

    constructor() {
        this.md = new MarkdownIt();
    }

    // parse markdown text to blocks(common text or image text)
    private _parse(content: string): Block[] | null {
        let blocks: Block[] = [];

        // parse content
        let result: Token[] = this.md.parse(content, {});
        let line_split: string[] = content.split(os.EOL);
        let last_end_line: number = 1; // first token should not get head LF

        result.forEach((token: Token) => {
            if (token.nesting != 0) {
                // in markdown-it, nesting != 0 means it is a tag token, but does not relate to markdown origin content
                return;
            }

            if (token.type != "inline") {
                // insert lines directly
                if (!token.map) return;

                let start_line: number = token.map[0];
                let end_line: number = token.map[1];
                let block_content: string = line_split.slice(start_line, end_line).join(os.EOL);

                if (start_line >= last_end_line) {
                    block_content = os.EOL.repeat(start_line - last_end_line + 1) + block_content;
                }
                last_end_line = end_line;

                blocks.push(new CommonBlock(block_content));
                return
            }

            // token.type == "inline"
            if (!token.children) return;
            if (!token.map) return;

            let start_line: number = token.map[0];
            let end_line: number = token.map[1];
            let token_content = line_split.slice(start_line, end_line).join(os.EOL);

            if (start_line >= last_end_line) {
                token_content = os.EOL.repeat(start_line - last_end_line + 1) + token_content;
            }
            last_end_line = end_line;

            // scan for image content
            let bfs: Token[] = token.children;
            while (bfs.length != 0) {
                let next_token: Token = bfs[0];
                bfs = bfs.slice(1);

                // if next_token is image, add ImageBlock and return
                if (next_token.type == "image") {
                    let src: string = "";
                    let alt: string = next_token.content;
                    let title: string = "";

                    if (next_token.attrs) {
                        for (let i of next_token.attrs) {
                            switch (i[0]) {
                                case "src":
                                    src = i[1];
                                    break;
                                case "title":
                                    title = i[1];
                                    break
                            }
                        }
                    }

                    // regular expression match image content, and push all block
                    let exp: RegExp = new RegExp('!\\[\\s*?' + reg_exp_escape(alt) + '\\s*?\\]' + '\\(\\s*?' + reg_exp_escape(src) + '\\s*?' + '"?' + reg_exp_escape(title) + '"?\\s*?\\)');
                    let match_info: RegExpExecArray | null = exp.exec(token_content);
                    if (match_info == null) {
                        console.log("error: image regular expression match failed!");
                        return null;
                    }
                    let image_content: string = match_info[0];
                    let image_content_index: number = match_info.index;
                    let ahead_block_content: string = token_content.slice(0, image_content_index);
                    token_content = token_content.slice(image_content_index + image_content.length);

                    // push ahead common block and image block
                    blocks.push(new CommonBlock(ahead_block_content));
                    blocks.push(new ImageBlock(src, alt, title));
                }

                if (next_token.children) {
                    // if is not image, add children
                    bfs = next_token.children.concat(bfs);
                }
            }

            // push last common block
            blocks.push(new CommonBlock(token_content));
        });

        return blocks;
    }

    // unparse blocks to markdown text
    private _unparse(blocks: Block[]): string {
        let content: string = "";
        blocks.forEach((block: Block) => {
           content += block.get_content(); 
        })
        return content;
    }

    // copy test
    // JUST TEST!!!!!!! REMEMBER TO DELETE IT !!!!!
    public copy(src: string, desc: string): boolean {
        let input: string = fs.readFileSync(src).toString();
        let blocks: Block[] | null = this._parse(input);
        console.log(blocks);

        if (!blocks) return false;

        let origin_content: string = this._unparse(blocks);
        fs.writeFileSync(desc, origin_content);

        console.log(input == origin_content);
        return true;
    }
}


var files = new MarkdownFiles();
files.copy("test.md", "copied_test.md");