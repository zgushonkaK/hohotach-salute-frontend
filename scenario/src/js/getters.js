function get_request(context) {
    if (context && context.request)
        return context.request.rawRequest;
    return {}
}

function get_text(request){
if (request &&
        request.payload &&
        request.payload.meta &&
        request.payload.meta.current_app &&
        request.payload.meta.current_app.state &&
        request.payload.meta.current_app.state.joke){
        return request.payload.meta.current_app.state.joke.text;
    }
    return 'test data';
}