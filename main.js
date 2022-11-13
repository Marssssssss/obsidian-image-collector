"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_it_1 = __importDefault(require("markdown-it"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = __importDefault(require("os"));
function reg_exp_escape(raw_str) {
    return raw_str.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
}
class CommonBlock {
    constructor(content) {
        this.content = content;
    }
    get_content() {
        return this.content;
    }
}
class ImageBlock {
    constructor(src, alt, title) {
        this.src = src;
        this.alt = alt;
        this.title = title;
    }
    get_content() {
        return `![${this.alt}](${this.src}` + (this.title ? ` "${this.title}" ` : "") + `)`;
    }
}
class MarkdownFiles {
    constructor() {
        this.md = new markdown_it_1.default();
    }
    // parse markdown text to blocks(common text or image text)
    _parse(content) {
        let blocks = [];
        // parse content
        let result = this.md.parse(content, {});
        let line_split = content.split(os_1.default.EOL);
        let last_end_line = 1; // first token should not get head LF
        result.forEach((token) => {
            if (token.nesting != 0) {
                // in markdown-it, nesting != 0 means it is a tag token, but does not relate to markdown origin content
                return;
            }
            if (token.type != "inline") {
                // insert lines directly
                if (!token.map)
                    return;
                let start_line = token.map[0];
                let end_line = token.map[1];
                let block_content = line_split.slice(start_line, end_line).join(os_1.default.EOL);
                if (start_line >= last_end_line) {
                    block_content = os_1.default.EOL.repeat(start_line - last_end_line + 1) + block_content;
                }
                last_end_line = end_line;
                blocks.push(new CommonBlock(block_content));
                return;
            }
            // token.type == "inline"
            if (!token.children)
                return;
            if (!token.map)
                return;
            let start_line = token.map[0];
            let end_line = token.map[1];
            let token_content = line_split.slice(start_line, end_line).join(os_1.default.EOL);
            if (start_line >= last_end_line) {
                token_content = os_1.default.EOL.repeat(start_line - last_end_line + 1) + token_content;
            }
            last_end_line = end_line;
            // scan for image content
            let bfs = token.children;
            while (bfs.length != 0) {
                let next_token = bfs[0];
                bfs = bfs.slice(1);
                // if next_token is image, add ImageBlock and return
                if (next_token.type == "image") {
                    let src = "";
                    let alt = next_token.content;
                    let title = "";
                    if (next_token.attrs) {
                        for (let i of next_token.attrs) {
                            switch (i[0]) {
                                case "src":
                                    src = i[1];
                                    break;
                                case "title":
                                    title = i[1];
                                    break;
                            }
                        }
                    }
                    // regular expression match image content, and push all block
                    let exp = new RegExp('!\\[\\s*?' + reg_exp_escape(alt) + '\\s*?\\]' + '\\(\\s*?' + reg_exp_escape(src) + '\\s*?' + '"?' + reg_exp_escape(title) + '"?\\s*?\\)');
                    let match_info = exp.exec(token_content);
                    if (match_info == null) {
                        console.log("error: image regular expression match failed!");
                        return null;
                    }
                    let image_content = match_info[0];
                    let image_content_index = match_info.index;
                    let ahead_block_content = token_content.slice(0, image_content_index);
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
    _unparse(blocks) {
        let content = "";
        blocks.forEach((block) => {
            content += block.get_content();
        });
        return content;
    }
    // copy test
    copy(src, desc) {
        let input = fs_extra_1.default.readFileSync(src).toString();
        let blocks = this._parse(input);
        console.log(blocks);
        if (!blocks)
            return false;
        let origin_content = this._unparse(blocks);
        fs_extra_1.default.writeFileSync(desc, origin_content);
        console.log(input == origin_content);
        return true;
    }
}
var files = new MarkdownFiles();
files.copy("test.md", "copied_test.md");
