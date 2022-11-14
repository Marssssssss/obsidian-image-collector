"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageBlock = exports.CommonBlock = void 0;
class CommonBlock {
    constructor(content) {
        this.content = content;
    }
    get_content() {
        return this.content;
    }
}
exports.CommonBlock = CommonBlock;
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
exports.ImageBlock = ImageBlock;
