function generateJoke(context){
    addAction({
        type: "generate_joke"
    }, context);
}

function initializeUser(id, context){
    addAction({
        type: "initialize_user",
        id: id
    }, context);
}

function openFavorites(context){
    addAction({
        type: "open_favorites"
    }, context);
}

function closeFavorites(context){
    addAction({
        type: "close_favorites"
    }, context);
}

function addFavorite(context){
    addAction({
        type: "add_favorite"
    }, context);
}