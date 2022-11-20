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


function is_directory(path: string): boolean {
    let stat: fs.Stats = fs.lstatSync(path);
    if (stat.isFile()) {
        return false;
    }
    return true;
}


function is_file(path: string): boolean {
    let stat: fs.Stats = fs.lstatSync(path);
    if (stat.isFile()) {
        return true;
    }
    return false;
}


function trans_url_space_to_path_space(path: string): string {
    return path.replace(/%20/g, " ");
}


// suffix should be .ext format
function collect_files(dir_path: string, suffix: string): string[] {
    let paths: string[] = fs.readdirSync(dir_path);
    let final_paths: string[] = [];

    paths.forEach((item: string) => {
        let full_path = path.join(dir_path,item);
        let stat: fs.Stats = fs.lstatSync(full_path);
        if (stat.isFile() && path.extname(full_path) == suffix) {
            final_paths.push(full_path);
        } else if (stat.isDirectory()) {
            final_paths = final_paths.concat(collect_files(full_path, suffix));
        }
    });

    return final_paths;
}


let utils: any = {};
// const
utils.new_line_reg_exp = new_line_reg_exp;
// function
utils.reg_exp_escape = reg_exp_escape;
utils.norm_path_sep = norm_path_sep;
utils.is_url = is_url;
utils.is_directory = is_directory;
utils.is_file = is_file;
utils.collect_files = collect_files;
utils.trans_url_space_to_path_space = trans_url_space_to_path_space;

export default utils;