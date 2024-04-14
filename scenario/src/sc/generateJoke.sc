theme: /
    state: ГенерацияАнекдота
        q!: (выведи | расскажи | придумай) анекдот
        
        a: выполняю
        
        script:
            generateJoke($context);