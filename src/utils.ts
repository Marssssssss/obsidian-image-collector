// 可以试着接下 obsidian 里面自带的 FileSystemAdapter
import path from "path";
import url from "./url";
import fs from "fs-extra";


const new_line_reg_exp = /(?:\r\n)|\n/g;


function reg_exp_escape(raw_str: string): string {
    return raw_str.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
}


function norm_path_sep(path_str: string): string {
    return path_str.replace(new RegExp(reg_exp_escape(path.sep), "g"), "/");
}


function is_url(url_str: string): boolean {
    return url().test(url_str);
}


function trans_url_space_to_path_space(path_str: string): string {
    return path_str.replace(/%20/g, " ");
}

function trans_path_space_to_url_space(path_str: string): string {
    return path_str.replace(/\s/g, "%20");
}

let utils: any = {};
// const
utils.new_line_reg_exp = new_line_reg_exp;
// function
utils.reg_exp_escape = reg_exp_escape;
utils.norm_path_sep = norm_path_sep;
utils.is_url = is_url;
utils.trans_url_space_to_path_space = trans_url_space_to_path_space;
utils.trans_path_space_to_url_space = trans_path_space_to_url_space;

export default utils;