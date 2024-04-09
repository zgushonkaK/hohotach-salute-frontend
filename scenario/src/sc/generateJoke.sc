theme: /
    state: ГенерацияАнекдота
        q!: (~выведи|~расскажи)
            [анекдот]
        
        a: выполняю
        
        script:
            generateJoke($context);