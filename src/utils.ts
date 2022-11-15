import path from "path";


function reg_exp_escape(raw_str: string): string {
    return raw_str.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
}


function norm_path_sep(path_str: string): string {
    return path_str.replace(new RegExp(reg_exp_escape(path.sep), "g"), "/");
}


export {
    reg_exp_escape,
    norm_path_sep,
}