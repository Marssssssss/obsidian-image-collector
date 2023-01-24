// 可以试着接下 obsidian 里面自带的 FileSystemAdapter
import path from "path";
import url from "./url";


const new_line_reg_exp = /(?:\r\n)|\n/g;


function reg_exp_escape(raw_str: string): string {
    return raw_str.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
}


function norm_path_sep(path_str: string): string {
    return path_str.replace(new RegExp(reg_exp_escape(path.sep), "g"), "/");
}


function encode_markdown_uri(raw_str: string): string {
    return raw_str.replace(/\s/g, "%20");
}

function decode_markdown_uri(raw_str: string): string {
    return raw_str.replace(/%20/g, " ");
}

function is_url(url_str: string): boolean {
    return url().test(url_str);
}

let utils: any = {};
// const
utils.new_line_reg_exp = new_line_reg_exp;
// function
utils.reg_exp_escape = reg_exp_escape;
utils.norm_path_sep = norm_path_sep;
utils.is_url = is_url;
utils.encode_markdown_uri = encode_markdown_uri;
utils.decode_markdown_uri = decode_markdown_uri;

export default utils;