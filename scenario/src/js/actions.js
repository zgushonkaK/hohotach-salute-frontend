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