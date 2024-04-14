function get_favourites(request){
if (request &&
        request.payload &&
        request.payload.meta &&
        request.payload.meta.current_app &&
        request.payload.meta.current_app.state &&
        request.payload.meta.current_app.state.item_selector){
        return request.payload.meta.current_app.state.item_selector.favourites;
    }
    return null;
}