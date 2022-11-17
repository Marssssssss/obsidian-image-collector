import utils from "./utils";

// markdown content block
interface Block {
    get_content(): string
}


class CommonBlock implements Block {
    public content: string

    constructor(content: string) {
        this.content = content;
    }

    public get_content(): string{
        return this.content;
    }
}


class ImageBlock implements Block{
    public src: string
    public alt: string
    public title: string

    constructor(src: string, alt: string, title: string) {
        this.src = src;
        this.alt = alt;
        this.title = title;
    }

    public get_content(): string {
        return `![${this.alt}](${utils.norm_path_sep(this.src)}` + (this.title ? ` "${this.title}" `: "") + `)`;
    }
}


export {Block, CommonBlock, ImageBlock}