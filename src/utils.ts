function reg_exp_escape(raw_str: string): string {
    return raw_str.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
}


export {
    reg_exp_escape,
}