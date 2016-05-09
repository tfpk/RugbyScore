PROP_TYPES = ['image', 'title_text', 'tries_score', 'convs_score', 'penal_score', 'total_score'];
ALL_PROPS = R.flatten(R.map(ab_value, PROP_TYPES));
DEFAULT_IMAGE = "SGS";
DEFAULT_DISPLAY = 'score';
DISPLAYS = ['score'];
var default_value = R.cond([
    [R.contains('score'), R.always(0)],
    [R.contains('image'), R.always(DEFAULT_IMAGE)],
    [R.T, R.always("")]
]);
var url_for_display = R.cond([
    [R.equals('score'), R.always('present_scores.html')],
    [R.T, R.always([])]
]);
function img_format(img){
    return 'Logos/'+img+'.jpg'
}
function open_in_pop(url){
    window.open(url, "SGS_SPORT", height=1152, width=2048, scrollbars=0, toolbar=0);
}
function open_display(){
    open_in_pop(url_for_display(localStorage.displayControl))
}
function image_change(side){
    document.getElementById(side+'_image_pre').src = img_format(document.getElementById(side+'_image').value);
}
function ab_value(v){
    return ["A_"+v, "B_"+v]
}
function set_default(){
    var should_reset = R.compose(R.not(), R.has(R.__, localStorage));
    for (var n = 0; n < ALL_PROPS.length; n++){
        if (should_reset(ALL_PROPS[n])){
            localStorage.setItem(ALL_PROPS[n], default_value(ALL_PROPS[n]))
        }
    }
    if (should_reset('displayControl')){
        localStorage.setItem('displayControl', DEFAULT_DISPLAY)
    }
    if (should_reset('half_text')){
        localStorage.setItem('half_text', "")
    }
}
function set_all_default(){
    for (var n = 0; n < ALL_PROPS.length; n++){
        localStorage.setItem(ALL_PROPS[n], default_value(ALL_PROPS[n]))
    }
    localStorage.setItem('displayControl', DEFAULT_DISPLAY);
    localStorage.setItem('half_text', "");

}
function load_control_values(){
    set_default();
    var values = R.map(R.prop(R.__, localStorage))(ALL_PROPS);
    for (var i = 0; i < ALL_PROPS.length; i++){
        var prop = document.getElementById(ALL_PROPS[i]);
        if (R.contains('image', ALL_PROPS[i])){
            prop.value = values[i];
            image_change(ALL_PROPS[i][0])
        }
        if (R.contains('title_text', ALL_PROPS[i])) prop.value = values[i];
        if (R.contains('score', ALL_PROPS[i])) prop.innerHTML = values[i];
    }
    var dsettings = localStorage.displayControl;
    for (var i = 0; i < document.getElementById('controlForm').elements.length; i++){
        var element = document.getElementById('controlForm').elements[i];
        if (element.value === dsettings){
            element.checked = true;
            break
        }
    }
    document.getElementById('half_text').value = localStorage.half_text;

}
function load_present_values(){
    set_default();
    var values = R.map(R.prop(R.__, localStorage))(ALL_PROPS);
    for (var i = 0; i < ALL_PROPS.length; i++){
        var prop = document.getElementById(ALL_PROPS[i]);
        if (R.contains('image', ALL_PROPS[i])) prop.src = img_format(values[i]);
        if (R.contains('title_text', ALL_PROPS[i])) prop.innerHTML = values[i];
        if (R.contains('score', ALL_PROPS[i])) prop.innerHTML = values[i];
    }
    document.getElementById('half_text').innerHTML = localStorage.half_text;
}
function save_top(){
    var names = R.flatten(R.append('half_text', R.map(ab_value, ['image', 'title_text'])));
    var values = R.map(R.pipe(
        R.curry(R.bind(document.getElementById, document)),
        R.prop('value')
    ))(names);
    for (var i = 0; i < names.length; i++){
        localStorage.setItem(names[i], values[i]);
    }
}
var multiplier = R.cond([
    [R.contains('tries'), R.always(5)],
    [R.contains('penal'), R.always(3)],
    [R.contains('convs'), R.always(2)],
]);
function score(update, f){
    var team = update[0];
    var total_addr = team + '_total_score';
    localStorage.setItem(update, f(localStorage.getItem(update)));
    localStorage.setItem(total_addr, R.add(localStorage.getItem(total_addr), R.multiply(f(0), multiplier(update))));
    load_control_values();
    if (localStorage.displayControl == 'score'){
        open_display();
    }
}
function reset(){
    if (confirm("This will remove all scores and reset team names.\nAre you sure?")){
        set_all_default();
        load_control_values();
    }
}